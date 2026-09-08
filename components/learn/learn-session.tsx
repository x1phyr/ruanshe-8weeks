"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { getLesson } from "@/data/lessons";
import { getQuestionById, questionsForDay } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { KindPill, Surface } from "@/components/ui-bits";
import { LessonView } from "@/components/learn/lesson-view";
import { PaperTimer } from "@/components/learn/paper-timer";
import { QuizRun, type QuizFinishSummary } from "@/components/learn/quiz-run";
import { dayHref, getDayById, getNextDay, kindLabel } from "@/lib/calendar";
import { pad2, todayISO } from "@/lib/dates";
import { dueMistakes, isCompleted, isUnlocked } from "@/lib/progress";
import { getSession, resolveStep, useTrainerStore } from "@/lib/store";
import type { LearnStep, MistakeReason, StudyDay } from "@/lib/types";

const steps: { id: LearnStep; label: string }[] = [
  { id: "review", label: "复习" },
  { id: "learn", label: "学习" },
  { id: "practice", label: "练习" },
  { id: "wrapup", label: "收尾" },
];

const reasonLabel: Record<MistakeReason, string> = {
  unknown: "未标注",
  misunderstood: "概念不清",
  calculation: "计算失误",
  careless: "看错题",
};

export function LearnSession({ day }: { day: StudyDay }) {
  const router = useRouter();
  const progress = useTrainerStore((s) => s.progress);
  const mistakes = useTrainerStore((s) => s.mistakes);
  const sessions = useTrainerStore((s) => s.sessions);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const startDate = useTrainerStore((s) => s.startDate);
  const unlockAll = useTrainerStore((s) => s.unlockAll);
  const markStep = useTrainerStore((s) => s.markStep);
  const completeDay = useTrainerStore((s) => s.completeDay);
  const setMistakeReason = useTrainerStore((s) => s.setMistakeReason);
  const [forced, setForced] = useState<LearnStep | null>(null);
  const [lastQuiz, setLastQuiz] = useState<QuizFinishSummary | null>(null);

  const scheduled = getDayById(day.id, startDate) ?? day;
  const session = getSession(sessions, scheduled.id);
  const derived = resolveStep(session);
  const step = forced && stepUnlocked(session, forced) ? forced : derived;
  const today = todayISO(simulateDate);
  const unlocked = isUnlocked(progress, scheduled.id, unlockAll);
  const completed = isCompleted(progress, scheduled.id);
  const lesson = getLesson(scheduled.id);
  const bank = questionsForDay(scheduled.id);
  const due = useMemo(
    () =>
      dueMistakes(mistakes, today)
        .map((item) => getQuestionById(item.questionId))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [mistakes, today],
  );
  const newMistakes = mistakes.filter((item) => item.lastWrongAt === today);

  if (!unlocked) {
    return (
      <FocusFrame day={scheduled} step={step} onStep={() => undefined}>
        <Surface className="p-6">
          <div className="label-caps">LOCKED</div>
          <h2 className="mt-2 text-lg font-medium">本日尚未解锁</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            v1 默认不允许跳关。完成上一学习日之后才会打开 {scheduled.date} · {scheduled.title}。也可在侧栏「调试设置」中开启「全解锁（调试）」浏览全部学习日（不会自动标完成）。
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-8 items-center rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground"
          >
            回到今日
          </Link>
        </Surface>
      </FocusFrame>
    );
  }

  return (
    <FocusFrame
      day={scheduled}
      step={step}
      onStep={(next) => {
        if (stepUnlocked(session, next) || completed) setForced(next);
      }}
    >
      {step === "review" ? (
        due.length === 0 ? (
          <div>
            <div className="label-caps">REVIEW</div>
            <h2 className="mt-2 text-xl font-medium">没有到期错题</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              昨天若没有错题，这一步直接跳过。做错的题会按 1 / 3 / 7 天回来。
            </p>
            <Button
              className="mt-5"
              onClick={() => {
                markStep(scheduled.id, "review");
                setForced("learn");
              }}
            >
              进入学习
            </Button>
          </div>
        ) : (
          <div>
            <div className="label-caps">REVIEW · {pad2(due.length)} 题</div>
            <h2 className="mt-2 text-xl font-medium">先消化到期错题</h2>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">
              做对进入 14 天后再见；连续做对记为已掌握。做错会拉长间隔。
            </p>
            <QuizRun
              questions={due}
              mode="review"
              navKey={`review:${scheduled.id}`}
              finishLabel="进入学习"
              onFinished={(summary) => {
                setLastQuiz(summary);
                markStep(scheduled.id, "review");
                setForced("learn");
              }}
            />
          </div>
        )
      ) : null}

      {step === "learn" ? (
        <div>
          <div className="label-caps">
            LEARN · {scheduled.durationMin} MIN · {kindLabel[scheduled.kind]}
          </div>
          <h2 className="mt-2 text-xl font-medium">{scheduled.title}</h2>
          <p className="mt-2 mb-5 text-sm text-muted-foreground">{scheduled.blurb}</p>
          {scheduled.status === "paper" ? <PaperTimer day={scheduled} /> : null}
          {lesson ? <LessonView lesson={lesson} /> : null}
          <Button
            className="mt-6"
            onClick={() => {
              markStep(scheduled.id, "learn");
              setForced("practice");
            }}
          >
            {bank.length > 0 ? "开始练习" : "下一步"}
          </Button>
        </div>
      ) : null}

      {step === "practice" ? (
        bank.length === 0 ? (
          <div>
            <div className="label-caps">PRACTICE</div>
            <h2 className="mt-2 text-xl font-medium">本题暂无完整题库</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {scheduled.status === "paper"
                ? "试卷日先用计时占位。可以把本日标记完成，解锁下一天。"
                : "本日暂无练习题。试卷日请用计时壳与自备合法材料；其他日应已配置题库。"}
            </p>
            <Button
              className="mt-5"
              onClick={() => {
                markStep(scheduled.id, "practice");
                setForced("wrapup");
              }}
            >
              去收尾
            </Button>
          </div>
        ) : (
          <div>
            <div className="label-caps">PRACTICE · {pad2(bank.length)} 题</div>
            <h2 className="mt-2 mb-5 text-xl font-medium">提交后立刻看解释</h2>
            <QuizRun
              questions={bank}
              mode="daily"
              navKey={`day:${scheduled.id}`}
              finishLabel="进入收尾"
              onFinished={(summary) => {
                setLastQuiz(summary);
                markStep(scheduled.id, "practice");
                setForced("wrapup");
              }}
            />
          </div>
        )
      ) : null}

      {step === "wrapup" ? (
        <div>
          <div className="label-caps">WRAP UP</div>
          <h2 className="mt-2 text-xl font-medium">
            {completed ? "本日已完成" : "记录错题，然后完成本日"}
          </h2>
          {lastQuiz ? (
            <Surface className="mt-4 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="label-caps">本组得分</div>
                  <div className="mt-1 font-mono text-lg">
                    {lastQuiz.percent}% · {pad2(lastQuiz.correct)}/{pad2(lastQuiz.total)}
                  </div>
                </div>
                {lastQuiz.wrongIndexes.length > 0 ? (
                  <KindPill tone="warn">
                    错 {pad2(lastQuiz.wrongIndexes.length)} 题
                  </KindPill>
                ) : (
                  <KindPill tone="ok">全对</KindPill>
                )}
              </div>
              {lastQuiz.wrongIndexes.length > 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  错题题号：{lastQuiz.wrongIndexes.map((i) => i + 1).join("、")}
                </p>
              ) : null}
            </Surface>
          ) : null}
          {newMistakes.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              今天没有新错题。可以完成本日并解锁下一天。
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {newMistakes.map((item) => {
                const question = getQuestionById(item.questionId);
                return (
                  <li key={item.questionId} className="rounded-md border border-border p-3">
                    <div className="text-sm leading-6">{question?.stem ?? item.questionId}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.selectedAnswer} → {item.correctAnswer} · 下次复习{" "}
                      {item.nextReviewAt}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(Object.keys(reasonLabel) as MistakeReason[]).map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setMistakeReason(item.questionId, reason)}
                          className={`h-6 rounded-sm border px-2 text-[11px] ${
                            item.reason === reason
                              ? "border-brand/40 bg-brand/10 text-brand"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {reasonLabel[reason]}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {!completed ? (
              <Button
                onClick={() => {
                  markStep(scheduled.id, "wrapup");
                  completeDay(scheduled.id);
                }}
              >
                完成本日
              </Button>
            ) : (
              <KindPill tone="ok">DAY COMPLETED</KindPill>
            )}
            {completed && getNextDay(scheduled.id, startDate) ? (
              <Button
                variant="outline"
                onClick={() => {
                  const next = getNextDay(scheduled.id, startDate);
                  if (next) router.push(dayHref(next));
                }}
              >
                进入下一天
              </Button>
            ) : null}
            <Link
              href="/"
              className="inline-flex h-8 items-center rounded-md px-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              回仪表盘
            </Link>
          </div>
        </div>
      ) : null}
    </FocusFrame>
  );
}

function stepUnlocked(session: ReturnType<typeof getSession>, step: LearnStep) {
  if (step === "review") return true;
  if (step === "learn") return session.reviewDone;
  if (step === "practice") return session.learnDone;
  return session.practiceDone;
}

function FocusFrame({
  day,
  step,
  onStep,
  children,
}: {
  day: StudyDay;
  step: LearnStep;
  onStep: (step: LearnStep) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur">
        <Link
          href="/"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          aria-label="退出专注"
        >
          <X className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">{day.title}</div>
          <div className="font-mono text-[10px] tracking-wide text-muted-foreground">
            WEEK {pad2(day.week)} · DAY {pad2(day.dayInWeek)} · {day.date}
          </div>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          {steps.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onStep(item.id)}
              className={`h-7 rounded-sm px-2 font-mono text-[10px] tracking-wide ${
                item.id === step
                  ? "bg-surface-hover text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {pad2(index + 1)} {item.label}
            </button>
          ))}
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">{children}</main>
    </div>
  );
}
