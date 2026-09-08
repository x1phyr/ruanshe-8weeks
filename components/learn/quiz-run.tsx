"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flag } from "lucide-react";
import { FocusModeToggle } from "@/components/focus-mode";
import { Button } from "@/components/ui/button";
import { KindPill, Surface } from "@/components/ui-bits";
import { pad2 } from "@/lib/dates";
import { formatRemain } from "@/components/learn/paper-timer";
import { currentToday, useTrainerStore } from "@/lib/store";
import type { OptionKey, Question } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface QuizFinishSummary {
  correct: number;
  total: number;
  percent: number;
  answered: number;
  timedOut?: boolean;
  wrongIndexes: number[];
  byTopic: { topic: string; correct: number; total: number }[];
}

interface QuizRunProps {
  questions: Question[];
  mode: "daily" | "practice" | "review";
  onFinished: (summary: QuizFinishSummary) => void;
  /** Persist flagged ids in sessionStorage when set (e.g. dayId or module name). */
  navKey?: string;
  /** Label on scorecard continue button (default 继续). */
  finishLabel?: string;
  /** When set, show countdown and auto-finish on timeout (seconds). */
  timeLimitSec?: number;
}

const NAV_THRESHOLD = 12;
const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("[contenteditable='true']"));
}


type FlagStore = Record<string, string[]>;

function loadFlags(navKey: string | undefined): Set<string> {
  if (!navKey || typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem("quiz-flags");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as FlagStore;
    return new Set(parsed[navKey] ?? []);
  } catch {
    return new Set();
  }
}

function saveFlags(navKey: string | undefined, flagged: Set<string>) {
  if (!navKey || typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem("quiz-flags");
    const parsed: FlagStore = raw ? (JSON.parse(raw) as FlagStore) : {};
    parsed[navKey] = Array.from(flagged);
    sessionStorage.setItem("quiz-flags", JSON.stringify(parsed));
  } catch {
    /* ignore quota / private mode */
  }
}

