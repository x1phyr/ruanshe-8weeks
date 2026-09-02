"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { examConfig, STORAGE_KEY } from "@/lib/config";
import { migrateLegacyDayId } from "@/lib/calendar";
import { getPersistStorage } from "@/lib/storage";
import { addDaysISO, isISODate, todayISO } from "@/lib/dates";
import { afterComplete, emptyProgress, reviewIntervalDays } from "@/lib/progress";
import type {
  AnswerRecord,
  DaySession,
  LearnStep,
  Mistake,
  MistakeReason,
  OptionKey,
  Progress,
  Question,
} from "@/lib/types";

interface TrainerState {
  progress: Progress;
  mistakes: Mistake[];
  answers: AnswerRecord[];
  sessions: Record<string, DaySession>;
  startDate: string;
  simulateDate: string | null;
  setStartDate: (value: string) => void;
  setSimulateDate: (value: string | null) => void;
  markStep: (dayId: string, step: LearnStep) => void;
  recordAnswer: (question: Question, selected: OptionKey, today: string) => boolean;
  reviewMistakeAnswer: (
    question: Question,
    selected: OptionKey,
    today: string,
  ) => boolean;
  setMistakeReason: (questionId: string, reason: MistakeReason) => void;
  completeDay: (dayId: string) => void;
  resetAll: () => void;
}

const emptySession = (): DaySession => ({
  reviewDone: false,
  learnDone: false,
  practiceDone: false,
  wrapupDone: false,
});

function upsertMistakeOnWrong(
  list: Mistake[],
  question: Question,
  selected: OptionKey,
  today: string,
): Mistake[] {
  const existing = list.find((item) => item.questionId === question.id);
  if (!existing) {
    return [
      ...list,
      {
        questionId: question.id,
        selectedAnswer: selected,
        correctAnswer: question.correct,
        topic: question.topic,
        reason: "unknown",
        wrongCount: 1,
        nextReviewAt: addDaysISO(today, 1),
        mastered: false,
        consecutiveCorrect: 0,
        lastWrongAt: today,
      },
    ];
  }
  const wrongCount = existing.wrongCount + 1;
  return list.map((item) =>
    item.questionId === question.id
      ? {
          ...item,
          selectedAnswer: selected,
          correctAnswer: question.correct,
          topic: question.topic,
          wrongCount,
          nextReviewAt: addDaysISO(today, reviewIntervalDays(wrongCount)),
          mastered: false,
          consecutiveCorrect: 0,
          lastWrongAt: today,
        }
      : item,
  );
}

function applyReviewCorrect(
  list: Mistake[],
  questionId: string,
  today: string,
): Mistake[] {
  return list.map((item) => {
    if (item.questionId !== questionId) return item;
    const consecutiveCorrect = item.consecutiveCorrect + 1;
    if (consecutiveCorrect >= 2) {
      return {
        ...item,
        consecutiveCorrect,
        mastered: true,
        nextReviewAt: today,
      };
    }
    return {
      ...item,
      consecutiveCorrect,
      mastered: false,
      nextReviewAt: addDaysISO(today, 14),
    };
  });
}

