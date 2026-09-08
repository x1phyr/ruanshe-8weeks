import { getDayById } from "@/lib/calendar";
import { getQuestionById } from "@/data/questions";
import type { AnswerRecord, Mistake } from "@/lib/types";

/** Minimum attempts before a module can rank as "weak". */
export const MODULE_STATS_MIN_ATTEMPTS = 3;

export interface ModuleAccuracy {
  module: string;
  attempts: number;
  correct: number;
  /** 0–100 rounded */
  accuracy: number;
}

function resolveModule(answer: AnswerRecord): string {
  const day = getDayById(answer.dayId);
  if (day?.module) return day.module;
  const question = getQuestionById(answer.questionId);
  if (question?.knowledgePath) {
    const head = question.knowledgePath.split("/")[0]?.trim();
    if (head) return head;
  }
  if (question?.topic) return question.topic;
  return "未分类";
}

/** Aggregate correct rate and attempt count per StudyDay.module (fallback: knowledgePath / topic). */
export function moduleAccuracyFromAnswers(
  answers: AnswerRecord[],
): ModuleAccuracy[] {
  const buckets = new Map<string, { attempts: number; correct: number }>();
  for (const answer of answers) {
    const module = resolveModule(answer);
    const cur = buckets.get(module) ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (answer.correct) cur.correct += 1;
    buckets.set(module, cur);
  }
  return [...buckets.entries()]
    .map(([module, { attempts, correct }]) => ({
      module,
      attempts,
      correct,
      accuracy: attempts === 0 ? 0 : Math.round((correct / attempts) * 100),
    }))
    .sort(
      (a, b) =>
        a.accuracy - b.accuracy ||
        b.attempts - a.attempts ||
        a.module.localeCompare(b.module, "zh"),
    );
}

/** Lowest-accuracy modules that meet the min-attempt threshold (default top 5). */
export function topWeakModules(
  answers: AnswerRecord[],
  opts?: { minAttempts?: number; limit?: number },
): ModuleAccuracy[] {
  const minAttempts = opts?.minAttempts ?? MODULE_STATS_MIN_ATTEMPTS;
  const limit = opts?.limit ?? 5;
  return moduleAccuracyFromAnswers(answers)
    .filter((item) => item.attempts >= minAttempts)
    .slice(0, limit);
}

/** Module/topic label for a mistake: StudyDay.module → knowledgePath head → mistake.topic. */
export function resolveMistakeModule(mistake: Mistake): string {
  const question = getQuestionById(mistake.questionId);
  if (question?.dayId) {
    const day = getDayById(question.dayId);
    if (day?.module) return day.module;
  }
  if (question?.knowledgePath) {
    const head = question.knowledgePath.split("/")[0]?.trim();
    if (head) return head;
  }
  if (mistake.topic?.trim()) return mistake.topic.trim();
  if (question?.topic?.trim()) return question.topic.trim();
  return "未分类";
}
