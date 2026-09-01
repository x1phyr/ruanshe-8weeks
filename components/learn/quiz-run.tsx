"use client";

import { useMemo, useState } from "react";
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
}

export function QuizRun({ questions, mode, onFinished }: QuizRunProps) {
  const recordAnswer = useTrainerStore((s) => s.recordAnswer);
  const reviewMistakeAnswer = useTrainerStore((s) => s.reviewMistakeAnswer);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[index];
  const total = questions.length;

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
    const ok =
      mode === "review"
        ? reviewMistakeAnswer(question, picked, today)
        : recordAnswer(question, picked, today);
    if (ok) setCorrectCount((n) => n + 1);
    setSubmitted(true);
  }

  const finishedNext = () => {
    const finalCorrect = correctCount;
    if (index + 1 >= total) {
      onFinished({ correct: finalCorrect, total });
      return;
    }
    setIndex((n) => n + 1);
    setPicked(null);
    setSubmitted(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="label-caps">
          Question {pad2(index + 1)} / {pad2(total)}
        </div>
        <KindPill>{question.topic}</KindPill>
      </div>
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
        <Button className="mt-4" disabled={!picked} onClick={submit}>
          提交
        </Button>
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
          <Button onClick={finishedNext}>
            {index + 1 >= total ? "完成本组" : "下一题"}
          </Button>
        </div>
      )}
    </div>
  );
}
