import { firstDay, getDayById, getNextDay, scheduleDays, studyDays } from "@/lib/calendar";
import { todayISO } from "@/lib/dates";
import type { Mistake, MistakeBucket, Progress, StudyDay } from "@/lib/types";

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

export function isUnlocked(progress: Progress, dayId: string): boolean {
  if (dayId === firstDay.id) return true;
  const day = getDayById(dayId);
  if (!day) return false;
  const index = studyDays.findIndex((item) => item.id === dayId);
  if (index <= 0) return dayId === firstDay.id;
  const prev = studyDays[index - 1];
  return isCompleted(progress, prev.id);
}

export function firstIncompleteUnlocked(progress: Progress): StudyDay {
  for (const day of studyDays) {
    if (isUnlocked(progress, day.id) && !isCompleted(progress, day.id)) {
      return day;
    }
  }
  return studyDays[studyDays.length - 1];
}

export function resolveFocusDay(
  progress: Progress,
  simulateDate: string | null,
  startDate: string,
): StudyDay {
  const today = todayISO(simulateDate);
  const days = scheduleDays(startDate);
  const todayDay = days.find((day) => day.date === today);
  if (
    todayDay &&
    isUnlocked(progress, todayDay.id) &&
    !isCompleted(progress, todayDay.id)
  ) {
    return todayDay;
  }
  const fallback = firstIncompleteUnlocked(progress);
  return days.find((day) => day.id === fallback.id) ?? fallback;
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
