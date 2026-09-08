"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEY } from "@/lib/config";
import { getPersistStorage } from "@/lib/storage";
import { getDayById } from "@/lib/calendar";
import { addDaysISO, todayISO } from "@/lib/dates";
import { afterComplete, emptyProgress, isCompleted, isUnlocked, reviewIntervalDays } from "@/lib/progress";
import type {
  AnswerRecord,
  DaySession,
  LearnStep,
  Mistake,
  MistakeReason,
  MockRunRecord,
  OptionKey,
  Progress,
  Question,
  StudyDay,
} from "@/lib/types";

interface TrainerState {
  progress: Progress;
  mistakes: Mistake[];
  answers: AnswerRecord[];
  sessions: Record<string, DaySession>;
  simulateDate: string | null;
  startDate: string;
  /** Consecutive study days; updated via completeDay / answer activity. */
  streak: number;
  lastStudyDate: string | null;
  /** Debug: browse all days without sequential unlock. Not cleared by resetAll. */
  unlockAll: boolean;
  /** Hide app-shell sidebar / bottom nav during learn & quiz. Persisted. */
  focusMode: boolean;
  /** Plan view: hide days in completedDays. Persisted. */
  planHideDone: boolean;
  /** Slightly larger base / quiz text. Persisted; not cleared by resetAll. */
  largeText: boolean;
  /** Recent mock / large paper runs (newest first). Cap 20. Cleared by resetAll. */
  mockRuns: MockRunRecord[];
  setSimulateDate: (value: string | null) => void;
  setStartDate: (value: string) => void;
  setUnlockAll: (value: boolean) => void;
  setFocusMode: (value: boolean) => void;
  setPlanHideDone: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  markStep: (dayId: string, step: LearnStep) => void;
  recordAnswer: (question: Question, selected: OptionKey, today: string) => boolean;
  reviewMistakeAnswer: (
    question: Question,
    selected: OptionKey,
    today: string,
  ) => boolean;
  setMistakeReason: (questionId: string, reason: MistakeReason) => void;
  /** Remove mastered mistakes. If questionIds given, only those; else all mastered. */
  clearMasteredMistakes: (questionIds?: string[]) => void;
  /** Append a mock/paper run; keeps newest 20. */
  appendMockRun: (
    run: Omit<MockRunRecord, "id" | "at"> & { id?: string; at?: string },
  ) => void;
  /** Clear all mock run history. */
  clearMockRuns: () => void;
  completeDay: (dayId: string) => void;
  resetAll: () => void;
}

const emptySession = (): DaySession => ({
  reviewDone: false,
  learnDone: false,
  practiceDone: false,
  wrapupDone: false,
});

const MOCK_RUNS_CAP = 20;

function normalizeMockRuns(value: unknown): MockRunRecord[] {
  if (!Array.isArray(value)) return [];
  const out: MockRunRecord[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string") continue;
    if (typeof row.paperDayId !== "string") continue;
    if (typeof row.label !== "string") continue;
    if (typeof row.correct !== "number") continue;
    if (typeof row.total !== "number") continue;
    if (typeof row.percent !== "number") continue;
    if (typeof row.at !== "string") continue;
    const rec: MockRunRecord = {
      id: row.id,
      paperDayId: row.paperDayId,
      label: row.label,
      correct: row.correct,
      total: row.total,
      percent: row.percent,
      at: row.at,
    };
    if (typeof row.timedSec === "number" && row.timedSec > 0) {
      rec.timedSec = row.timedSec;
    }
    out.push(rec);
  }
  return out.slice(0, MOCK_RUNS_CAP);
}