function buildSummary(
  questions: Question[],
  answers: Record<string, OptionKey>,
  lastId: string | undefined,
  lastPick: OptionKey | null,
): QuizFinishSummary {
  const resolved: Record<string, OptionKey> = { ...answers };
  if (lastId && lastPick && !(lastId in resolved)) {
    resolved[lastId] = lastPick;
  }
  let correct = 0;
  const wrongIndexes: number[] = [];
  const topicMap = new Map<string, { correct: number; total: number }>();
  questions.forEach((q, i) => {
    const a = resolved[q.id];
    const ok = a === q.correct;
    if (ok) correct += 1;
    else wrongIndexes.push(i);
    const bucket = topicMap.get(q.topic) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (ok) bucket.correct += 1;
    topicMap.set(q.topic, bucket);
  });
  const byTopic = [...topicMap.entries()]
    .map(([topic, stats]) => ({ topic, ...stats }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.correct / Math.max(a.total, 1) - b.correct / Math.max(b.total, 1) ||
        a.topic.localeCompare(b.topic, "zh"),
    );
  const total = questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const answered = Object.keys(resolved).length;
  return { correct, total, percent, answered, wrongIndexes, byTopic };
}

export function QuizRun({
  questions,
  mode,
  onFinished,
  navKey,
  finishLabel = "继续",
  timeLimitSec,
}: QuizRunProps) {
  const recordAnswer = useTrainerStore((s) => s.recordAnswer);
  const reviewMistakeAnswer = useTrainerStore((s) => s.reviewMistakeAnswer);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [recorded, setRecorded] = useState<Set<string>>(() => new Set());
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set());
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [flagsReady, setFlagsReady] = useState(false);
  const [scorecard, setScorecard] = useState<QuizFinishSummary | null>(null);
  const timed = typeof timeLimitSec === "number" && timeLimitSec > 0;
  const [remain, setRemain] = useState(() => (timed ? timeLimitSec! : 0));
  const question = questions[index];
  const total = questions.length;
  const showNav = total >= NAV_THRESHOLD;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    setFlagged(loadFlags(navKey));
    setFlagsReady(true);
  }, [navKey]);

  useEffect(() => {
    if (!flagsReady) return;
    saveFlags(navKey, flagged);
  }, [flagged, navKey, flagsReady]);

  const forceFinish = useCallback(
    (fromTimeout: boolean) => {
      const summary = buildSummary(questions, answers, undefined, null);
      setScorecard({ ...summary, timedOut: fromTimeout });
    },
    [questions, answers],
  );

  useEffect(() => {
    if (!timed || scorecard) return;
    const id = window.setInterval(() => {
      setRemain((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timed, scorecard]);

  useEffect(() => {
    if (!timed || scorecard || remain > 0) return;
    forceFinish(true);
  }, [timed, scorecard, remain, forceFinish]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= total) return;
      const q = questions[next];
      const prior = q ? answers[q.id] : undefined;
      setIndex(next);
      setPicked(prior ?? null);
      setSubmitted(Boolean(prior));
    },
    [answers, questions, total],
  );

  const toggleFlag = useCallback(() => {
    if (!question) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  }, [question]);

  const submit = useCallback(() => {
    if (!picked || !question || submitted) return;
    const today = currentToday();
    const already = recorded.has(question.id);
    if (!already) {
      if (mode === "review") {
        reviewMistakeAnswer(question, picked, today);
      } else {
        recordAnswer(question, picked, today);
      }
      setRecorded((prev) => new Set(prev).add(question.id));
    }
    setAnswers((prev) => ({ ...prev, [question.id]: picked }));
    setSubmitted(true);
  }, [
    picked,
    question,
    submitted,
    recorded,
    mode,
    recordAnswer,
    reviewMistakeAnswer,
  ]);

  const finishedNext = useCallback(() => {
    if (!question || !submitted) return;
    if (index + 1 >= total) {
      setScorecard(buildSummary(questions, answers, question.id, picked));
      return;
    }
    goTo(index + 1);
  }, [question, submitted, index, total, questions, answers, picked, goTo]);

  const result = useMemo(() => {
    if (!submitted || !picked || !question) return null;
    return picked === question.correct;
  }, [submitted, picked, question]);

  // Hotkeys while answering (not on scorecard); ignore when typing in inputs.
  useEffect(() => {
    if (scorecard || !question) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key = event.key;
      const upper = key.toUpperCase();

      if (!submitted) {
        const fromDigit = /^[1-4]$/.test(key) ? Number(key) - 1 : -1;
        const fromLetter = OPTION_KEYS.indexOf(upper as OptionKey);
        const optIndex = fromDigit >= 0 ? fromDigit : fromLetter;
        if (optIndex >= 0 && optIndex < question!.options.length) {
          event.preventDefault();
          setPicked(OPTION_KEYS[optIndex]);
          return;
        }
        if (key === " " || key === "Enter") {
          if (!picked) return;
          event.preventDefault();
          submit();
          return;
        }
        return;
      }

      if (key === " " || key === "Enter") {
        event.preventDefault();
        finishedNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scorecard, question, submitted, picked, submit, finishedNext]);

  if (!question) {
    return (
      <Surface className="p-6 text-sm text-muted-foreground">本题库为空。</Surface>
    );
  }

  if (scorecard) {
    return (
      <QuizScorecard
        summary={scorecard}
        questions={questions}
        compact={total < NAV_THRESHOLD}
        finishLabel={finishLabel}
        onJump={(i) => {
          setScorecard(null);
          goTo(i);
        }}
        onContinue={() => onFinished(scorecard)}
      />
    );
  }

  const isFlagged = flagged.has(question.id);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="label-caps">
          Question {pad2(index + 1)} / {pad2(total)}
          {showNav || timed ? (
            <span className="ml-2 text-muted-foreground">
              · 已答 {pad2(answeredCount)}
              {flagged.size > 0 ? ` · 标记 ${pad2(flagged.size)}` : ""}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {timed ? (
            <span
              className={cn(
                "inline-flex h-7 items-center rounded-sm border px-2 font-mono text-[12px] tracking-wider",
                remain <= 60
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-border text-foreground",
              )}
              aria-live="polite"
              aria-label={`剩余时间 ${formatRemain(remain)}`}
            >
              {formatRemain(remain)}
            </span>
          ) : null}
          <FocusModeToggle />
          {showNav ? (
            <button
              type="button"
              onClick={toggleFlag}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-sm border px-2 font-mono text-[11px]",
                isFlagged
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={isFlagged}
              title="标记稍后复查"
            >
              <Flag className="size-3" />
              {isFlagged ? "已标" : "标记"}
            </button>
          ) : null}
          <KindPill>{question.topic}</KindPill>
        </div>
      </div>

      {showNav ? (
        <div className="mt-3 rounded-md border border-border bg-card/40 p-2">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-sm bg-brand" /> 当前
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-sm bg-emerald-500/70" /> 已答
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-sm bg-amber-500/70" /> 标记
            </span>
          </div>
          <div className="grid max-h-28 grid-cols-10 gap-1 overflow-y-auto sm:grid-cols-[repeat(15,minmax(0,1fr))]">
            {questions.map((q, i) => {
              const answered = Boolean(answers[q.id]);
              const flaggedHere = flagged.has(q.id);
              const current = i === index;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    "flex h-7 items-center justify-center rounded-sm border font-mono text-[10px] transition-colors",
                    current && "border-brand bg-brand/20 text-brand",
                    !current &&
                      answered &&
                      !flaggedHere &&
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                    !current &&
                      flaggedHere &&
                      "border-amber-500/40 bg-amber-500/10 text-amber-400",
                    !current &&
                      !answered &&
                      !flaggedHere &&
                      "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                  aria-label={`第 ${i + 1} 题${answered ? " 已答" : ""}${flaggedHere ? " 已标记" : ""}${current ? " 当前" : ""}`}
                  aria-current={current ? "true" : undefined}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : total >= 20 ? (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border" aria-hidden>
          <div
            className="h-full bg-brand transition-[width]"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      ) : null}

      <p className="mt-3 text-[15px] leading-7" id={`quiz-stem-${question.id}`}>
        {question.stem}
      </p>
      <div
        className="mt-4 space-y-2"
        role="radiogroup"
        aria-labelledby={`quiz-stem-${question.id}`}
        aria-disabled={submitted || undefined}
      >
        {question.options.map((option) => {
          const selected = picked === option.key;
          const showKey = submitted;
          const isCorrect = option.key === question.correct;
          const isWrongPick = showKey && selected && !isCorrect;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={submitted}
              onClick={() => setPicked(option.key)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                !submitted && selected && "border-brand bg-brand/10",
                !submitted && !selected && "border-border hover:bg-surface-hover",
                showKey && isCorrect && "border-emerald-500/40 bg-emerald-500/10",
                isWrongPick && "border-destructive/40 bg-destructive/10",
                submitted && !isCorrect && !selected && "border-border opacity-60",
              )}
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border border-border font-mono text-[11px]" aria-hidden>
                {option.key}
              </span>
              <span className="leading-6">{option.text}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 hidden font-mono text-[11px] text-muted-foreground md:block">
        1-4 选题 · Space 下一题
      </p>

      {!submitted ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={!picked} onClick={submit}>
            提交
          </Button>
          {showNav && index + 1 < total ? (
            <Button variant="outline" onClick={() => goTo(index + 1)}>
              跳过
            </Button>
          ) : null}
          {timed ? (
            <Button variant="outline" onClick={() => forceFinish(false)}>
              交卷
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <KindPill tone={result ? "ok" : "warn"}>
              {result ? "正确" : "错误"}
            </KindPill>
            {!result ? (
              <span className="text-sm text-muted-foreground">
                你的答案 {picked} · 正确答案 {question.correct}
              </span>
            ) : null}
          </div>
          <Surface className="p-3">
            <div className="label-caps">解释</div>
            <p className="mt-1 text-sm leading-6">{question.explanation}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              陷阱：{question.trap}
            </p>
            {!result && picked && question.whyWrong[picked] ? (
              <p className="mt-2 text-sm leading-6 text-destructive/90">
                错因：{question.whyWrong[picked]}
              </p>
            ) : null}
            <div className="mt-2 font-mono text-[11px] text-brand">
              {question.knowledgePath}
            </div>
          </Surface>
          <div className="flex flex-wrap gap-2">
            {showNav && index > 0 ? (
              <Button variant="outline" onClick={() => goTo(index - 1)}>
                上一题
              </Button>
            ) : null}
            <Button onClick={finishedNext}>
              {index + 1 >= total ? "完成本组" : "下一题"}
            </Button>
            {timed && index + 1 < total ? (
              <Button variant="outline" onClick={() => forceFinish(false)}>
                交卷
              </Button>
            ) : null}
            {showNav &&
            index + 1 >= total &&
            (answeredCount < total || flagged.size > 0) ? (
              <Button
                variant="outline"
                onClick={() => {
                  const firstFlag = questions.findIndex((q) => flagged.has(q.id));
                  const firstGap = questions.findIndex((q) => !answers[q.id]);
                  const target =
                    firstGap >= 0 ? firstGap : firstFlag >= 0 ? firstFlag : 0;
                  goTo(target);
                }}
              >
                复查未完成
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function QuizScorecard({
  summary,
  questions,
  compact,
  finishLabel,
  onJump,
  onContinue,
}: {
  summary: QuizFinishSummary;
  questions: Question[];
  compact: boolean;
  finishLabel: string;
  onJump: (index: number) => void;
  onContinue: () => void;
}) {
  const { correct, total, percent, answered, timedOut, wrongIndexes, byTopic } =
    summary;
  const topTopics = byTopic.slice(0, compact ? 3 : 6);
  const tone = percent >= 80 ? "ok" : percent >= 60 ? "brand" : "warn";

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="label-caps">{compact ? "QUIZ RESULT" : "MOCK DEBRIEF"}</div>
        <FocusModeToggle />
      </div>
      <h2 className="mt-2 text-xl font-medium">
        {timedOut ? "时间到 · 已交卷" : compact ? "本组结果" : "试卷复盘"}
      </h2>
      <Surface className="mt-4 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="label-caps">正确率</div>
            <div className="mt-1 font-mono text-3xl tracking-wide text-foreground">
              {percent}%
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {pad2(correct)} / {pad2(total)} 题正确
              {" · "}
              已答 {pad2(answered)} / {pad2(total)}
            </div>
          </div>
          <KindPill tone={tone}>
            {timedOut
              ? "限时结束"
              : percent >= 80
                ? "表现不错"
                : percent >= 60
                  ? "继续巩固"
                  : "建议复盘错题"}
          </KindPill>
        </div>
      </Surface>

      {topTopics.length > 0 ? (
        <Surface className="mt-3 p-4">
          <div className="label-caps">按主题</div>
          <ul className="mt-2 divide-y divide-border">
            {topTopics.map((row) => {
              const pct = row.total
                ? Math.round((row.correct / row.total) * 100)
                : 0;
              return (
                <li
                  key={row.topic}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate">{row.topic}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {row.correct}/{row.total} · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </Surface>
      ) : null}

      {wrongIndexes.length > 0 ? (
        <Surface className="mt-3 p-4">
          <div className="label-caps">
            错题 · {pad2(wrongIndexes.length)}
          </div>
          {compact ? (
            <p className="mt-2 text-sm text-muted-foreground">
              题号：{wrongIndexes.map((i) => i + 1).join("、")}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              点击题号可回到该题复查（仍在本场练习中）。
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {wrongIndexes.map((i) => (
              <button
                key={questions[i]?.id ?? i}
                type="button"
                onClick={() => onJump(i)}
                className="inline-flex h-7 min-w-7 items-center justify-center rounded-sm border border-destructive/30 bg-destructive/10 px-2 font-mono text-[11px] text-destructive hover:bg-destructive/20"
                title={questions[i]?.stem}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </Surface>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">全部正确，没有错题。</p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onContinue}>{finishLabel}</Button>
        {wrongIndexes.length > 0 ? (
          <Button variant="outline" onClick={() => onJump(wrongIndexes[0])}>
            复查第一道错题
          </Button>
        ) : null}
      </div>
    </div>
  );
}
