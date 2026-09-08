"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { questions, questionsForDay } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { KindPill, PageFrame, PageHeader, Surface, EmptyState } from "@/components/ui-bits";
import { QuizRun } from "@/components/learn/quiz-run";
import { dayHref, scheduleDays } from "@/lib/calendar";
import { isUnlocked } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";
import type { Progress, Question, StudyDay } from "@/lib/types";

type ActiveRun =
  | { kind: "day"; dayId: string }
  | { kind: "module"; module: string };

function questionsForModule(
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
    // knowledgePath match: only include if that question's day is unlocked (or unlockAll)
    return isUnlocked(progress, q.dayId, unlockAll);
  });
}

export function PracticeView() {
  const progress = useTrainerStore((s) => s.progress);
  const startDate = useTrainerStore((s) => s.startDate);
  const unlockAll = useTrainerStore((s) => s.unlockAll);
  const studyDays = scheduleDays(startDate);
  const [module, setModule] = useState<string>("全部");
  const [active, setActive] = useState<ActiveRun | null>(null);
  const modules = useMemo(
    () => Array.from(new Set(studyDays.map((day) => day.module))),
    [studyDays],
  );

  const days = useMemo(() => {
    return studyDays.filter((day) => module === "全部" || day.module === module);
  }, [module, studyDays]);

  const unlockedInModule = useMemo(() => {
    if (module === "全部") return [];
    return days.filter((day) => isUnlocked(progress, day.id, unlockAll));
  }, [days, module, progress, unlockAll]);

  const moduleBank = useMemo(() => {
    if (module === "全部") return [];
    return questionsForModule(module, studyDays, progress, unlockAll);
  }, [module, studyDays, progress, unlockAll]);

  const activeQuestions = useMemo(() => {
    if (!active) return [];
    if (active.kind === "day") return questionsForDay(active.dayId);
    return questionsForModule(active.module, studyDays, progress, unlockAll);
  }, [active, studyDays, progress, unlockAll]);

  const activeDay =
    active?.kind === "day"
      ? studyDays.find((day) => day.id === active.dayId)
      : undefined;
  const activeTitle =
    active?.kind === "module"
      ? `模块 · ${active.module}`
      : activeDay?.topic ?? "";

  if (active && activeQuestions.length > 0) {
    return (
      <PageFrame>
        <button
          type="button"
          onClick={() => setActive(null)}
          className="label-caps hover:text-foreground"
        >
          ← 返回题库
        </button>
        <h1 className="mt-2 text-xl font-medium">{activeTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {active.kind === "module"
            ? `本模块已解锁共 ${activeQuestions.length} 题。对错会计入正确率；错题写入错题本。`
            : "来自同一题库。对错会计入正确率；错题写入错题本。此页不自动完成本日。"}
        </p>
        <div className="mt-6">
          <QuizRun
            questions={activeQuestions}
            mode="practice"
            navKey={
              active.kind === "day"
                ? `day:${active.dayId}`
                : `module:${active.module}`
            }
            onFinished={() => setActive(null)}
          />
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <PageHeader
        kicker="DRILL"
        title="按模块练习"
        description="按日历模块筛选专题，或一键刷本模块已解锁题。未解锁日只显示路线，不跳关。"
      />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {["全部", ...modules].map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setModule(name)}
            className={`h-7 rounded-sm border px-2 font-mono text-[11px] ${
              module === name
                ? "border-brand/50 bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {module !== "全部" ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2">
          <div className="min-w-0 flex-1 font-mono text-[11px] text-muted-foreground">
            {module} · 已解锁 {unlockedInModule.length}/{days.length} 日 · 可刷{" "}
            {moduleBank.length} 题
          </div>
          <Button
            size="sm"
            disabled={moduleBank.length === 0}
            onClick={() => setActive({ kind: "module", module })}
          >
            开始刷本模块题
          </Button>
        </div>
      ) : null}

      <Surface>
        {days.length === 0 ? (
          <EmptyState title="没有专题" description="换一个模块看看。" />
        ) : (
          <ul className="divide-y divide-border">
            {days.map((day) => {
              const bank = questions.filter((q) => q.dayId === day.id);
              const unlocked = isUnlocked(progress, day.id, unlockAll);
              return (
                <li
                  key={day.id}
                  className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm">{day.topic}</span>
                      <KindPill>{day.module}</KindPill>
                      <KindPill>
                        {bank.length > 0 ? `${bank.length} 题` : "即将上线"}
                      </KindPill>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {day.date} · WEEK {day.week}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {unlocked ? (
                      <Link
                        href={dayHref(day)}
                        className="inline-flex h-7 items-center rounded-md border border-border px-2.5 text-[0.8rem] hover:bg-muted"
                      >
                        进入日训
                      </Link>
                    ) : (
                      <KindPill>未解锁</KindPill>
                    )}
                    {unlocked && bank.length > 0 ? (
                      <Button
                        size="sm"
                        onClick={() => setActive({ kind: "day", dayId: day.id })}
                      >
                        开始练习
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Surface>
    </PageFrame>
  );
}