export const useTrainerStore = create<TrainerState>()(
  persist(
    (set, get) => ({
      progress: emptyProgress(),
      mistakes: [],
      answers: [],
      sessions: {},
      startDate: "",
      simulateDate: null,
      setStartDate: (value) => {
        if (isISODate(value)) set({ startDate: value });
      },
      setSimulateDate: (value) => set({ simulateDate: value }),
      markStep: (dayId, step) => {
        const current = get().sessions[dayId] ?? emptySession();
        const next = { ...current };
        if (step === "review") next.reviewDone = true;
        if (step === "learn") next.learnDone = true;
        if (step === "practice") next.practiceDone = true;
        if (step === "wrapup") next.wrapupDone = true;
        set({ sessions: { ...get().sessions, [dayId]: next } });
      },
      recordAnswer: (question, selected, today) => {
        const correct = selected === question.correct;
        const record: AnswerRecord = {
          questionId: question.id,
          selected,
          correct,
          at: today,
          dayId: question.dayId,
        };
        set({
          answers: [...get().answers, record],
          progress: {
            ...get().progress,
            totalQuestions: get().progress.totalQuestions + 1,
            correctQuestions:
              get().progress.correctQuestions + (correct ? 1 : 0),
          },
          mistakes: correct
            ? get().mistakes
            : upsertMistakeOnWrong(get().mistakes, question, selected, today),
        });
        return correct;
      },
      reviewMistakeAnswer: (question, selected, today) => {
        const correct = selected === question.correct;
        const record: AnswerRecord = {
          questionId: question.id,
          selected,
          correct,
          at: today,
          dayId: question.dayId,
        };
        set({
          answers: [...get().answers, record],
          progress: {
            ...get().progress,
            totalQuestions: get().progress.totalQuestions + 1,
            correctQuestions:
              get().progress.correctQuestions + (correct ? 1 : 0),
          },
          mistakes: correct
            ? applyReviewCorrect(get().mistakes, question.id, today)
            : upsertMistakeOnWrong(get().mistakes, question, selected, today),
        });
        return correct;
      },
      setMistakeReason: (questionId, reason) => {
        set({
          mistakes: get().mistakes.map((item) =>
            item.questionId === questionId ? { ...item, reason } : item,
          ),
        });
      },
      completeDay: (dayId) => {
        const progress = afterComplete(get().progress, dayId);
        const session = get().sessions[dayId] ?? emptySession();
        set({
          progress,
          sessions: {
            ...get().sessions,
            [dayId]: { ...session, wrapupDone: true },
          },
        });
      },
      resetAll: () =>
        set({
          progress: emptyProgress(),
          mistakes: [],
          answers: [],
          sessions: {},
        }),
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      version: 2,
      storage: createJSONStorage(getPersistStorage),
      partialize: (state) => ({
        progress: state.progress,
        mistakes: state.mistakes,
        answers: state.answers,
        sessions: state.sessions,
        startDate: state.startDate,
        simulateDate: state.simulateDate,
      }),
      migrate: (persisted, fromVersion) => {
        const state = persisted as Partial<TrainerState>;
        if (fromVersion < 2) {
          return migratePersistedV2(state);
        }
        return {
          ...state,
          startDate: resolveStoredStartDate(state),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) {
          useTrainerStore.setState({ startDate: todayISO() });
          return;
        }
        if (!isISODate(state.startDate)) {
          useTrainerStore.setState({
            startDate: resolveStoredStartDate(state),
          });
        }
      },
    },
  ),
);

function hasStoredProgress(state: Partial<TrainerState> | undefined): boolean {
  if (!state) return false;
  return (
    (state.progress?.completedDays.length ?? 0) > 0 ||
    (state.answers?.length ?? 0) > 0 ||
    Object.keys(state.sessions ?? {}).length > 0
  );
}

function resolveStoredStartDate(state: Partial<TrainerState> | undefined): string {
  if (isISODate(state?.startDate)) return state.startDate;
  if (hasStoredProgress(state)) return examConfig.templateStart;
  return todayISO();
}

function migratePersistedV2(state: Partial<TrainerState>): Partial<TrainerState> {
  const completedDays = (state.progress?.completedDays ?? []).map(migrateLegacyDayId);
  const sessions = Object.fromEntries(
    Object.entries(state.sessions ?? {}).map(([id, session]) => [
      migrateLegacyDayId(id),
      session,
    ]),
  );
  const answers = (state.answers ?? []).map((record) => ({
    ...record,
    dayId: migrateLegacyDayId(record.dayId),
  }));
  return {
    ...state,
    progress: state.progress
      ? { ...state.progress, completedDays }
      : state.progress,
    sessions,
    answers,
    startDate: resolveStoredStartDate({ ...state, progress: state.progress
      ? { ...state.progress, completedDays }
      : state.progress, sessions, answers }),
  };
}

export function getSession(sessions: Record<string, DaySession>, dayId: string) {
  return sessions[dayId] ?? emptySession();
}

export function resolveStep(session: DaySession): LearnStep {
  if (!session.reviewDone) return "review";
  if (!session.learnDone) return "learn";
  if (!session.practiceDone) return "practice";
  return "wrapup";
}

export function currentToday(): string {
  return todayISO(useTrainerStore.getState().simulateDate);
}

export function resolvedStartDate(startDate?: string | null): string {
  return isISODate(startDate) ? startDate : todayISO();
}
