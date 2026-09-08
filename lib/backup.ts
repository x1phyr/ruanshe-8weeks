import { todayISO } from "@/lib/dates";
import { emptyProgress } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";
import type {
  AnswerRecord,
  DaySession,
  Mistake,
  Progress,
} from "@/lib/types";

/** Fields matching zustand `partialize` — the trainer persist blob. */
export interface ProgressBackup {
  progress: Progress;
  mistakes: Mistake[];
  answers: AnswerRecord[];
  sessions: Record<string, DaySession>;
  startDate: string;
  simulateDate: string | null;
  unlockAll: boolean;
  streak: number;
  lastStudyDate: string | null;
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function snapshotProgress(): ProgressBackup {
  const s = useTrainerStore.getState();
  return {
    progress: s.progress,
    mistakes: s.mistakes,
    answers: s.answers,
    sessions: s.sessions,
    startDate: s.startDate,
    simulateDate: s.simulateDate,
    unlockAll: s.unlockAll,
    streak: s.streak,
    lastStudyDate: s.lastStudyDate,
  };
}

export function progressBackupFilename(stamp?: string): string {
  const day = stamp && ISO_RE.test(stamp) ? stamp : todayISO();
  return `ruanshe-progress-${day}.json`;
}

export function exportProgressBackup(stamp?: string) {
  const blob = snapshotProgress();
  downloadBlob(
    progressBackupFilename(stamp),
    JSON.stringify(blob, null, 2),
    "application/json;charset=utf-8",
  );
}

function asProgress(value: unknown): Progress | null {
  if (!isPlainObject(value)) return null;
  const completedDays = value.completedDays;
  if (!Array.isArray(completedDays)) return null;
  if (!completedDays.every((id) => typeof id === "string")) return null;
  const currentWeek =
    typeof value.currentWeek === "number" ? value.currentWeek : 1;
  const currentDay =
    typeof value.currentDay === "number" ? value.currentDay : 1;
  const totalQuestions =
    typeof value.totalQuestions === "number" ? value.totalQuestions : 0;
  const correctQuestions =
    typeof value.correctQuestions === "number" ? value.correctQuestions : 0;
  return {
    currentWeek,
    currentDay,
    completedDays,
    totalQuestions,
    correctQuestions,
  };
}

/** Light shape check — enough to reject unrelated JSON safely. */
export function validateProgressBackup(
  raw: unknown,
): { ok: true; data: ProgressBackup } | { ok: false; error: string } {
  if (!isPlainObject(raw)) {
    return { ok: false, error: "不是有效的 JSON 对象" };
  }

  const progress = asProgress(raw.progress) ?? emptyProgress();
  if (raw.progress != null && !asProgress(raw.progress)) {
    return { ok: false, error: "progress 字段格式无效" };
  }

  if (raw.mistakes != null && !Array.isArray(raw.mistakes)) {
    return { ok: false, error: "mistakes 应为数组" };
  }
  if (raw.answers != null && !Array.isArray(raw.answers)) {
    return { ok: false, error: "answers 应为数组" };
  }
  if (raw.sessions != null && !isPlainObject(raw.sessions)) {
    return { ok: false, error: "sessions 应为对象" };
  }

  const startDate =
    typeof raw.startDate === "string" && ISO_RE.test(raw.startDate)
      ? raw.startDate
      : todayISO();
  const simulateDate =
    raw.simulateDate === null || raw.simulateDate === undefined
      ? null
      : typeof raw.simulateDate === "string" && ISO_RE.test(raw.simulateDate)
        ? raw.simulateDate
        : null;
  const unlockAll = typeof raw.unlockAll === "boolean" ? raw.unlockAll : false;
  const streak =
    typeof raw.streak === "number" && raw.streak >= 0 ? raw.streak : 0;
  const lastStudyDate =
    typeof raw.lastStudyDate === "string" && ISO_RE.test(raw.lastStudyDate)
      ? raw.lastStudyDate
      : null;

  // Require at least one recognizable persist key so random JSON is rejected.
  const hasSignal =
    raw.progress != null ||
    Array.isArray(raw.mistakes) ||
    Array.isArray(raw.answers) ||
    isPlainObject(raw.sessions) ||
    typeof raw.startDate === "string" ||
    typeof raw.streak === "number" ||
    typeof raw.unlockAll === "boolean";
  if (!hasSignal) {
    return { ok: false, error: "缺少进度字段（progress / mistakes 等）" };
  }

  return {
    ok: true,
    data: {
      progress,
      mistakes: (Array.isArray(raw.mistakes) ? raw.mistakes : []) as Mistake[],
      answers: (Array.isArray(raw.answers) ? raw.answers : []) as AnswerRecord[],
      sessions: (isPlainObject(raw.sessions)
        ? raw.sessions
        : {}) as Record<string, DaySession>,
      startDate,
      simulateDate,
      unlockAll,
      streak,
      lastStudyDate,
    },
  };
}

/** Replace persist fields from a validated backup (merge middleware not needed). */
export function applyProgressBackup(data: ProgressBackup) {
  useTrainerStore.setState({
    progress: data.progress,
    mistakes: data.mistakes,
    answers: data.answers,
    sessions: data.sessions,
    startDate: data.startDate,
    simulateDate: data.simulateDate,
    unlockAll: data.unlockAll,
    streak: data.streak,
    lastStudyDate: data.lastStudyDate,
  });
}

export async function readProgressFile(
  file: File,
): Promise<{ ok: true; data: ProgressBackup } | { ok: false; error: string }> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: "无法读取文件" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: "JSON 解析失败" };
  }
  return validateProgressBackup(parsed);
}
