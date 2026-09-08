"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Settings2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimulateDialog } from "@/components/simulate-dialog";
import { QuizRun } from "@/components/learn/quiz-run";
import { KindPill, Metric, PageFrame, Surface } from "@/components/ui-bits";
import { getQuestionById } from "@/data/questions";
import { examConfig } from "@/lib/config";
import {
  CURRICULUM_LENGTH,
  dayHref,
  getDayByDate,
  kindLabel,
  lastPlannedDate,
  planPhase,
  scheduleDays,
} from "@/lib/calendar";
import {
  diffDays,
  examCountdown,
  formatDateCn,
  pad2,
  todayISO,
  weekdayLabel,
} from "@/lib/dates";
import { accuracyPercent, dueMistakes, isCompleted, resolveFocusDay } from "@/lib/progress";
import { getSession, useTrainerStore } from "@/lib/store";
import type {
  AnswerRecord,
  DaySession,
  Mistake,
  Progress as ProgressState,
  StudyDay,
} from "@/lib/types";

const taskDefs = [
  { key: "review", label: "复习错题" },
  { key: "learn", label: "学习本日" },
  { key: "practice", label: "练习题" },
  { key: "wrapup", label: "收尾并完成本日" },
] as const;

export function DashboardView() {
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const startDate = useTrainerStore((s) => s.startDate);
  const unlockAll = useTrainerStore((s) => s.unlockAll);
  const setStartDate = useTrainerStore((s) => s.setStartDate);
  const progress = useTrainerStore((s) => s.progress);
  const mistakes = useTrainerStore((s) => s.mistakes);
  const answers = useTrainerStore((s) => s.answers);
  const sessions = useTrainerStore((s) => s.sessions);
  const streak = useTrainerStore((s) => s.streak);

  const today = todayISO(simulateDate);
  const realToday = todayISO();
  const days = scheduleDays(startDate);
  const lastDate = lastPlannedDate(startDate);
  const phase = planPhase(startDate, today);
  const calendarToday = getDayByDate(startDate, today);
  const focus = resolveFocusDay(progress, simulateDate, startDate, unlockAll);
  const daysLeft = examCountdown(today);
  const acc = accuracyPercent(progress);
  const pending = dueMistakes(mistakes, today).length;
  const doneCount = progress.completedDays.length;
  const totalDays = days.length;
  const isExamDay = today === examConfig.examDate;
  const afterExam = today > examConfig.examDate;
  const remainingLessons = days.filter((day) => day.date >= today).length;
  const incompleteCount = days.filter((day) => !isCompleted(progress, day.id)).length;
  const planOverrunsExam = lastDate > examConfig.examDate;
  const lessonsBeforeExam = days.filter((day) => day.date < examConfig.examDate).length;

  return (
    <PageFrame>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {phase === "active" && calendarToday ? (
              <>
                <span className="mono-num text-sm text-brand">
                  WEEK {pad2(calendarToday.week)} / 08
                </span>
                <span className="text-border">·</span>
                <span className="mono-num text-sm text-muted-foreground">
                  DAY {pad2(calendarToday.dayInWeek)}
                </span>
              </>
            ) : (
              <span className="mono-num text-sm text-brand">
                {phase === "not-started" ? "尚未开课" : "计划已结束"}
              </span>
            )}
            {simulateDate ? (
              <KindPill tone="brand">模拟 {simulateDate}</KindPill>
            ) : null}
          </div>
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            {isExamDay
              ? "今天考试"
              : afterExam
                ? "考试日已过"
                : phase === "not-started"
                  ? "课程尚未开始"
                  : phase === "after-plan"
                    ? "计划日历已经走完"
                    : `今日 ${calendarToday?.topic ?? focus.topic}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateCn(today)} {weekdayLabel(today)}
            {phase === "active" && calendarToday
              ? ` · ${calendarToday.title}`
              : phase === "not-started"
                ? ` · 开课日 ${startDate}`
                : ` · 最后学习日 ${lastDate}`}
          </p>
        </div>
        <SimulateDialog>
          <button
            type="button"
            aria-label="调试设置"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground md:hidden"
          >
            <Settings2 className="size-4" />
          </button>
        </SimulateDialog>
      </div>

      <StartDateControl
        startDate={startDate}
        lastDate={lastDate}
        realToday={realToday}
        daysLeft={daysLeft}
        remainingLessons={remainingLessons}
        planOverrunsExam={planOverrunsExam}
        lessonsBeforeExam={lessonsBeforeExam}
        onChange={setStartDate}
      />

      <Surface className="mt-4">
        <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-3 lg:grid-cols-6">
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
            label="连续学习"
            value={streak > 0 ? `连续 ${streak} 天` : "—"}
            hint={streak > 0 ? "学习打卡" : "完成本日或做题开始"}
          />
          <Metric
            label="今日时长"
            value={
              phase === "active" && calendarToday
                ? `${calendarToday.durationMin} MIN`
                : "—"
            }
            hint={
              phase === "active" && calendarToday
                ? kindLabel[calendarToday.kind]
                : phase === "not-started"
                  ? "未开课"
                  : "计划外"
            }
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

      {phase === "not-started" ? (
        <Surface className="mt-6 p-5">
          <div className="label-caps">NOT STARTED</div>
          <h2 className="mt-2 text-lg font-medium">还没到开课日</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            学习从 {formatDateCn(startDate)} 开始，还有 {diffDays(today, startDate)}{" "}
            天。考试日仍是 {examConfig.examDate}，倒计时 {daysLeft > 0 ? `${daysLeft} 天` : "已过"}。
            想今天就开始，点「用今天」。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => setStartDate(realToday)}>
              用今天
            </Button>
            <Link
              href="/plan"
              className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm hover:bg-muted"
            >
              查看计划
            </Link>
          </div>
        </Surface>
      ) : null}

      {phase === "after-plan" ? (
        <Surface className="mt-6 p-5">
          <div className="label-caps">SPRINT / REVIEW</div>
          <h2 className="mt-2 text-lg font-medium">计划日历已经走完</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            最后学习日是 {lastDate}。
            {daysLeft > 0
              ? ` 距考试还有 ${daysLeft} 天，未完成课程 ${incompleteCount} 课。不要改考试日；用错题本和模块练习继续收口。`
              : " 考试日已过。进度仍按学习日保留。"}
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
            <Link
              href="/plan"
              className="inline-flex h-8 items-center rounded-md px-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              回看计划
            </Link>
          </div>
        </Surface>
      ) : null}

      {phase === "active" && calendarToday ? (
        <ActiveDayPanel
          display={calendarToday}
          focus={focus}
          progress={progress}
          sessions={sessions}
        />
      ) : null}

      {progress.totalQuestions > 0 ? (
        <AccuracyCard
          progress={progress}
          answers={answers}
          accuracy={acc}
          pending={pending}
        />
      ) : null}

      <WeakTopicsCard mistakes={mistakes} today={today} />
    </PageFrame>
  );
}

function StartDateControl({
  startDate,
  lastDate,
  realToday,
  daysLeft,
  remainingLessons,
  planOverrunsExam,
  lessonsBeforeExam,
  onChange,
}: {
  startDate: string;
  lastDate: string;
  realToday: string;
  daysLeft: number;
  remainingLessons: number;
  planOverrunsExam: boolean;
  lessonsBeforeExam: number;
  onChange: (value: string) => void;
}) {
  return (
    <Surface className="mt-6 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-1.5">
          <Label htmlFor="start-date">开课日</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(event) => {
                if (event.target.value) onChange(event.target.value);
              }}
              className="w-[11.5rem] font-mono"
            />
            <Button type="button" variant="outline" onClick={() => onChange(realToday)}>
              用今天
            </Button>
          </div>
        </div>
        <p className="max-w-xl text-xs leading-5 text-muted-foreground">
          第 1 日对应 {startDate}，共 {CURRICULUM_LENGTH} 日，最后一日 {lastDate}。
          考试日固定为 {examConfig.examDate}，不随开课日改动。
          {planOverrunsExam
            ? ` 计划会排到考试日之后：距考试 ${Math.max(daysLeft, 0)} 天，考试前能排上 ${lessonsBeforeExam} 课，今天起剩余课程 ${remainingLessons} 课。`
            : null}
        </p>
      </div>
    </Surface>
  );
}

function ActiveDayPanel({
  display,
  focus,
  progress,
  sessions,
}: {
  display: StudyDay;
  focus: StudyDay;
  progress: ProgressState;
  sessions: Record<string, DaySession>;
}) {
  const session = getSession(sessions, display.id);
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
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Surface className="p-4">
        <div className="flex items-center justify-between">
          <div className="label-caps">今日任务</div>
          <KindPill tone="brand">{kindLabel[display.kind]}</KindPill>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{display.blurb}</div>
        <ol className="mt-4 space-y-2">
          {tasks.map((task, index) => (
            <li key={task.key} className="flex items-center gap-3 text-sm">
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
  );
}


const RECENT_WINDOW = 20;
const LOW_ACCURACY = 70;

function AccuracyCard({
  progress,
  answers,
  accuracy,
  pending,
}: {
  progress: ProgressState;
  answers: AnswerRecord[];
  accuracy: number | null;
  pending: number;
}) {
  const recent = answers.slice(-RECENT_WINDOW);
  const recentCorrect = recent.filter((a) => a.correct).length;
  const recentPct =
    recent.length > 0
      ? Math.round((recentCorrect / recent.length) * 100)
      : null;
  const low = accuracy !== null && accuracy < LOW_ACCURACY;
  const showMistakesLink = low || pending > 0;

  return (
    <Surface className="mt-6 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="label-caps">ACCURACY</div>
          <div className="mt-1 font-mono text-2xl tracking-wide">
            {accuracy === null ? "—" : `${accuracy}%`}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            累计作答 {progress.totalQuestions} 题 · 正确{" "}
            {progress.correctQuestions}
          </p>
          {recentPct !== null ? (
            <p className="mt-1 text-xs text-muted-foreground">
              近 {recent.length} 题正确率 {recentPct}%（{recentCorrect}/
              {recent.length}）
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {low ? (
            <KindPill tone="warn">正确率偏低</KindPill>
          ) : accuracy !== null && accuracy >= 80 ? (
            <KindPill tone="ok">状态良好</KindPill>
          ) : (
            <KindPill tone="brand">继续保持</KindPill>
          )}
          {showMistakesLink ? (
            <Link
              href="/mistakes"
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {pending > 0 ? `去错题本 · ${pad2(pending)} 到期` : "去错题本复盘"}
              <ArrowRight className="size-3" />
            </Link>
          ) : (
            <Link
              href="/mistakes"
              className="inline-flex h-7 items-center rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              错题本
            </Link>
          )}
        </div>
      </div>
    </Surface>
  );
}

function WeakTopicsCard({
  mistakes,
  today,
}: {
  mistakes: Mistake[];
  today: string;
}) {
  const [drilling, setDrilling] = useState(false);
  const active = mistakes.filter((m) => !m.mastered);
  const due = dueMistakes(mistakes, today);
  const wrongOnlyQuestions = useMemo(() => {
    const duePool = dueMistakes(mistakes, today);
    const pool =
      duePool.length > 0 ? duePool : mistakes.filter((m) => !m.mastered);
    return pool
      .map((item) => getQuestionById(item.questionId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [mistakes, today]);

  const buckets = new Map<string, number>();
  for (const item of active) {
    const q = getQuestionById(item.questionId);
    const pathHead = q?.knowledgePath?.split("/")[0]?.trim();
    const key = pathHead || item.topic || "未分类";
    buckets.set(key, (buckets.get(key) ?? 0) + item.wrongCount);
  }
  const top = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh"))
    .slice(0, 5);

  if (drilling && wrongOnlyQuestions.length > 0) {
    return (
      <Surface className="mt-6 p-4">
        <button
          type="button"
          onClick={() => setDrilling(false)}
          className="label-caps hover:text-foreground"
        >
          ← 返回弱项
        </button>
        <h2 className="mt-2 text-lg font-medium">只练错题</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {due.length > 0
            ? `到期 ${wrongOnlyQuestions.length} 题`
            : `未掌握 ${wrongOnlyQuestions.length} 题`}
        </p>
        <div className="mt-4">
          <QuizRun
            questions={wrongOnlyQuestions}
            mode="review"
            navKey="dashboard:wrong-only"
            finishLabel="返回仪表盘"
            onFinished={() => setDrilling(false)}
          />
        </div>
      </Surface>
    );
  }

  return (
    <Surface className="mt-6 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="label-caps">WEAK MODULES</div>
          <div className="mt-1 text-sm text-muted-foreground">
            按知识点首段汇总未掌握错题
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            disabled={wrongOnlyQuestions.length === 0}
            onClick={() => {
              if (wrongOnlyQuestions.length === 0) return;
              setDrilling(true);
            }}
          >
            只练错题
            {wrongOnlyQuestions.length > 0 ? ` ${wrongOnlyQuestions.length}` : ""}
          </Button>
          <Link
            href="/mistakes"
            className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            错题本
          </Link>
          <Link
            href="/practice"
            className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            练习
          </Link>
        </div>
      </div>
      {top.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">暂无弱项 · 练几题后再看这里</p>
      ) : (
        <ul className="mt-3 divide-y divide-border border-t border-border">
          {top.map(([name, count]) => (
            <li key={name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate text-foreground">{name}</span>
              <span className="mono-num shrink-0 text-muted-foreground">{pad2(count)}</span>
            </li>
          ))}
        </ul>
      )}
    </Surface>
  );
}
