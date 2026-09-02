"use client";

import Link from "next/link";
import { LearnSession } from "@/components/learn/learn-session";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui-bits";
import { lastPlannedDate, planPhase } from "@/lib/calendar";
import { examConfig } from "@/lib/config";
import { diffDays, examCountdown, formatDateCn, todayISO } from "@/lib/dates";
import { resolveFocusDay } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";

export default function LearnCurrentPage() {
  const progress = useTrainerStore((s) => s.progress);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const startDate = useTrainerStore((s) => s.startDate);
  const setStartDate = useTrainerStore((s) => s.setStartDate);
  const today = todayISO(simulateDate);
  const realToday = todayISO();
  const phase = planPhase(startDate, today);
  const daysLeft = examCountdown(today);
  const lastDate = lastPlannedDate(startDate);

  if (phase === "not-started") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <Surface className="p-6">
          <div className="label-caps">NOT STARTED</div>
          <h2 className="mt-2 text-lg font-medium">课程尚未开始</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            开课日是 {formatDateCn(startDate)}，还有 {diffDays(today, startDate)} 天。
            考试倒计时仍按 {examConfig.examDate}
            {daysLeft > 0 ? `，剩余 ${daysLeft} 天` : ""}。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => setStartDate(realToday)}>
              用今天
            </Button>
            <Link
              href="/"
              className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm hover:bg-muted"
            >
              回仪表盘
            </Link>
          </div>
        </Surface>
      </div>
    );
  }

  if (phase === "after-plan") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <Surface className="p-6">
          <div className="label-caps">SPRINT / REVIEW</div>
          <h2 className="mt-2 text-lg font-medium">计划日历已经走完</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            最后学习日是 {lastDate}。
            {daysLeft > 0
              ? ` 距考试还有 ${daysLeft} 天。用错题本和模块练习继续收口，不要改考试日。`
              : " 考试日已过。"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/mistakes"
              className="inline-flex h-8 items-center rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              去错题本
            </Link>
            <Link
              href="/practice"
              className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm hover:bg-muted"
            >
              模块练习
            </Link>
          </div>
        </Surface>
      </div>
    );
  }

  return <LearnSession day={resolveFocusDay(progress, simulateDate, startDate)} />;
}
