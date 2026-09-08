"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KindPill, PageFrame, PageHeader, Surface } from "@/components/ui-bits";
import {
  CURRICULUM_LENGTH,
  dayHref,
  getDayByDate,
  holidayLabel,
  kindLabel,
  lastPlannedDate,
  planPhase,
  scheduleDays,
  scheduleWeeks,
} from "@/lib/calendar";
import { examConfig } from "@/lib/config";
import { examCountdown, formatDateShort, pad2, todayISO, weekdayLabel } from "@/lib/dates";
import { dayPracticeModule, practiceModuleHref } from "@/lib/practice";
import { firstIncompleteUnlocked, isCompleted, isUnlocked } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";
import type { StudyDay } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlanView() {
  const progress = useTrainerStore((s) => s.progress);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const startDate = useTrainerStore((s) => s.startDate);
  const unlockAll = useTrainerStore((s) => s.unlockAll);
  const planHideDone = useTrainerStore((s) => s.planHideDone);
  const setPlanHideDone = useTrainerStore((s) => s.setPlanHideDone);
  const today = todayISO(simulateDate);
  const daysLeft = examCountdown(today);
  const days = scheduleDays(startDate);
  const weeks = scheduleWeeks(startDate);
  const lastDate = lastPlannedDate(startDate);
  const planOverrunsExam = lastDate > examConfig.examDate;
  const phase = planPhase(startDate, today);
  const todayDay = getDayByDate(startDate, today);
  const nextIncomplete = useMemo(() => {
    const focus = firstIncompleteUnlocked(progress, unlockAll);
    return days.find((day) => day.id === focus.id) ?? focus;
  }, [days, progress, unlockAll]);
  const nextIncompleteUnlocked =
    nextIncomplete && isUnlocked(progress, nextIncomplete.id, unlockAll)
      ? nextIncomplete
      : null;
  const hasIncomplete =
    Boolean(nextIncompleteUnlocked) &&
    !isCompleted(progress, nextIncompleteUnlocked!.id);

  const dayRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());
  const weekRefs = useRef<Map<number, HTMLElement | null>>(new Map());
  const [flashId, setFlashId] = useState<string | null>(null);
  const [jumpTip, setJumpTip] = useState<string | null>(null);

  useEffect(() => {
    if (!flashId) return;
    const timer = window.setTimeout(() => setFlashId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [flashId]);

  const locateToday = useCallback(() => {
    if (phase === "not-started") {
      setJumpTip("未开课");
      return;
    }
    if (phase === "after-plan") {
      setJumpTip("计划已结束");
      return;
    }
    setJumpTip(null);
    if (!todayDay) return;
    const el = dayRefs.current.get(todayDay.id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(todayDay.id);
      return;
    }
    // Hidden by 「只看未完成」 — scroll week header if all-done, else tip.
    if (planHideDone && isCompleted(progress, todayDay.id)) {
      const weekEl = weekRefs.current.get(todayDay.week);
      weekEl?.scrollIntoView({ behavior: "smooth", block: "start" });
      setJumpTip("今日已完成");
      return;
    }
  }, [phase, todayDay, planHideDone, progress]);

  return (
    <PageFrame className="plan-print-root">
      <PageHeader
        kicker="8-WEEK ROADMAP"
        title="课程日历"
        description={
          planOverrunsExam
            ? `开课日 ${startDate}，共 ${CURRICULUM_LENGTH} 日，排到 ${lastDate}，晚于考试日 ${examConfig.examDate}。倒计时仍按 examDate，考试前剩余 ${Math.max(daysLeft, 0)} 天。`
            : `开课日 ${startDate}，共 ${CURRICULUM_LENGTH} 日，至 ${lastDate}。考试日从 examDate 读取，不排课。`
        }
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

      <Surface className="print-hidden mb-6 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={locateToday}>
            定位今日
          </Button>
          {hasIncomplete && nextIncompleteUnlocked ? (
            <Link
              href={dayHref(nextIncompleteUnlocked)}
              className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm hover:bg-muted"
            >
              下一个未完成
            </Link>
          ) : (
            <Button type="button" size="sm" variant="outline" disabled>
              下一个未完成
            </Button>
          )}
          <button
            type="button"
            onClick={() => setPlanHideDone(!planHideDone)}
            className={cn(
              "inline-flex h-8 items-center rounded-md border px-2.5 text-sm transition-colors",
              planHideDone
                ? "border-brand/50 bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-pressed={planHideDone}
            title={planHideDone ? "显示全部日程" : "只显示未完成的日程"}
          >
            只看未完成
          </button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="size-3.5" />
            打印计划
          </Button>
          {jumpTip ? (
            <span className="font-mono text-[11px] text-amber-400">{jumpTip}</span>
          ) : phase === "not-started" ? (
            <span className="text-xs text-muted-foreground">未开课 · 开课日 {startDate}</span>
          ) : phase === "after-plan" ? (
            <span className="text-xs text-muted-foreground">计划已结束 · 末日 {lastDate}</span>
          ) : todayDay ? (
            <span className="text-xs text-muted-foreground">
              今日 {todayDay.date} · {todayDay.title}
            </span>
          ) : null}
        </div>
      </Surface>

      <div className="space-y-6">
        {weeks.map((week) => {
          const weekDays = days.filter((day) => day.week === week.week);
          const visibleDays = planHideDone
            ? weekDays.filter((day) => !isCompleted(progress, day.id))
            : weekDays;
          const weekAllDone =
            planHideDone && weekDays.length > 0 && visibleDays.length === 0;
          return (
            <section
              key={week.week}
              ref={(node) => {
                weekRefs.current.set(week.week, node);
              }}
            >
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
                {weekAllDone ? (
                  <div className="px-3 py-2.5 text-sm text-muted-foreground">本周已完成</div>
                ) : (
                  <ul className="divide-y divide-border">
                    {visibleDays.map((day) => {
                      const unlocked = isUnlocked(progress, day.id, unlockAll);
                      const done = isCompleted(progress, day.id);
                      const isToday = day.date === today;
                      const flashing = flashId === day.id;
                      const practiceModule = dayPracticeModule(day);
                      const practiceCta =
                        practiceModule != null ? (
                          <Link
                            href={practiceModuleHref(practiceModule)}
                            className="print-hidden inline-flex h-7 items-center rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={`练习模块：${practiceModule}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            练此模块
                          </Link>
                        ) : null;
                      const meta = (
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
                          {practiceCta}
                          {done ? (
                            <Check className="print-hidden size-3.5 text-brand" />
                          ) : unlocked ? null : (
                            <Lock className="print-hidden size-3.5 text-muted-foreground" />
                          )}
                        </div>
                      );
                      const body = (
                        <>
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
                        </>
                      );
                      const rowClass = cn(
                        "flex items-start gap-3 px-3 py-2.5 md:items-center",
                        !unlocked && "opacity-55",
                        isToday && "bg-surface-hover",
                        flashing && "ring-2 ring-inset ring-brand/60 bg-brand/10",
                      );

                      return (
                        <li
                          key={day.id}
                          ref={(node) => {
                            dayRefs.current.set(day.id, node);
                          }}
                        >
                          {unlocked ? (
                            <div className={cn(rowClass, "hover:bg-surface-hover")}>
                              <Link
                                href={dayHref(day)}
                                className="flex min-w-0 flex-1 items-start gap-3 md:items-center"
                              >
                                {body}
                              </Link>
                              {meta}
                            </div>
                          ) : (
                            <div className={rowClass}>
                              {body}
                              {meta}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
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
