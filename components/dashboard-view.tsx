"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { KindPill, Metric, PageFrame, Surface } from "@/components/ui-bits";
import { examConfig } from "@/lib/config";
import {
  dayHref,
  getDayById,
  kindLabel,
  studyDays,
} from "@/lib/calendar";
import { examCountdown, formatDateCn, pad2, todayISO, weekdayLabel } from "@/lib/dates";
import { accuracyPercent, dueMistakes, isCompleted } from "@/lib/progress";
import { resolveFocusDay } from "@/lib/progress";
import { getSession, useTrainerStore } from "@/lib/store";

const taskDefs = [
  { key: "review", label: "复习错题" },
  { key: "learn", label: "学习本日" },
  { key: "practice", label: "练习题" },
  { key: "wrapup", label: "收尾并完成本日" },
] as const;

export function DashboardView() {
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const progress = useTrainerStore((s) => s.progress);
  const mistakes = useTrainerStore((s) => s.mistakes);
  const sessions = useTrainerStore((s) => s.sessions);

  const today = todayISO(simulateDate);
  const focus = resolveFocusDay(progress, simulateDate);
  const calendarToday = getDayById(today);
  const display = calendarToday ?? focus;
  const session = getSession(sessions, display.id);
  const daysLeft = examCountdown(today);
  const acc = accuracyPercent(progress);
  const pending = dueMistakes(mistakes, today).length;
  const doneCount = progress.completedDays.length;
  const totalDays = studyDays.length;
  const inWindow = today >= examConfig.studyStart && today <= examConfig.studyEnd;
  const isExamDay = today === examConfig.examDate;
  const afterExam = today > examConfig.examDate;

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
            WEEK {pad2(display.week)} / 08
          </span>
          <span className="text-border">·</span>
          <span className="mono-num text-sm text-muted-foreground">
            DAY {pad2(display.dayInWeek)}
          </span>
          {simulateDate ? (
            <KindPill tone="brand">模拟 {simulateDate}</KindPill>
          ) : null}
        </div>
        <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
          {isExamDay
            ? "今天考试"
            : afterExam
              ? "考试日已过"
              : inWindow
                ? `今日 ${display.topic}`
                : `下一步 ${focus.topic}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateCn(today)} {weekdayLabel(today)}
          {inWindow ? ` · ${display.title}` : ` · 课程窗口 ${examConfig.studyStart} – ${examConfig.studyEnd}`}
        </p>
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
            value={`${display.durationMin} MIN`}
            hint={kindLabel[display.kind]}
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

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Surface className="p-4">
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
            href={dayHref(focus)}
            className="mt-5 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            {isCompleted(progress, focus.id) ? "查看学习日" : "继续学习"}
            <ArrowRight className="size-4" />
          </Link>
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
