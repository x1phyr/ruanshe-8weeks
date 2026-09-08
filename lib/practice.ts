import { questions } from "@/data/questions";
import { isUnlocked } from "@/lib/progress";
import type { Progress, Question, StudyDay } from "@/lib/types";

/** Unlocked questions for a calendar module (day.module match or knowledgePath prefix). */
export function questionsForModule(
  moduleName: string,
  studyDays: StudyDay[],
  progress: Progress,
  unlockAll: boolean,
): Question[] {
  const unlockedIds = new Set(
    studyDays
      .filter(
        (day) =>
          day.module === moduleName && isUnlocked(progress, day.id, unlockAll),
      )
      .map((day) => day.id),
  );
  return questions.filter((q) => {
    if (unlockedIds.has(q.dayId)) return true;
    const path = q.knowledgePath ?? "";
    if (!path.startsWith(moduleName)) return false;
    return isUnlocked(progress, q.dayId, unlockAll);
  });
}

/** Deep link to practice page with a module chip preselected. */
export function practiceModuleHref(module: string): string {
  return `/practice?module=${encodeURIComponent(module)}`;
}
