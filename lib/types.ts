export type DayKind = "learn" | "case" | "paper" | "review" | "sprint";

export type ContentStatus = "live" | "stub" | "paper";

export type HolidayKind = "mid-autumn" | "national-day";

export type PaperSlot = "morning" | "afternoon";

export type OptionKey = "A" | "B" | "C" | "D";

export type MistakeReason =
  | "unknown"
  | "misunderstood"
  | "calculation"
  | "careless";

export interface StudyDay {
  id: string;
  date: string;
  week: number;
  dayInWeek: number;
  title: string;
  topic: string;
  module: string;
  kind: DayKind;
  durationMin: number;
  status: ContentStatus;
  holiday?: HolidayKind;
  makeup?: boolean;
  paperSlot?: PaperSlot;
  blurb: string;
}

export interface WeekMeta {
  week: number;
  title: string;
  subtitle: string;
  start: string;
  end: string;
}

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: string;
  dayId: string;
  topic: string;
  knowledgePath: string;
  stem: string;
  options: QuestionOption[];
  correct: OptionKey;
  explanation: string;
  trap: string;
  whyWrong: Partial<Record<OptionKey, string>>;
}

export interface LessonCallout {
  tone: "tip" | "trap" | "exam";
  title: string;
  body: string;
}

export interface LessonTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export type LessonBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; callout: LessonCallout }
  | { type: "table"; table: LessonTable }
  | { type: "rank"; title: string; items: string[]; direction: string };

export interface Lesson {
  dayId: string;
  title: string;
  minutes: number;
  keyPoints: string[];
  blocks: LessonBlock[];
}

export interface Progress {
  currentWeek: number;
  currentDay: number;
  completedDays: string[];
  totalQuestions: number;
  correctQuestions: number;
}

export interface Mistake {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  topic: string;
  reason: MistakeReason;
  wrongCount: number;
  nextReviewAt: string;
  mastered: boolean;
  consecutiveCorrect: number;
  lastWrongAt: string;
}

export interface AnswerRecord {
  questionId: string;
  selected: OptionKey;
  correct: boolean;
  at: string;
  dayId: string;
}

export type LearnStep = "review" | "learn" | "practice" | "wrapup";

export interface DaySession {
  reviewDone: boolean;
  learnDone: boolean;
  practiceDone: boolean;
  wrapupDone: boolean;
  /** ISO timestamp; bumped on markStep / completeDay for resume ordering. */
  lastActiveAt?: string;
}

export type MistakeBucket = "needs-review" | "learning" | "mastered";
