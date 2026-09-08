import { firstDay, getDayByDate, getDayById, getDaysByWeek, getNextDay, getWeekMeta, scheduleDays, studyDays } from "@/lib/calendar";
import { todayISO } from "@/lib/dates";
import type { DayKind, Mistake, MistakeBucket, Progress, StudyDay } from "@/lib/types";

export const emptyProgress = (): Progress => ({
  currentWeek: 1,
  currentDay: 1,
  completedDays: [],
  totalQuestions: 0,
  correctQuestions: 0,
});

export function isCompleted(progress: Progress, dayId: string): boolean {
  return progress.completedDays.includes(dayId);
}

export function isUnlocked(
  progress: Progress,
  dayId: string,
  unlockAll = false,
): boolean {
  if (unlockAll) return true;
  if (dayId === firstDay.id) return true;
  const day = getDayById(dayId);
  if (!day) return false;
  const index = studyDays.findIndex((item) => item.id === dayId);
  if (index <= 0) return dayId === firstDay.id;
  const prev = studyDays[index - 1];
  return isCompleted(progress, prev.id);
}

export function firstIncompleteUnlocked(
  progress: Progress,
  unlockAll = false,
): StudyDay {
  for (const day of studyDays) {
    if (isUnlocked(progress, day.id, unlockAll) && !isCompleted(progress, day.id)) {
      return day;
    }
  }
  return studyDays[studyDays.length - 1];
}

export function resolveFocusDay(
  progress: Progress,
  simulateDate: string | null,
  startDate: string,
  unlockAll = false,
): StudyDay {
  const today = todayISO(simulateDate);
  const days = scheduleDays(startDate);
  const todayDay = days.find((day) => day.date === today);
  if (
    todayDay &&
    isUnlocked(progress, todayDay.id, unlockAll) &&
    !isCompleted(progress, todayDay.id)
  ) {
    return todayDay;
  }
  const fallback = firstIncompleteUnlocked(progress, unlockAll);
  return days.find((day) => day.id === fallback.id) ?? fallback;
}


/** Short week label for compact UI (strip Chinese parentheticals). */
export function weekShortTitle(week: number, startDate: string): string {
  const meta = getWeekMeta(week, startDate);
  const raw = meta?.title ?? `第 ${week} 周`;
  return raw.replace(/（[^）]*）/g, "").trim() || raw;
}

/**
 * Current calendar week (1–8) for today via startDate + simulateDate,
 * falling back to the focus day week when today is outside the plan.
 */
export function resolveCurrentWeek(
  progress: Progress,
  simulateDate: string | null,
  startDate: string,
  unlockAll = false,
): number {
  const today = todayISO(simulateDate);
  const todayDay = getDayByDate(startDate, today);
  if (todayDay) return todayDay.week;
  return resolveFocusDay(progress, simulateDate, startDate, unlockAll).week;
}

/** Completed vs total study days in a calendar week. */
export function weekProgressStats(
  progress: Progress,
  startDate: string,
  week: number,
): { week: number; done: number; total: number; title: string } {
  const days = getDaysByWeek(week, startDate);
  const done = days.filter((day) => isCompleted(progress, day.id)).length;
  return {
    week,
    done,
    total: days.length,
    title: weekShortTitle(week, startDate),
  };
}

export function afterComplete(progress: Progress, dayId: string): Progress {
  const completedDays = progress.completedDays.includes(dayId)
    ? progress.completedDays
    : [...progress.completedDays, dayId];
  const next = getNextDay(dayId);
  return {
    ...progress,
    completedDays,
    currentWeek: next?.week ?? progress.currentWeek,
    currentDay: next?.dayInWeek ?? progress.currentDay,
  };
}

export function accuracyPercent(progress: Progress): number | null {
  if (progress.totalQuestions === 0) return null;
  return Math.round((progress.correctQuestions / progress.totalQuestions) * 100);
}

export function mistakeBucket(mistake: Mistake, today: string): MistakeBucket {
  if (mistake.mastered) return "mastered";
  if (mistake.nextReviewAt <= today) return "needs-review";
  return "learning";
}

export function dueMistakes(mistakes: Mistake[], today: string): Mistake[] {
  return mistakes.filter((item) => mistakeBucket(item, today) === "needs-review");
}

export function reviewIntervalDays(wrongCount: number): number {
  if (wrongCount <= 1) return 1;
  if (wrongCount === 2) return 3;
  return 7;
}

/** Core plan kinds used for 通关 when counting learn/review/sprint/paper days. */
const PLAN_CORE_KINDS: DayKind[] = ["learn", "review", "sprint", "paper"];

/**
 * True when all 53 curriculum days are completed, or every learn/review/sprint/paper day is done.
 * unlockAll alone never counts as complete — only completedDays membership.
 */
export function isPlanComplete(progress: Progress): boolean {
  const done = new Set(progress.completedDays);
  if (studyDays.every((day) => done.has(day.id))) return true;
  const core = studyDays.filter((day) => PLAN_CORE_KINDS.includes(day.kind));
  return core.length > 0 && core.every((day) => done.has(day.id));
}
