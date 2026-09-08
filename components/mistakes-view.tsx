"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getQuestionById, sampleQuestions } from "@/data/questions";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  KindPill,
  PageFrame,
  PageHeader,
  Surface,
} from "@/components/ui-bits";
import { QuizRun } from "@/components/learn/quiz-run";
import { exportProgressBackup } from "@/lib/backup";
import { todayISO } from "@/lib/dates";
import { resolveMistakeModule } from "@/lib/module-stats";
import { mistakesModuleHref, readModuleFromUrl } from "@/lib/practice";
import { dueMistakes, mistakeBucket } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";
import type { Mistake, MistakeBucket, MistakeReason, Question } from "@/lib/types";

const ALL_MODULES = "全部";
const FILTERED_RETRY_CAP = 30;

function resolveWrongOnlyQuestions(mistakes: Mistake[], today: string) {
  const due = dueMistakes(mistakes, today);
  const pool = due.length > 0 ? due : mistakes.filter((item) => !item.mastered);
  return pool
    .map((item) => getQuestionById(item.questionId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

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

function exportDateStamp(iso: string) {
  return iso.slice(0, 10);
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number | boolean) {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function mistakesToRows(mistakes: Mistake[]) {
  return mistakes.map((m) => ({
    questionId: m.questionId,
    topic: m.topic,
    module: resolveMistakeModule(m),
    wrongCount: m.wrongCount,
    reason: m.reason,
    mastered: m.mastered,
    nextReviewAt: m.nextReviewAt,
    lastWrongAt: m.lastWrongAt,
    selectedAnswer: m.selectedAnswer,
    correctAnswer: m.correctAnswer,
  }));
}

function exportMistakesJson(mistakes: Mistake[], stamp: string) {
  const rows = mistakesToRows(mistakes);
  downloadBlob(
    `ruanshe-mistakes-${stamp}.json`,
    JSON.stringify(rows, null, 2),
    "application/json;charset=utf-8",
  );
}

function exportMistakesCsv(mistakes: Mistake[], stamp: string) {
  const rows = mistakesToRows(mistakes);
  const headers = [
    "questionId",
    "topic",
    "module",
    "wrongCount",
    "reason",
    "mastered",
    "nextReviewAt",
    "lastWrongAt",
    "selectedAnswer",
    "correctAnswer",
  ] as const;
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];
  downloadBlob(
    `ruanshe-mistakes-${stamp}.csv`,
    lines.join("\n"),
    "text/csv;charset=utf-8",
  );
}

export function MistakesView() {
  const mistakes = useTrainerStore((s) => s.mistakes);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const setMistakeReason = useTrainerStore((s) => s.setMistakeReason);
  const clearMasteredMistakes = useTrainerStore((s) => s.clearMasteredMistakes);
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<MistakeBucket>("needs-review");
  const [moduleFilter, setModuleFilter] = useState<string>(ALL_MODULES);
  const [drillMode, setDrillMode] = useState<
    "due" | "wrong-only" | "filtered" | null
  >(null);
  const [filteredSession, setFilteredSession] = useState<Question[] | null>(
    null,
  );

  const today = todayISO(simulateDate);
  const stamp = exportDateStamp(today);

  const moduleOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of mistakes) {
      set.add(resolveMistakeModule(item));
    }
    if (moduleFilter !== ALL_MODULES) set.add(moduleFilter);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh"));
  }, [mistakes, moduleFilter]);

  useEffect(() => {
    const fromUrl = readModuleFromUrl();
    if (fromUrl) setModuleFilter(fromUrl);
  }, []);

  const selectModuleFilter = (name: string) => {
    setModuleFilter(name);
    const qs =
      name === ALL_MODULES
        ? ""
        : mistakesModuleHref(name).slice("/mistakes".length);
    router.replace(`${pathname}${qs}`, { scroll: false });
  };

  const filteredMistakes = useMemo(() => {
    if (moduleFilter === ALL_MODULES) return mistakes;
    return mistakes.filter(
      (item) => resolveMistakeModule(item) === moduleFilter,
    );
  }, [mistakes, moduleFilter]);

  const grouped = useMemo(() => {
    const map: Record<MistakeBucket, Mistake[]> = {
      "needs-review": [],
      learning: [],
      mastered: [],
    };
    for (const item of filteredMistakes) {
      map[mistakeBucket(item, today)].push(item);
    }
    return map;
  }, [filteredMistakes, today]);

  const list = grouped[tab];
  const due = dueMistakes(filteredMistakes, today);
  const dueQuestions = due
    .map((item) => getQuestionById(item.questionId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const wrongOnlyQuestions = useMemo(
    () => resolveWrongOnlyQuestions(filteredMistakes, today),
    [filteredMistakes, today],
  );

  const filterActive = moduleFilter !== ALL_MODULES;
  const exportPool = filteredMistakes;

  if (drillMode === "due" && dueQuestions.length > 0) {
    return (
      <PageFrame>
        <button
          type="button"
          onClick={() => setDrillMode(null)}
          className="label-caps hover:text-foreground"
        >
          ← 返回错题本
        </button>
        <h1 className="mt-2 text-xl font-medium">复习到期错题</h1>
        {filterActive ? (
          <p className="mt-1 text-sm text-muted-foreground">
            模块筛选：{moduleFilter}
          </p>
        ) : null}
        <div className="mt-6">
          <QuizRun
            questions={dueQuestions}
            mode="review"
            navKey="mistakes:due"
            finishLabel="返回错题本"
            onFinished={() => setDrillMode(null)}
          />
        </div>
      </PageFrame>
    );
  }

  if (drillMode === "wrong-only" && wrongOnlyQuestions.length > 0) {
    return (
      <PageFrame>
        <button
          type="button"
          onClick={() => setDrillMode(null)}
          className="label-caps hover:text-foreground"
        >
          ← 返回错题本
        </button>
        <h1 className="mt-2 text-xl font-medium">只练错题</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filterActive ? `${moduleFilter} · ` : ""}
          {dueQuestions.length > 0
            ? `到期 ${dueQuestions.length} 题`
            : `未掌握 ${wrongOnlyQuestions.length} 题`}
        </p>
        <div className="mt-6">
          <QuizRun
            questions={wrongOnlyQuestions}
            mode="review"
            navKey="mistakes:wrong-only"
            finishLabel="返回错题本"
            onFinished={() => setDrillMode(null)}
          />
        </div>
      </PageFrame>
    );
  }

  if (drillMode === "filtered" && filteredSession && filteredSession.length > 0) {
    const tabLabel =
      tabs.find((item) => item.id === tab)?.label ?? tab;
    return (
      <PageFrame>
        <button
          type="button"
          onClick={() => {
            setDrillMode(null);
            setFilteredSession(null);
          }}
          className="label-caps hover:text-foreground"
        >
          ← 返回错题本
        </button>
        <h1 className="mt-2 text-xl font-medium">重练当前筛选</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filterActive ? `${moduleFilter} · ` : ""}
          {tabLabel} · 本次 {filteredSession.length} 题
          {list.length > FILTERED_RETRY_CAP
            ? `（从 ${list.length} 题中随机抽取）`
            : ""}
        </p>
        <div className="mt-6">
          <QuizRun
            questions={filteredSession}
            mode="review"
            navKey={`mistakes:filtered:${tab}:${moduleFilter}`}
            finishLabel="返回错题本"
            onFinished={() => {
              setDrillMode(null);
              setFilteredSession(null);
            }}
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
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportProgressBackup(stamp)}
              title="导出完整本地进度备份"
            >
              备份进度
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportPool.length === 0}
              onClick={() => exportMistakesJson(exportPool, stamp)}
              title={
                filterActive
                  ? `导出当前筛选（${moduleFilter}）共 ${exportPool.length} 题`
                  : "导出全部错题 JSON"
              }
            >
              导出 JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportPool.length === 0}
              onClick={() => exportMistakesCsv(exportPool, stamp)}
              title={
                filterActive
                  ? `导出当前筛选（${moduleFilter}）共 ${exportPool.length} 题`
                  : "导出全部错题 CSV"
              }
            >
              导出 CSV
            </Button>
            <Button
              size="sm"
              disabled={list.length === 0}
              onClick={() => {
                const pool = list
                  .map((item) => getQuestionById(item.questionId))
                  .filter(
                    (item): item is NonNullable<typeof item> => Boolean(item),
                  );
                if (pool.length === 0) return;
                const picked = sampleQuestions(pool, FILTERED_RETRY_CAP);
                if (picked.length === 0) return;
                setFilteredSession(picked);
                setDrillMode("filtered");
              }}
              title={
                list.length === 0
                  ? "当前筛选下没有可练题目"
                  : list.length > FILTERED_RETRY_CAP
                    ? `从当前筛选 ${list.length} 题中随机抽取 ${FILTERED_RETRY_CAP} 题重练`
                    : `重练当前筛选共 ${list.length} 题`
              }
            >
              重练当前筛选
              {list.length > 0
                ? ` ${Math.min(list.length, FILTERED_RETRY_CAP)}`
                : ""}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={wrongOnlyQuestions.length === 0}
              onClick={() => {
                if (wrongOnlyQuestions.length === 0) return;
                setDrillMode("wrong-only");
              }}
              title={
                wrongOnlyQuestions.length === 0
                  ? "暂无可练错题"
                  : filterActive
                    ? `${moduleFilter} · ${
                        dueQuestions.length > 0
                          ? `到期 ${dueQuestions.length} 题`
                          : `未掌握 ${wrongOnlyQuestions.length} 题`
                      }`
                    : dueQuestions.length > 0
                      ? `到期 ${dueQuestions.length} 题`
                      : `未掌握 ${wrongOnlyQuestions.length} 题`
              }
            >
              只练错题
              {wrongOnlyQuestions.length > 0
                ? ` ${wrongOnlyQuestions.length}`
                : ""}
            </Button>
            {dueQuestions.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDrillMode("due")}
              >
                复习 {dueQuestions.length} 题
              </Button>
            ) : null}
          </div>
        }
      />
      {moduleOptions.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {[ALL_MODULES, ...moduleOptions].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => selectModuleFilter(name)}
              className={`h-7 rounded-sm border px-2 font-mono text-[11px] ${
                moduleFilter === name
                  ? "border-brand/50 bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}
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
      {tab === "mastered" && grouped.mastered.length > 0 ? (
        <div className="mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const count = grouped.mastered.length;
              const msg = filterActive
                ? `确定清空「${moduleFilter}」下已掌握的 ${count} 题？此操作不可撤销。`
                : `确定清空全部已掌握错题（共 ${count} 题）？此操作不可撤销。`;
              if (!confirm(msg)) return;
              clearMasteredMistakes(
                filterActive
                  ? grouped.mastered.map((m) => m.questionId)
                  : undefined,
              );
            }}
          >
            清空已掌握
          </Button>
        </div>
      ) : null}
      <Surface>
        {list.length === 0 ? (
          <EmptyState
            title={
              filterActive
                ? "当前模块下没有错题"
                : tab === "needs-review"
                  ? "没有到期错题"
                  : "这里是空的"
            }
            description={
              filterActive
                ? "换一个模块筛选，或清除筛选查看全部。"
                : tab === "needs-review"
                  ? "做题出错后会自动进来。今日复习步也可以直接跳过。"
                  : "换一个分组看看。"
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((item) => {
              const question = getQuestionById(item.questionId);
              const moduleLabel = resolveMistakeModule(item);
              return (
                <li key={item.questionId} className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <KindPill>{moduleLabel}</KindPill>
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