function bumpStreak(
  lastStudyDate: string | null,
  streak: number,
  today: string,
): { streak: number; lastStudyDate: string } {
  if (lastStudyDate === today) {
    return { streak: Math.max(streak, 1), lastStudyDate: today };
  }
  const yesterday = addDaysISO(today, -1);
  if (lastStudyDate === yesterday) {
    return { streak: streak + 1, lastStudyDate: today };
  }
  return { streak: 1, lastStudyDate: today };
}

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
      simulateDate: null,
      startDate: todayISO(),
      streak: 0,
      lastStudyDate: null,
      unlockAll: false,
      focusMode: false,
      planHideDone: false,
      largeText: false,
      mockRuns: [],
      setSimulateDate: (value) => set({ simulateDate: value }),
      setStartDate: (value) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
        set({ startDate: value });
      },
      setUnlockAll: (value) => set({ unlockAll: value }),
      setFocusMode: (value) => set({ focusMode: value }),
      setPlanHideDone: (value) => set({ planHideDone: value }),
      setLargeText: (value) => set({ largeText: value }),
      markStep: (dayId, step) => {
        const current = get().sessions[dayId] ?? emptySession();
        const next = { ...current, lastActiveAt: new Date().toISOString() };
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
        const state = get();
        const streakPatch = bumpStreak(state.lastStudyDate, state.streak, today);
        set({
          answers: [...state.answers, record],
          progress: {
            ...state.progress,
            totalQuestions: state.progress.totalQuestions + 1,
            correctQuestions:
              state.progress.correctQuestions + (correct ? 1 : 0),
          },
          mistakes: correct
            ? state.mistakes
            : upsertMistakeOnWrong(state.mistakes, question, selected, today),
          ...streakPatch,
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
        const state = get();
        const streakPatch = bumpStreak(state.lastStudyDate, state.streak, today);
        set({
          answers: [...state.answers, record],
          progress: {
            ...state.progress,
            totalQuestions: state.progress.totalQuestions + 1,
            correctQuestions:
              state.progress.correctQuestions + (correct ? 1 : 0),
          },
          mistakes: correct
            ? applyReviewCorrect(state.mistakes, question.id, today)
            : upsertMistakeOnWrong(state.mistakes, question, selected, today),
          ...streakPatch,
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
      clearMasteredMistakes: (questionIds) => {
        const idSet =
          questionIds == null ? null : new Set(questionIds);
        set({
          mistakes: get().mistakes.filter((item) => {
            if (!item.mastered) return true;
            if (idSet == null) return false;
            return !idSet.has(item.questionId);
          }),
        });
      },
      appendMockRun: (run) => {
        const id =
          run.id ??
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        const at = run.at ?? new Date().toISOString();
        const record: MockRunRecord = {
          id,
          paperDayId: run.paperDayId,
          label: run.label,
          correct: run.correct,
          total: run.total,
          percent: run.percent,
          at,
        };
        if (typeof run.timedSec === "number" && run.timedSec > 0) {
          record.timedSec = run.timedSec;
        }
        const prev = get().mockRuns;
        set({
          mockRuns: [record, ...prev.filter((item) => item.id !== id)].slice(
            0,
            MOCK_RUNS_CAP,
          ),
        });
      },
      clearMockRuns: () => set({ mockRuns: [] }),
      completeDay: (dayId) => {
        const state = get();
        const progress = afterComplete(state.progress, dayId);
        const session = state.sessions[dayId] ?? emptySession();
        const today = todayISO(state.simulateDate);
        const streakPatch = bumpStreak(state.lastStudyDate, state.streak, today);
        set({
          progress,
          sessions: {
            ...state.sessions,
            [dayId]: {
              ...session,
              wrapupDone: true,
              lastActiveAt: new Date().toISOString(),
            },
          },
          ...streakPatch,
        });
      },
      // Clears progress/mistakes/answers/sessions only; keeps unlockAll, simulateDate, startDate, largeText, focusMode, planHideDone.
      resetAll: () =>
        set({
          progress: emptyProgress(),
          mistakes: [],
          answers: [],
          sessions: {},
          streak: 0,
          lastStudyDate: null,
          mockRuns: [],
        }),
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      storage: createJSONStorage(getPersistStorage),
      partialize: (state) => ({
        progress: state.progress,
        mistakes: state.mistakes,
        answers: state.answers,
        sessions: state.sessions,
        simulateDate: state.simulateDate,
        startDate: state.startDate,
        streak: state.streak,
        lastStudyDate: state.lastStudyDate,
        unlockAll: state.unlockAll,
        focusMode: state.focusMode,
        planHideDone: state.planHideDone,
        largeText: state.largeText,
        mockRuns: state.mockRuns,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<TrainerState>;
        const startDate =
          typeof persisted.startDate === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(persisted.startDate)
            ? persisted.startDate
            : currentState.startDate;
        const unlockAll =
          typeof persisted.unlockAll === "boolean"
            ? persisted.unlockAll
            : false;
        const focusMode =
          typeof persisted.focusMode === "boolean"
            ? persisted.focusMode
            : false;
        const planHideDone =
          typeof persisted.planHideDone === "boolean"
            ? persisted.planHideDone
            : false;
        const largeText =
          typeof persisted.largeText === "boolean"
            ? persisted.largeText
            : false;
        const streak =
          typeof persisted.streak === "number" && persisted.streak >= 0
            ? persisted.streak
            : 0;
        const lastStudyDate =
          typeof persisted.lastStudyDate === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(persisted.lastStudyDate)
            ? persisted.lastStudyDate
            : null;
        const mockRuns = normalizeMockRuns(persisted.mockRuns);
        return {
          ...currentState,
          ...persisted,
          startDate,
          unlockAll,
          focusMode,
          planHideDone,
          largeText,
          streak,
          lastStudyDate,
          mockRuns,
        };
      },
    },
  ),
);

export function getSession(sessions: Record<string, DaySession>, dayId: string) {
  return sessions[dayId] ?? emptySession();
}

export function resolveStep(session: DaySession): LearnStep {
  if (!session.reviewDone) return "review";
  if (!session.learnDone) return "learn";
  if (!session.practiceDone) return "practice";
  return "wrapup";
}

const STEP_LABEL: Record<LearnStep, string> = {
  review: "复习",
  learn: "学习",
  practice: "练习",
  wrapup: "收尾",
};

export function stepLabel(step: LearnStep): string {
  return STEP_LABEL[step];
}

/**
 * Most recently touched unlocked day that is not fully completed
 * (wrapupDone false or day not in completedDays). Null if none.
 */
export function resolveResumeDay(
  sessions: Record<string, DaySession>,
  progress: Progress,
  unlockAll = false,
  startDate?: string,
): { day: StudyDay; step: LearnStep } | null {
  let best: { day: StudyDay; step: LearnStep; at: string } | null = null;
  for (const [dayId, session] of Object.entries(sessions)) {
    if (session.wrapupDone && isCompleted(progress, dayId)) continue;
    if (!isUnlocked(progress, dayId, unlockAll)) continue;
    const day = getDayById(dayId, startDate) ?? getDayById(dayId);
    if (!day) continue;
    const at = session.lastActiveAt ?? "";
    if (!best || at > best.at) {
      best = { day, step: resolveStep(session), at };
    }
  }
  return best ? { day: best.day, step: best.step } : null;
}

export function currentToday(): string {
  return todayISO(useTrainerStore.getState().simulateDate);
}
