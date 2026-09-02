"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StartDateControl } from "@/components/start-date-control";
import { KindPill, Metric, PageFrame, Surface } from "@/components/ui-bits";
import { examConfig } from "@/lib/config";
import {
  CURRICULUM_DAY_COUNT,
  dayHref,
  examOverlap,
  getDayOnDate,
  kindLabel,
  lastDay,
  studyDays,
} from "@/lib/calendar";
import { examCountdown, formatDateCn, pad2, todayISO, weekdayLabel } from "@/lib/dates";
import { accuracyPercent, dueMistakes, isCompleted } from "@/lib/progress";
import { resolveFocusDay } from "@/lib/progress";
import { getSession, resolvedStartDate, useTrainerStore } from "@/lib/store";

const taskDefs = [
  { key: "review", label: "复习错题" },
  { key: "learn", label: "学习本日" },
  { key: "practice", label: "练习题" },
  { key: "wrapup", label: "收尾并完成本日" },
] as const;

export function DashboardView() {
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const startDateRaw = useTrainerStore((s) => s.startDate);
  const setStartDate = useTrainerStore((s) => s.setStartDate);
  const progress = useTrainerStore((s) => s.progress);
  const mistakes = useTrainerStore((s) => s.mistakes);
  const sessions = useTrainerStore((s) => s.sessions);

  const startDate = resolvedStartDate(startDateRaw);
  const today = todayISO(simulateDate);
  const todayDay = getDayOnDate(startDate, today);
  const focus = resolveFocusDay(progress, simulateDate, startDate);
  const overlap = examOverlap(startDate);
  const session = getSession(sessions, (todayDay ?? focus).id);
  const daysLeft = examCountdown(today);
  const acc = accuracyPercent(progress);
  const pending = dueMistakes(mistakes, today).length;
  const doneCount = progress.completedDays.length;
  const totalDays = studyDays.length;
  const remainingLessons = studyDays.filter(
    (day) => !isCompleted(progress, day.id),
  ).length;
  const isExamDay = today === examConfig.examDate;
  const afterExam = today > examConfig.examDate;
  const phase: "before" | "active" | "after" =
    today < startDate ? "before" : todayDay ? "active" : "after";
  const display = todayDay ?? focus;

  const heading = isExamDay
    ? "今天考试"
    : afterExam
      ? "考试日已过"
      : phase === "before"
        ? "还没开营"
        : phase === "after"
          ? "课表已结束"
          : `今日 ${display.topic}`;

  const subline =
    phase === "before"
      ? `开营日 ${formatDateCn(startDate)} ${weekdayLabel(startDate)} · 今天尚未进入第 1 日`
      : phase === "after"
        ? `课表 ${overlap.start} – ${overlap.end} · 进入冲刺复盘`
        : display.title;

  const tasks = taskDefs.map((task) => {
    const done =
      task.key === "review"
        ? session.reviewDone
        : task.key === "learn"
          ? session.learnDone
          : task.key === "practice"
            ? session.practiceDone
            : session.wrapupDone || isCompleted(progress, display.id);
    return { ...task, done };
  });

  return (
    <PageFrame>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-num text-sm text-brand">
            {phase === "active"
              ? `WEEK ${pad2(display.week)} / 08`
              : phase === "before"
                ? "NOT STARTED"
                : "SPRINT / REVIEW"}
          </span>
          {phase === "active" ? (
            <>
              <span className="text-border">·</span>
              <span className="mono-num text-sm text-muted-foreground">
                DAY {pad2(display.dayInWeek)}
              </span>
            </>
          ) : null}
          {simulateDate ? (
            <KindPill tone="brand">模拟 {simulateDate}</KindPill>
          ) : null}
        </div>
        <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
          {heading}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateCn(today)} {weekdayLabel(today)}
          {isExamDay || afterExam ? ` · ${examConfig.examName}` : ` · ${subline}`}
        </p>
      </div>

      <div className="mt-6">
        <StartDateControl />
      </div>

      <Surface className="mt-6">
        <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-5">
          <Metric
            label="距考试"
            value={daysLeft > 0 ? `${pad2(daysLeft)} 天` : "—"}
            hint={examConfig.examName}
          />
          <Metric
            label="总进度"
            value={`${pad2(doneCount)} / ${pad2(totalDays)}`}
            hint="已完成学习日"
          />
          <Metric
            label="今日时长"
            value={phase === "active" ? `${display.durationMin} MIN` : "—"}
            hint={phase === "active" ? kindLabel[display.kind] : "不在课表日"}
          />
          <Metric
            label="正确率"
            value={acc === null ? "—" : `${acc}%`}
            hint={`${progress.correctQuestions}/${progress.totalQuestions} 题`}
          />
          <Metric
            label="待复习"
            value={pad2(pending)}
            hint="到期错题"
          />
        </div>
        <div className="border-t border-border px-4 py-3">
          <Progress value={totalDays ? (doneCount / totalDays) * 100 : 0} />
        </div>
      </Surface>

      {overlap.overrunsExam && phase !== "before" ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          课表与考试重叠：距考试 {daysLeft > 0 ? `${daysLeft} 天` : "已到/已过"}
          ，课程还剩 {remainingLessons} / {CURRICULUM_DAY_COUNT} 日。考试日仍是{" "}
          {examConfig.examDate}。
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Surface className="p-4">
          {phase === "before" ? (
            <>
              <div className="label-caps">尚未开始</div>
              <div className="mt-1 text-base font-medium">
                开营日是 {formatDateCn(startDate)} {weekdayLabel(startDate)}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                今天还没到第 1 日。可以把开始日改成今天立刻开营，或先浏览 8 周计划。
                改开始日不会清空已有进度。
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStartDate(todayISO())}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  用今天开营
                  <ArrowRight className="size-4" />
                </button>
                <Link
                  href="/plan"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm hover:bg-muted"
                >
                  查看计划
                </Link>
              </div>
            </>
          ) : phase === "after" ? (
            <>
              <div className="label-caps">冲刺复盘</div>
              <div className="mt-1 text-base font-medium">课表 53 日已经走完</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                最后一课是 {formatDateCn(overlap.end)} 的「{lastDay.title}」。
                {remainingLessons > 0
                  ? ` 还有 ${remainingLessons} 个学习日未完成，可以从焦点日补上。`
                  : " 没有未完成的学习日。用错题本把到期题清掉，考试日不排新课。"}
                {isExamDay ? " 今天是考试日。" : null}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {remainingLessons > 0 ? (
                  <Link
                    href={dayHref(focus)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                  >
                    补未完成的学习日
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link
                    href="/mistakes"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                  >
                    去错题本
                    <ArrowRight className="size-4" />
                  </Link>
                )}
                <Link
                  href="/plan"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm hover:bg-muted"
                >
                  回看课表
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="label-caps">今日任务</div>
                <KindPill tone="brand">{kindLabel[display.kind]}</KindPill>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{display.blurb}</div>
              <ol className="mt-4 space-y-2">
                {tasks.map((task, index) => (
                  <li
                    key={task.key}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-sm border font-mono text-[10px] ${
                        task.done
                          ? "border-brand/40 bg-brand/10 text-brand"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {task.done ? "✓" : pad2(index + 1)}
                    </span>
                    <span className={task.done ? "text-muted-foreground line-through" : ""}>
                      {task.label}
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href={dayHref(todayDay ?? focus)}
                className="mt-5 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                {isCompleted(progress, (todayDay ?? focus).id)
                  ? "查看学习日"
                  : "继续学习"}
                <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </Surface>

        <Surface className="p-4">
          <div className="label-caps">当前焦点</div>
          <div className="mt-2 text-base font-medium">{focus.title}</div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            WEEK {pad2(focus.week)} · DAY {pad2(focus.dayInWeek)} · {focus.date}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{focus.blurb}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <KindPill>{focus.module}</KindPill>
            <KindPill>{focus.status === "live" ? "已开放题库" : "路线占位"}</KindPill>
            {focus.makeup ? <KindPill>调休 45 MIN</KindPill> : null}
          </div>
        </Surface>
      </div>
    </PageFrame>
  );
}
