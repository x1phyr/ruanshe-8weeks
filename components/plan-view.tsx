"use client";

import Link from "next/link";
import { Lock, Check } from "lucide-react";
import { KindPill, PageFrame, PageHeader, Surface } from "@/components/ui-bits";
import {
  dayHref,
  examOverlap,
  holidayLabel,
  kindLabel,
  scheduleDays,
  scheduleWeeks,
} from "@/lib/calendar";
import { examConfig } from "@/lib/config";
import { examCountdown, formatDateShort, pad2, todayISO, weekdayLabel } from "@/lib/dates";
import { isCompleted, isUnlocked } from "@/lib/progress";
import { resolvedStartDate, useTrainerStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PlanView() {
  const progress = useTrainerStore((s) => s.progress);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const startDate = resolvedStartDate(useTrainerStore((s) => s.startDate));
  const today = todayISO(simulateDate);
  const daysLeft = examCountdown(today);
  const days = scheduleDays(startDate);
  const weekMetas = scheduleWeeks(startDate);
  const overlap = examOverlap(startDate);

  return (
    <PageFrame>
      <PageHeader
        kicker="8-WEEK ROADMAP"
        title="课程日历"
        description={`从 ${overlap.start} 起共 53 日，排到 ${overlap.end}。考试日 ${examConfig.examDate} 从 examDate 读取，不随开始日改期。`}
        action={
          <div className="text-right">
            <div className="label-caps">距考试</div>
            <div className="mono-num text-2xl">{daysLeft > 0 ? pad2(daysLeft) : "00"} 天</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {examConfig.examDate}
            </div>
          </div>
        }
      />

      {overlap.overrunsExam ? (
        <Surface className="mb-6 px-3 py-3">
          <p className="text-sm leading-6 text-muted-foreground">
            当前开始日让课表最后一日落在考试
            {overlap.endsOnExam ? "当天" : "之后"}。距考试{" "}
            {daysLeft > 0 ? `${daysLeft} 天` : "已到/已过"}，考试日仍是{" "}
            {examConfig.examDate}，不会自动改期。
          </p>
        </Surface>
      ) : null}

      <div className="space-y-6">
        {weekMetas.map((week) => {
          const weekDays = days.filter((day) => day.week === week.week);
          return (
            <section key={week.week}>
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <div className="mono-num text-xs text-brand">WEEK {pad2(week.week)}</div>
                  <h2 className="text-base font-medium">{week.title}</h2>
                  <p className="text-xs text-muted-foreground">{week.subtitle}</p>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {week.start} → {week.end}
                </div>
              </div>
              <Surface className="overflow-hidden">
                <ul className="divide-y divide-border">
                  {weekDays.map((day) => {
                    const unlocked = isUnlocked(progress, day.id);
                    const done = isCompleted(progress, day.id);
                    const isToday = day.date === today;
                    const inner = (
                      <div
                        className={cn(
                          "flex items-start gap-3 px-3 py-2.5 md:items-center",
                          !unlocked && "opacity-55",
                          isToday && "bg-surface-hover",
                        )}
                      >
                        <div className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                          <div>{formatDateShort(day.date)}</div>
                          <div>{weekdayLabel(day.date)}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm">{day.title}</span>
                            {isToday ? <KindPill tone="brand">今日</KindPill> : null}
                            {day.makeup ? <KindPill>调休</KindPill> : null}
                            {day.holiday ? (
                              <KindPill>{holidayLabel[day.holiday]}</KindPill>
                            ) : null}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {day.blurb}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 md:flex-row md:items-center md:gap-2">
                          <KindPill
                            tone={
                              day.kind === "paper"
                                ? "warn"
                                : day.kind === "case"
                                  ? "brand"
                                  : "default"
                            }
                          >
                            {kindLabel[day.kind]} {day.durationMin}m
                          </KindPill>
                          {done ? (
                            <Check className="size-3.5 text-brand" />
                          ) : unlocked ? null : (
                            <Lock className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    );

                    if (!unlocked) {
                      return <li key={day.id}>{inner}</li>;
                    }
                    return (
                      <li key={day.id}>
                        <Link href={dayHref(day)} className="block hover:bg-surface-hover">
                          {inner}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Surface>
            </section>
          );
        })}

        <Surface className="px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="label-caps">EXAM</div>
              <div className="text-sm">{examConfig.examName}</div>
              <div className="text-xs text-muted-foreground">
                以准考证为准。本站倒计时使用配置中的 examDate。
              </div>
            </div>
            <div className="mono-num text-sm text-muted-foreground">{examConfig.examDate}</div>
          </div>
        </Surface>
      </div>
    </PageFrame>
  );
}
