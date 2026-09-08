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

/** Deep link to mistakes book with a module chip preselected. */
export function mistakesModuleHref(module: string): string {
  return `/mistakes?module=${encodeURIComponent(module)}`;
}

/**
 * Read `?module=` or hash (`#module=…` / `#…`) from the current URL.
 * When `allowed` is given, only "全部" or names in that list are accepted.
 */
export function readModuleFromUrl(allowed?: string[]): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  let raw = params.get("module");
  if (!raw && window.location.hash) {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash.startsWith("module=")) {
      raw = new URLSearchParams(hash).get("module");
    } else if (hash.includes("=")) {
      raw = new URLSearchParams(hash).get("module");
    } else {
      try {
        raw = decodeURIComponent(hash);
      } catch {
        raw = hash;
      }
    }
  }
  if (!raw) return null;
  if (raw === "全部") return raw;
  if (!allowed || allowed.includes(raw)) return raw;
  return null;
}
