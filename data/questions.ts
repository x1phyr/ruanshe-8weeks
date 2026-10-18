import type { OptionKey, Question } from "@/lib/types";
import rawQuestionsJson from "@/src/data/questions.json";

interface RawQuestionItem {
  id: string;
  domain: string;
  year?: string;
  source?: string;
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: "A" | "B" | "C" | "D";
  analysis: string;
  explanation?: string;
  keyFormula?: string;
  trapAlert?: string;
  isHighYield?: boolean;
}

export const rawQuestions = rawQuestionsJson as RawQuestionItem[];

export const questions: Question[] = rawQuestions.map((q, idx) => {
  const dayIndex = (idx % 56) + 1;
  const weekNum = Math.ceil(dayIndex / 7);
  const dayInWeek = ((dayIndex - 1) % 7) + 1;
  return {
    id: q.id,
    dayId: `week-${weekNum}/day-${dayInWeek}`,
    topic: q.domain,
    knowledgePath: `${q.domain} / ${q.year || q.source || "历年真题"}`,
    stem: q.stem,
    options: [
      { key: "A" as OptionKey, text: q.options.A },
      { key: "B" as OptionKey, text: q.options.B },
      { key: "C" as OptionKey, text: q.options.C },
      { key: "D" as OptionKey, text: q.options.D },
    ],
    correct: q.answer as OptionKey,
    explanation: q.explanation || q.analysis,
    trap: q.trapAlert || "",
    whyWrong: {
      A: q.answer === "A" ? "" : "干扰项辨析请参阅解析。",
      B: q.answer === "B" ? "" : "干扰项辨析请参阅解析。",
      C: q.answer === "C" ? "" : "干扰项辨析请参阅解析。",
      D: q.answer === "D" ? "" : "干扰项辨析请参阅解析。",
    },
  };
});

export function questionsForDay(dayId: string): Question[] {
  const filtered = questions.filter((question) => question.dayId === dayId);
  return filtered.length > 0 ? filtered : questions.slice(0, 5);
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((question) => question.id === id);
}

export function questionsByTopic(): Map<string, Question[]> {
  const map = new Map<string, Question[]>();
  for (const question of questions) {
    const list = map.get(question.topic) ?? [];
    list.push(question);
    map.set(question.topic, list);
  }
  return map;
}

/** Fisher–Yates shuffle (Math.random); mutates a copy, returns up to `count` items. */
export function sampleQuestions(pool: Question[], count: number): Question[] {
  const copy = pool.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/** Questions whose day is unlocked (or all days when unlockAll). */
export function unlockedQuestions(
  isDayUnlocked: (dayId: string) => boolean,
): Question[] {
  const res = questions.filter((q) => isDayUnlocked(q.dayId));
  return res.length > 0 ? res : questions;
}
