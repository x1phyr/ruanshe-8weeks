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

export function PracticeView() {
  const progress = useTrainerStore((s) => s.progress);
  const startDate = useTrainerStore((s) => s.startDate);
  const studyDays = scheduleDays(startDate);
  const [module, setModule] = useState<string>("全部");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const modules = Array.from(new Set(studyDays.map((day) => day.module)));

  const days = useMemo(() => {
    return studyDays.filter((day) => module === "全部" || day.module === module);
  }, [module, studyDays]);

  const activeQuestions = activeDayId ? questionsForDay(activeDayId) : [];
  const activeDay = studyDays.find((day) => day.id === activeDayId);

  if (activeDay && activeQuestions.length > 0) {
    return (
      <PageFrame>
        <button
          type="button"
          onClick={() => setActiveDayId(null)}
          className="label-caps hover:text-foreground"
        >
          ← 返回题库
        </button>
        <h1 className="mt-2 text-xl font-medium">{activeDay.topic}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          来自同一题库。对错会计入正确率；错题写入错题本。此页不自动完成本日。
        </p>
        <div className="mt-6">
          <QuizRun
            questions={activeQuestions}
            mode="practice"
            onFinished={() => setActiveDayId(null)}
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
        description="v1 直接打同一题库。未解锁或尚未补题的专题只显示路线，不跳关。"
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
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
      <Surface>
        {days.length === 0 ? (
          <EmptyState title="没有专题" description="换一个模块看看。" />
        ) : (
          <ul className="divide-y divide-border">
            {days.map((day) => {
              const bank = questions.filter((q) => q.dayId === day.id);
              const unlocked = isUnlocked(progress, day.id);
              return (
                <li
                  key={day.id}
                  className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm">{day.topic}</span>
                      <KindPill>{day.module}</KindPill>
                      <KindPill>{bank.length > 0 ? `${bank.length} 题` : "即将上线"}</KindPill>
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
                      <Button size="sm" onClick={() => setActiveDayId(day.id)}>
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
