"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  PlayCircle,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  Sparkles,
  Zap,
  ArrowRight,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { QuizzerView, QuestionData } from "./quizzer-view";
import { useTrainerStore } from "@/lib/store";
import questionsData from "@/src/data/questions.json";

export function MistakeView() {
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrillMode, setIsDrillMode] = useState(false);

  const mistakeQuestionIds = useTrainerStore((s) => s.mistakeQuestionIds);
  const removeMistakeQuestion = useTrainerStore((s) => s.removeMistakeQuestion);
  const clearAllMistakes = useTrainerStore((s) => s.clearAllMistakes);

  const allQuestions = questionsData as QuestionData[];

  // Questions matching mistake IDs
  const mistakeQuestions = useMemo(() => {
    const idSet = new Set(mistakeQuestionIds);
    return allQuestions.filter((q) => idSet.has(q.id));
  }, [allQuestions, mistakeQuestionIds]);

  const domains = useMemo(() => {
    return ["ALL", ...Array.from(new Set(mistakeQuestions.map((q) => q.domain)))];
  }, [mistakeQuestions]);

  const filteredMistakes = useMemo(() => {
    let list = mistakeQuestions;

    if (selectedDomain !== "ALL") {
      list = list.filter((q) => q.domain === selectedDomain);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        return (
          item.stem.toLowerCase().includes(q) ||
          item.domain.toLowerCase().includes(q) ||
          (item.explanation && item.explanation.toLowerCase().includes(q)) ||
          item.id.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [mistakeQuestions, selectedDomain, searchQuery]);

  // If Drill Mode is activated, render QuizzerView with mistakeQuestions!
  if (isDrillMode && mistakeQuestions.length > 0) {
    return (
      <QuizzerView
        customQuestions={mistakeQuestions}
        isDrillMode={true}
        onExitDrill={() => setIsDrillMode(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                专属错题本
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                错题靶向归集与歼灭
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              当前收录{" "}
              <strong className="text-rose-400 font-mono">
                {mistakeQuestions.length}
              </strong>{" "}
              道错题，支持针对性靶向重测，做对后可随时手动移出错题本。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={mistakeQuestions.length === 0}
              onClick={() => setIsDrillMode(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              <PlayCircle className="size-4" />
              <span>一键靶向重测 ({mistakeQuestions.length})</span>
            </button>
            {mistakeQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("确定要清空所有错题记录吗？")) {
                    clearAllMistakes();
                  }
                }}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-hover text-rose-400 border border-border transition-colors flex items-center gap-1"
              >
                <Trash2 className="size-3.5" />
                <span>清空</span>
              </button>
            )}
          </div>
        </div>

        {/* Domain Filter Pills */}
        {domains.length > 1 && (
          <div className="flex overflow-x-auto gap-1.5 pb-1 max-w-full border-t border-border/80 pt-3">
            {domains.map((d) => {
              const isSelected = selectedDomain === d;
              const count =
                d === "ALL"
                  ? mistakeQuestions.length
                  : mistakeQuestions.filter((q) => q.domain === d).length;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomain(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-brand text-brand-foreground border-brand font-semibold shadow-xs"
                      : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {d === "ALL" ? "全部错题" : d}
                  <span className="ml-1 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mistake Question Cards List */}
      {filteredMistakes.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-2xl space-y-3">
          <CheckCircle2 className="size-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-foreground">错题本目前为空</h3>
          <p className="text-xs text-muted-foreground">
            恭喜！当前没有未掌握的错题，或者你已经全部攻克。去刷题检验一下吧！
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((q, idx) => (
            <div
              key={q.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-brand/40 transition-colors"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-brand">
                    #{idx + 1} · {q.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
                    {q.domain}
                  </span>
                  {q.year && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface text-muted-foreground border border-border">
                      {q.year}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeMistakeQuestion(q.id)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-surface hover:bg-surface-hover text-muted-foreground hover:text-emerald-400 border border-border flex items-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>已掌握并移出</span>
                </button>
              </div>

              {/* Stem */}
              <div className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                {q.stem}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optText = q.options[opt];
                  const isAnswer = opt === q.answer;
                  return (
                    <div
                      key={opt}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                        isAnswer
                          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200 font-semibold"
                          : "bg-surface/40 border-border text-muted-foreground"
                      }`}
                    >
                      <span className="font-mono font-bold">{opt}.</span>
                      <span>{optText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Analysis */}
              <div className="p-3 bg-surface/50 border border-border rounded-xl text-xs text-foreground/90 space-y-1">
                <div className="text-brand font-semibold flex items-center gap-1">
                  <Sparkles className="size-3.5" />
                  <span>标准解析：</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
                  {q.explanation || q.analysis}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
