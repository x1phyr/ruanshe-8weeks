"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KindPill, Surface } from "@/components/ui-bits";
import { pad2 } from "@/lib/dates";
import { currentToday, useTrainerStore } from "@/lib/store";
import type { OptionKey, Question } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuizRunProps {
  questions: Question[];
  mode: "daily" | "practice" | "review";
  onFinished: (summary: { correct: number; total: number }) => void;
  /** Persist flagged ids in sessionStorage when set (e.g. dayId or module name). */
  navKey?: string;
}

const NAV_THRESHOLD = 12;

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

export function QuizRun({ questions, mode, onFinished, navKey }: QuizRunProps) {
  const recordAnswer = useTrainerStore((s) => s.recordAnswer);
  const reviewMistakeAnswer = useTrainerStore((s) => s.reviewMistakeAnswer);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [recorded, setRecorded] = useState<Set<string>>(() => new Set());
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set());
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [flagsReady, setFlagsReady] = useState(false);

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

  const result = useMemo(() => {
    if (!submitted || !picked || !question) return null;
    return picked === question.correct;
  }, [submitted, picked, question]);

  if (!question) {
    return (
      <Surface className="p-6 text-sm text-muted-foreground">本题库为空。</Surface>
    );
  }

  function submit() {
    if (!picked || !question) return;
    const today = currentToday();
    const already = recorded.has(question.id);
    if (!already) {
      const ok =
        mode === "review"
          ? reviewMistakeAnswer(question, picked, today)
          : recordAnswer(question, picked, today);
      void ok;
      setRecorded((prev) => new Set(prev).add(question.id));
    }
    setAnswers((prev) => ({ ...prev, [question.id]: picked }));
    setSubmitted(true);
  }

  function finishedNext() {
    if (index + 1 >= total) {
      const correct = questions.reduce((n, q) => {
        const a = answers[q.id] ?? (q.id === question.id ? picked : null);
        return a === q.correct ? n + 1 : n;
      }, 0);
      onFinished({ correct, total });
      return;
    }
    goTo(index + 1);
  }

  const isFlagged = flagged.has(question.id);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="label-caps">
          Question {pad2(index + 1)} / {pad2(total)}
          {showNav ? (
            <span className="ml-2 text-muted-foreground">
              · 已答 {pad2(answeredCount)}
              {flagged.size > 0 ? ` · 标记 ${pad2(flagged.size)}` : ""}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
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

      <p className="mt-3 text-[15px] leading-7">{question.stem}</p>
      <div className="mt-4 space-y-2">
        {question.options.map((option) => {
          const selected = picked === option.key;
          const showKey = submitted;
          const isCorrect = option.key === question.correct;
          const isWrongPick = showKey && selected && !isCorrect;
          return (
            <button
              key={option.key}
              type="button"
              disabled={submitted}
              onClick={() => setPicked(option.key)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                !submitted && selected && "border-brand bg-brand/10",
                !submitted && !selected && "border-border hover:bg-surface-hover",
                showKey && isCorrect && "border-emerald-500/40 bg-emerald-500/10",
                isWrongPick && "border-destructive/40 bg-destructive/10",
                submitted && !isCorrect && !selected && "border-border opacity-60",
              )}
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border border-border font-mono text-[11px]">
                {option.key}
              </span>
              <span className="leading-6">{option.text}</span>
            </button>
          );
        })}
      </div>

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
