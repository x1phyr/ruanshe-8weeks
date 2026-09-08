"use client";

import { useMemo } from "react";
import { questionsForDay } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { QuizRun } from "@/components/learn/quiz-run";
import { isUnlocked } from "@/lib/progress";
import type { Progress as ProgressState } from "@/lib/types";

export const MORNING_MOCK_SETS = [
  { dayId: "week-5/day-6", setLabel: "套1", shortLabel: "W5d6" },
  { dayId: "week-7/day-5", setLabel: "套2", shortLabel: "W7d5" },
] as const;

export const AFTERNOON_MOCK_SETS = [
  { dayId: "week-5/day-7", setLabel: "套1", shortLabel: "W5d7" },
  { dayId: "week-7/day-6", setLabel: "套2", shortLabel: "W7d6" },
] as const;

export const MORNING_MOCK_SEC = 150 * 60; // 9000
export const AFTERNOON_MOCK_SEC = 120 * 60; // 7200

export type MockSlot = "morning" | "afternoon";

export type MockRun = {
  dayId: string;
  slot: MockSlot;
  setLabel: string;
};

type MorningSet = (typeof MORNING_MOCK_SETS)[number];
type AfternoonSet = (typeof AFTERNOON_MOCK_SETS)[number];

export function availableMockSets(
  progress: ProgressState,
  unlockAll: boolean,
): { morning: MorningSet[]; afternoon: AfternoonSet[] } {
  return {
    morning: MORNING_MOCK_SETS.filter((m) =>
      isUnlocked(progress, m.dayId, unlockAll),
    ),
    afternoon: AFTERNOON_MOCK_SETS.filter((m) =>
      isUnlocked(progress, m.dayId, unlockAll),
    ),
  };
}

export function OneClickMockButtons({
  progress,
  unlockAll,
  onStart,
  className,
  buttonClassName,
}: {
  progress: ProgressState;
  unlockAll: boolean;
  onStart: (run: MockRun) => void;
  /** When set, wrap buttons in a div with this class; otherwise render bare buttons (for nesting in an existing flex row). */
  className?: string;
  buttonClassName?: string;
}) {
  const { morning, afternoon } = availableMockSets(progress, unlockAll);
  if (morning.length === 0 && afternoon.length === 0) return null;

  const buttons = (
    <>
      {morning.map((m) => (
        <Button
          key={m.dayId}
          type="button"
          size="sm"
          variant="outline"
          className={buttonClassName}
          onClick={() =>
            onStart({ dayId: m.dayId, slot: "morning", setLabel: m.setLabel })
          }
        >
          一键上午模考 · {m.setLabel}
        </Button>
      ))}
      {afternoon.map((m) => (
        <Button
          key={m.dayId}
          type="button"
          size="sm"
          variant="outline"
          className={buttonClassName}
          onClick={() =>
            onStart({ dayId: m.dayId, slot: "afternoon", setLabel: m.setLabel })
          }
        >
          一键下午模考 · {m.setLabel}
        </Button>
      ))}
    </>
  );

  if (className) {
    return <div className={className}>{buttons}</div>;
  }
  return buttons;
}

export function mockRunTitle(run: MockRun): string {
  const slot = run.slot === "morning" ? "上午" : "下午";
  return `一键${slot}模考 · ${run.setLabel}`;
}

export function mockRunSubtitle(run: MockRun): string {
  return run.slot === "morning"
    ? "自编模拟 85 题 · 150 分钟"
    : "自编模拟 25 题 · 120 分钟";
}

export function mockTimeLimitSec(run: MockRun): number {
  return run.slot === "morning" ? MORNING_MOCK_SEC : AFTERNOON_MOCK_SEC;
}

/** Compact 套别 label for mock history (e.g. 上午·套1). */
export function mockHistoryLabel(run: MockRun): string {
  const slot = run.slot === "morning" ? "上午" : "下午";
  return `${slot}·${run.setLabel}`;
}

/** Resolve 套别 label for a paper dayId (learn flow / dashboard). */
export function mockHistoryLabelForDayId(dayId: string): string | null {
  for (const m of MORNING_MOCK_SETS) {
    if (m.dayId === dayId) return `上午·${m.setLabel}`;
  }
  for (const m of AFTERNOON_MOCK_SETS) {
    if (m.dayId === dayId) return `下午·${m.setLabel}`;
  }
  return null;
}

/** Active QuizRun for a one-click mock; parent supplies back chrome. */
export function OneClickMockQuiz({
  run,
  navKey,
  finishLabel,
  onFinished,
}: {
  run: MockRun;
  navKey: string;
  finishLabel: string;
  onFinished: () => void;
}) {
  const questions = useMemo(() => questionsForDay(run.dayId), [run.dayId]);
  return (
    <QuizRun
      questions={questions}
      mode="practice"
      navKey={navKey}
      timeLimitSec={mockTimeLimitSec(run)}
      finishLabel={finishLabel}
      onFinished={onFinished}
      mockRecord={{
        paperDayId: run.dayId,
        label: mockHistoryLabel(run),
      }}
    />
  );
}
