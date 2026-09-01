"use client";

import { useMemo, useState } from "react";
import { getQuestionById } from "@/data/questions";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  KindPill,
  PageFrame,
  PageHeader,
  Surface,
} from "@/components/ui-bits";
import { QuizRun } from "@/components/learn/quiz-run";
import { todayISO } from "@/lib/dates";
import { dueMistakes, mistakeBucket } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";
import type { Mistake, MistakeBucket, MistakeReason } from "@/lib/types";

const tabs: { id: MistakeBucket; label: string }[] = [
  { id: "needs-review", label: "待复习" },
  { id: "learning", label: "学习中" },
  { id: "mastered", label: "已掌握" },
];

const reasonLabel: Record<MistakeReason, string> = {
  unknown: "未标注",
  misunderstood: "概念不清",
  calculation: "计算失误",
  careless: "看错题",
};

export function MistakesView() {
  const hydrated = useTrainerStore((s) => s.hydrated);
  const mistakes = useTrainerStore((s) => s.mistakes);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const setMistakeReason = useTrainerStore((s) => s.setMistakeReason);
  const [tab, setTab] = useState<MistakeBucket>("needs-review");
  const [drilling, setDrilling] = useState(false);

  const today = hydrated ? todayISO(simulateDate) : todayISO();

  const grouped = useMemo(() => {
    const map: Record<MistakeBucket, Mistake[]> = {
      "needs-review": [],
      learning: [],
      mastered: [],
    };
    for (const item of mistakes) {
      map[mistakeBucket(item, today)].push(item);
    }
    return map;
  }, [mistakes, today]);

  const list = grouped[tab];
  const due = dueMistakes(mistakes, today);
  const dueQuestions = due
    .map((item) => getQuestionById(item.questionId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (drilling && dueQuestions.length > 0) {
    return (
      <PageFrame>
        <button
          type="button"
          onClick={() => setDrilling(false)}
          className="label-caps hover:text-foreground"
        >
          ← 返回错题本
        </button>
        <h1 className="mt-2 text-xl font-medium">复习到期错题</h1>
        <div className="mt-6">
          <QuizRun
            questions={dueQuestions}
            mode="review"
            onFinished={() => setDrilling(false)}
          />
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <PageHeader
        kicker="MISTAKE BOOK"
        title="错题本"
        description="首次错 → 明天；第 2 次 → 3 天；第 3 次 → 7 天。复习做对进入 14 天；连续做对标记已掌握。"
        action={
          dueQuestions.length > 0 ? (
            <Button onClick={() => setDrilling(true)}>复习 {dueQuestions.length} 题</Button>
          ) : null
        }
      />
      <div className="mb-4 flex gap-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`h-8 rounded-sm px-3 font-mono text-[11px] ${
              tab === item.id
                ? "bg-surface-hover text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
            <span className="ml-1.5 text-muted-foreground">{grouped[item.id].length}</span>
          </button>
        ))}
      </div>
      <Surface>
        {list.length === 0 ? (
          <EmptyState
            title={tab === "needs-review" ? "没有到期错题" : "这里是空的"}
            description={
              tab === "needs-review"
                ? "做题出错后会自动进来。今日复习步也可以直接跳过。"
                : "换一个分组看看。"
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((item) => {
              const question = getQuestionById(item.questionId);
              return (
                <li key={item.questionId} className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <KindPill>{item.topic}</KindPill>
                    <KindPill>错 {item.wrongCount} 次</KindPill>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      下次 {item.nextReviewAt}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6">
                    {question?.stem ?? item.questionId}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    你的答案 {item.selectedAnswer} · 正确答案 {item.correctAnswer}
                    {question ? ` · ${question.knowledgePath}` : ""}
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
      </Surface>
    </PageFrame>
  );
}
