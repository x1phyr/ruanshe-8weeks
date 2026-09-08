"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { questions, questionsForDay, sampleQuestions, unlockedQuestions } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KindPill, PageFrame, PageHeader, Surface, EmptyState } from "@/components/ui-bits";
import { QuizRun } from "@/components/learn/quiz-run";
import { dayHref, getDayById, scheduleDays } from "@/lib/calendar";
import { isUnlocked } from "@/lib/progress";
import {
  MODULE_STATS_MIN_ATTEMPTS,
  topWeakModules,
} from "@/lib/module-stats";
import { questionsForModule } from "@/lib/practice";
import { useTrainerStore } from "@/lib/store";
import type { AnswerRecord, Question } from "@/lib/types";

const SEARCH_DRILL_CAP = 50;

type ActiveRun =
  | { kind: "day"; dayId: string }
  | { kind: "module"; module: string }
  | { kind: "search"; query: string }
  | { kind: "random"; questions: Question[]; timed?: boolean };

function matchesQuery(q: Question, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  const hay = `${q.stem}\n${q.topic}\n${q.knowledgePath ?? ""}`.toLowerCase();
  return hay.includes(needle);
}

export function PracticeView() {
  const progress = useTrainerStore((s) => s.progress);
  const startDate = useTrainerStore((s) => s.startDate);
  const unlockAll = useTrainerStore((s) => s.unlockAll);
  const answers = useTrainerStore((s) => s.answers);
  const studyDays = scheduleDays(startDate);
  const [module, setModule] = useState<string>("全部");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<ActiveRun | null>(null);
  const modules = useMemo(
    () => Array.from(new Set(studyDays.map((day) => day.module))),
    [studyDays],
  );

  const days = useMemo(() => {
    return studyDays.filter((day) => module === "全部" || day.module === module);
  }, [module, studyDays]);

  const unlockedInModule = useMemo(() => {
    if (module === "全部") return [];
    return days.filter((day) => isUnlocked(progress, day.id, unlockAll));
  }, [days, module, progress, unlockAll]);

  const moduleBank = useMemo(() => {
    if (module === "全部") return [];
    return questionsForModule(module, studyDays, progress, unlockAll);
  }, [module, studyDays, progress, unlockAll]);

  const searchMatches = useMemo(() => {
    const q = search.trim();
    if (!q) return [] as Question[];
    return questions.filter(
      (item) =>
        matchesQuery(item, q) && isUnlocked(progress, item.dayId, unlockAll),
    );
  }, [search, progress, unlockAll]);

  const searchDrillPool = useMemo(
    () => searchMatches.slice(0, SEARCH_DRILL_CAP),
    [searchMatches],
  );

  const unlockedPool = useMemo(
    () =>
      unlockedQuestions((dayId) => isUnlocked(progress, dayId, unlockAll)),
    [progress, unlockAll],
  );

  const activeQuestions = useMemo(() => {
    if (!active) return [];
    if (active.kind === "day") return questionsForDay(active.dayId);
    if (active.kind === "module") {
      return questionsForModule(active.module, studyDays, progress, unlockAll);
    }
    if (active.kind === "random") return active.questions;
    return questions
      .filter(
        (item) =>
          matchesQuery(item, active.query) &&
          isUnlocked(progress, item.dayId, unlockAll),
      )
      .slice(0, SEARCH_DRILL_CAP);
  }, [active, studyDays, progress, unlockAll]);

  const activeDay =
    active?.kind === "day"
      ? studyDays.find((day) => day.id === active.dayId)
      : undefined;
  const activeTitle =
    active?.kind === "module"
      ? `模块 · ${active.module}`
      : active?.kind === "search"
        ? `搜索 · ${active.query}`
        : active?.kind === "random"
          ? active.timed
            ? `限时随机 ${active.questions.length} 题`
            : `随机 ${active.questions.length} 题`
          : activeDay?.topic ?? "";

  if (active && activeQuestions.length > 0) {
    return (
      <PageFrame>
        <button
          type="button"
          onClick={() => setActive(null)}
          className="label-caps hover:text-foreground"
        >
          ← 返回题库
        </button>
        <h1 className="mt-2 text-xl font-medium">{activeTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {active.kind === "module"
            ? `本模块已解锁共 ${activeQuestions.length} 题。对错会计入正确率；错题写入错题本。`
            : active.kind === "search"
              ? `筛选结果最多刷 ${SEARCH_DRILL_CAP} 题（本次 ${activeQuestions.length}）。对错会计入正确率；错题写入错题本。`
              : active.kind === "random"
                ? active.timed
                  ? `限时 20 分钟 · 从已解锁题库随机抽取 ${activeQuestions.length} 题（池 ${unlockedPool.length}）。到时自动交卷，未答不计分（按错计）。可提前交卷。`
                  : `从已解锁题库随机抽取 ${activeQuestions.length} 题（池 ${unlockedPool.length}）。对错会计入正确率；错题写入错题本。`
                : "来自同一题库。对错会计入正确率；错题写入错题本。此页不自动完成本日。"}
        </p>
        <div className="mt-6">
          <QuizRun
            questions={activeQuestions}
            mode="practice"
            navKey={
              active.kind === "day"
                ? `day:${active.dayId}`
                : active.kind === "module"
                  ? `module:${active.module}`
                  : active.kind === "random"
                    ? `random:${active.timed ? "timed:" : ""}${active.questions.length}`
                    : `search:${active.query}`
            }
            timeLimitSec={
              active.kind === "random" && active.timed ? 20 * 60 : undefined
            }
            finishLabel="返回题库"
            onFinished={() => setActive(null)}
          />
        </div>
      </PageFrame>
    );
  }

  const showSearch = search.trim().length > 0;

  return (
    <PageFrame>
      <PageHeader
        kicker="DRILL"
        title="按模块练习"
        description="按日历模块筛选专题，或一键刷本模块已解锁题。未解锁日只显示路线，不跳关。可用关键词搜题干 / 专题 / 知识路径；也可随机抽 20 题，或开限时 20 分钟模考手感。"
      />
      <ModuleAccuracyBlock answers={answers} />
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2">
        <div className="min-w-0 flex-1 font-mono text-[11px] text-muted-foreground">
          已解锁题池 {unlockedPool.length}
          {!unlockAll ? " · 仅已解锁日" : " · 全解锁"}
          {unlockedPool.length > 0 && unlockedPool.length < 20
            ? " · 不足 20，将全抽"
            : ""}
        </div>
        <Button
          size="sm"
          disabled={unlockedPool.length === 0}
          onClick={() => {
            const picked = sampleQuestions(unlockedPool, 20);
            if (picked.length === 0) return;
            setActive({ kind: "random", questions: picked });
          }}
        >
          随机 {Math.min(20, unlockedPool.length) || 20} 题
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={unlockedPool.length === 0}
          onClick={() => {
            const picked = sampleQuestions(unlockedPool, 20);
            if (picked.length === 0) return;
            setActive({ kind: "random", questions: picked, timed: true });
          }}
        >
          限时 20 分钟
        </Button>
      </div>
      <div className="mb-3">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索题干、专题、知识路径…"
          className="max-w-xl"
          aria-label="搜索题目"
        />
      </div>

      {showSearch ? (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2">
            <div className="min-w-0 flex-1 font-mono text-[11px] text-muted-foreground">
              匹配 {searchMatches.length} 题
              {searchMatches.length > SEARCH_DRILL_CAP
                ? ` · 刷题上限 ${SEARCH_DRILL_CAP}`
                : ""}
              {!unlockAll ? " · 仅已解锁日" : ""}
            </div>
            <Button
              size="sm"
              disabled={searchDrillPool.length === 0}
              onClick={() =>
                setActive({ kind: "search", query: search.trim() })
              }
            >
              刷这些题
              {searchDrillPool.length > 0 ? ` ${searchDrillPool.length}` : ""}
            </Button>
          </div>
          <Surface>
            {searchMatches.length === 0 ? (
              <EmptyState
                title="没有匹配题目"
                description={
                  unlockAll
                    ? "换个关键词试试。"
                    : "未解锁日的题不会出现；可在调试设置打开全解锁。"
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {searchMatches.slice(0, 80).map((q) => {
                  const day = getDayById(q.dayId, startDate);
                  return (
                    <li
                      key={q.id}
                      className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <KindPill>{q.topic}</KindPill>
                          {day ? <KindPill>{day.module}</KindPill> : null}
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {q.dayId}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-6">{q.stem}</p>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {q.knowledgePath}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {day ? (
                          <Link
                            href={dayHref(day)}
                            className="inline-flex h-7 items-center rounded-md border border-border px-2.5 text-[0.8rem] hover:bg-muted"
                          >
                            进入日训
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Surface>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {["全部", ...modules].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setModule(name)}
                className={`h-7 rounded-sm border px-2 font-mono text-[11px] ${
                  module === name
                    ? "border-brand/50 bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {module !== "全部" ? (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2">
              <div className="min-w-0 flex-1 font-mono text-[11px] text-muted-foreground">
                {module} · 已解锁 {unlockedInModule.length}/{days.length} 日 · 可刷{" "}
                {moduleBank.length} 题
              </div>
              <Button
                size="sm"
                disabled={moduleBank.length === 0}
                onClick={() => setActive({ kind: "module", module })}
              >
                开始刷本模块题
              </Button>
            </div>
          ) : null}

          <Surface>
            {days.length === 0 ? (
              <EmptyState title="没有专题" description="换一个模块看看。" />
            ) : (
              <ul className="divide-y divide-border">
                {days.map((day) => {
                  const bank = questions.filter((q) => q.dayId === day.id);
                  const unlocked = isUnlocked(progress, day.id, unlockAll);
                  return (
                    <li
                      key={day.id}
                      className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm">{day.topic}</span>
                          <KindPill>{day.module}</KindPill>
                          <KindPill>
                            {bank.length > 0 ? `${bank.length} 题` : "即将上线"}
                          </KindPill>
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {day.date} · WEEK {day.week}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {unlocked ? (
                          <Link
                            href={dayHref(day)}
                            className="inline-flex h-7 items-center rounded-md border border-border px-2.5 text-[0.8rem] hover:bg-muted"
                          >
                            进入日训
                          </Link>
                        ) : (
                          <KindPill>未解锁</KindPill>
                        )}
                        {unlocked && bank.length > 0 ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              setActive({ kind: "day", dayId: day.id })
                            }
                          >
                            开始练习
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Surface>
        </>
      )}
    </PageFrame>
  );
}

function ModuleAccuracyBlock({ answers }: { answers: AnswerRecord[] }) {
  const weak = useMemo(
    () => topWeakModules(answers, { minAttempts: MODULE_STATS_MIN_ATTEMPTS, limit: 5 }),
    [answers],
  );

  return (
    <Surface className="mb-4 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="label-caps">MODULE ACCURACY</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            按日历模块统计作答正确率 · 至少 {MODULE_STATS_MIN_ATTEMPTS} 次才计入弱项
          </p>
        </div>
        {answers.length > 0 ? (
          <span className="font-mono text-[11px] text-muted-foreground">
            共 {answers.length} 次作答
          </span>
        ) : null}
      </div>
      {answers.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          暂无作答记录 · 练几题后再看弱项模块
        </p>
      ) : weak.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          各模块作答次数不足 {MODULE_STATS_MIN_ATTEMPTS}，再刷几题即可看到弱项排序
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border border-t border-border">
          {weak.map((item) => (
            <li
              key={item.module}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">{item.module}</span>
              <span className="mono-num shrink-0 text-muted-foreground">
                {item.accuracy}% · {item.correct}/{item.attempts}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Surface>
  );
}
