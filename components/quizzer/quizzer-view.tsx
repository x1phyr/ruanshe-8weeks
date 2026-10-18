"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  AlertTriangle,
  Flame,
  Search,
  X,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { useTrainerStore } from "@/lib/store";
import questionsData from "@/src/data/questions.json";

export interface QuestionData {
  id: string;
  domain: string;
  year?: string;
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  analysis?: string;
  explanation?: string;
  keyFormula?: string;
  source?: string;
  isHighYield?: boolean;
  trapAlert?: string;
}

interface QuizzerViewProps {
  customQuestions?: QuestionData[];
  isDrillMode?: boolean;
  onExitDrill?: () => void;
}

export function QuizzerView({
  customQuestions,
  isDrillMode = false,
  onExitDrill,
}: QuizzerViewProps) {
  const allQuestions: QuestionData[] = customQuestions || (questionsData as QuestionData[]);

  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [filterMode, setFilterMode] = useState<"ALL" | "HIGH_YIELD" | "MISTAKES">("ALL");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Session Statistics
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const mistakeQuestionIds = useTrainerStore((s) => s.mistakeQuestionIds);
  const addMistakeQuestion = useTrainerStore((s) => s.addMistakeQuestion);

  const mistakeSet = useMemo(
    () => new Set(mistakeQuestionIds),
    [mistakeQuestionIds]
  );

  const domains = useMemo(() => {
    return ["ALL", ...Array.from(new Set(allQuestions.map((q) => q.domain)))];
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    let list = allQuestions;

    if (selectedDomain !== "ALL") {
      list = list.filter((q) => q.domain === selectedDomain);
    }

    if (filterMode === "HIGH_YIELD") {
      list = list.filter((q) => q.isHighYield);
    } else if (filterMode === "MISTAKES") {
      list = list.filter((q) => mistakeSet.has(q.id));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        return (
          item.stem.toLowerCase().includes(q) ||
          item.domain.toLowerCase().includes(q) ||
          (item.year && item.year.toLowerCase().includes(q)) ||
          item.id.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [allQuestions, selectedDomain, filterMode, searchQuery, mistakeSet]);

  // Clamp index
  useEffect(() => {
    if (currentIndex >= filteredQuestions.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp index after filter shrinks; render-phase reset would loop when the list is empty
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  }, [filteredQuestions.length, currentIndex]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  // Option selection
  const handleSelect = useCallback(
    (key: string) => {
      if (!isSubmitted) {
        setSelectedOption(key);
      }
    },
    [isSubmitted]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (filteredQuestions.length === 0) return;
    setCurrentIndex((prev) => (prev < filteredQuestions.length - 1 ? prev + 1 : 0));
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [filteredQuestions.length]);

  const handlePrev = useCallback(() => {
    if (filteredQuestions.length === 0) return;
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : filteredQuestions.length - 1
    );
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [filteredQuestions.length]);

  // Submission
  const handleSubmit = useCallback(() => {
    if (selectedOption && !isSubmitted && currentQ) {
      setIsSubmitted(true);
      const isCorrect = selectedOption === currentQ.answer;
      setSessionAnswered((prev) => prev + 1);

      if (isCorrect) {
        setSessionCorrect((prev) => prev + 1);
      } else {
        // Automatically collect wrong question
        addMistakeQuestion(currentQ.id);
      }
    } else if (isSubmitted) {
      handleNext();
    }
  }, [selectedOption, isSubmitted, currentQ, addMistakeQuestion, handleNext]);

  // Register Global Keyboard Engine with strict focus protection
  useKeyboardShortcuts({
    enabled: true,
    onSelectOption: handleSelect as (opt: "A" | "B" | "C" | "D") => void,
    onSubmit: handleSubmit,
    onNext: handleNext,
    onPrev: handlePrev,
  });

  const sessionAccuracy =
    sessionAnswered > 0
      ? Math.round((sessionCorrect / sessionAnswered) * 100)
      : 0;

  if (!currentQ) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center bg-card border border-border rounded-2xl space-y-4">
        <BookOpen className="size-12 text-muted-foreground mx-auto" />
        <h3 className="text-base font-bold text-foreground">
          当前筛选条件下暂无题目
        </h3>
        <p className="text-xs text-muted-foreground">
          请尝试切换知识域或重置筛选条件。
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedDomain("ALL");
            setFilterMode("ALL");
            setSearchQuery("");
            setCurrentIndex(0);
          }}
          className="px-4 py-2 bg-brand text-brand-foreground rounded-xl text-xs font-semibold"
        >
          查看全部 {allQuestions.length} 道综合知识题目
        </button>
      </div>
    );
  }

  const isCurrentMistake = mistakeSet.has(currentQ.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Session Metrics */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isDrillMode ? (
              <button
                type="button"
                onClick={onExitDrill}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <ArrowLeft className="size-4" /> 退出错题靶向重练
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/20 text-brand border border-brand/30">
                  上午综合知识极速刷题
                </span>
              </div>
            )}
            <span className="text-muted-foreground">|</span>
            <span className="font-mono text-xs font-bold text-brand">
              题号: {currentIndex + 1} / {filteredQuestions.length}
            </span>
          </div>

          {/* Session Metrics Pills */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-border">
              <Target className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">已答:</span>
              <span className="font-mono font-bold text-foreground">
                {sessionAnswered}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-border">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span className="text-muted-foreground">正确率:</span>
              <span className="font-mono font-bold text-emerald-400">
                {sessionAccuracy}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-border">
              <XCircle className="size-3.5 text-rose-400" />
              <span className="text-muted-foreground">错题本:</span>
              <span className="font-mono font-bold text-rose-400">
                {mistakeQuestionIds.length}
              </span>
            </div>
          </div>
        </div>

        {/* Domain Tabs & Filter Pills */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 max-w-full border-t border-border/80 pt-3">
          {domains.map((d) => {
            const isSelected = selectedDomain === d;
            const count =
              d === "ALL"
                ? allQuestions.length
                : allQuestions.filter((q) => q.domain === d).length;

            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDomain(d);
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setIsSubmitted(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-brand text-brand-foreground border-brand font-semibold shadow-xs"
                    : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {d === "ALL" ? "全部领域" : d}
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setFilterMode("ALL");
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg border font-medium ${
                filterMode === "ALL"
                  ? "bg-surface-hover text-foreground font-semibold"
                  : "bg-surface text-muted-foreground border-border"
              }`}
            >
              全部题目
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode("HIGH_YIELD");
                setCurrentIndex(0);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                filterMode === "HIGH_YIELD"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                  : "bg-surface text-muted-foreground border-border"
              }`}
            >
              <Flame className="size-3 text-rose-400" />
              <span>冲刺高频必刷</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode("MISTAKES");
                setCurrentIndex(0);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                filterMode === "MISTAKES"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                  : "bg-surface text-muted-foreground border-border"
              }`}
            >
              <BookOpen className="size-3 text-amber-400" />
              <span>本知识域错题 ({mistakeSet.size})</span>
            </button>
          </div>

          {/* Search box with strict focus protection */}
          <div className="relative w-48">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索题干/考点..."
              className="w-full pl-8 pr-7 py-1 text-xs rounded-lg border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border/80">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-brand">
              {currentQ.id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
              {currentQ.domain}
            </span>
            {currentQ.year && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-surface text-muted-foreground border border-border">
                {currentQ.year}
              </span>
            )}
            {currentQ.isHighYield && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
                <Flame className="size-2.5 text-rose-400" /> 冲刺必刷
              </span>
            )}
          </div>

          {/* Mistake notebook badge */}
          {isCurrentMistake && (
            <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              已归集入错题本
            </span>
          )}
        </div>

        {/* Question Stem */}
        <div className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
          {currentQ.stem}
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3">
          {(["A", "B", "C", "D"] as const).map((optKey) => {
            const optText = currentQ.options[optKey];
            if (!optText) return null;

            const isSelected = selectedOption === optKey;
            const isCorrect = isSubmitted && optKey === currentQ.answer;
            const isWrong = isSubmitted && isSelected && !isCorrect;

            let optStyle = "bg-surface/50 border-border hover:border-brand/40 text-foreground";
            if (isSubmitted) {
              if (isCorrect) {
                optStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
              } else if (isWrong) {
                optStyle = "bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500/40";
              } else {
                optStyle = "bg-surface/30 border-border/40 text-muted-foreground opacity-60";
              }
            } else if (isSelected) {
              optStyle = "bg-brand/15 border-brand text-brand ring-1 ring-brand/50 font-semibold";
            }

            return (
              <button
                key={optKey}
                type="button"
                disabled={isSubmitted}
                onClick={() => handleSelect(optKey)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${optStyle}`}
              >
                <span
                  className={`size-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 border ${
                    isSelected
                      ? "bg-brand text-brand-foreground border-brand"
                      : "bg-surface border-border text-muted-foreground"
                  }`}
                >
                  {optKey}
                </span>
                <span className="text-xs sm:text-sm leading-relaxed flex-1 pt-0.5">
                  {optText}
                </span>
                {isSubmitted && isCorrect && (
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                )}
                {isSubmitted && isWrong && (
                  <XCircle className="size-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Submission Feedback & Solution Analysis (Revealed when submitted) */}
        {isSubmitted && (
          <div className="pt-5 border-t border-border/80 space-y-4">
            {/* Result Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/80 border border-border">
              <div className="flex items-center gap-2">
                {selectedOption === currentQ.answer ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="size-4" /> 回答正确！
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <XCircle className="size-4" /> 回答错误，已自动归集入错题本
                  </span>
                )}
              </div>
              <div className="text-xs font-mono">
                标准答案: <strong className="text-amber-400 text-sm font-bold">{currentQ.answer}</strong>
                {selectedOption && (
                  <span className="ml-2 text-muted-foreground">
                    (你的选择: {selectedOption})
                  </span>
                )}
              </div>
            </div>

            {/* Formula Box if any */}
            {currentQ.keyFormula && (
              <div className="p-3.5 bg-brand/10 border border-brand/20 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                  <Calculator className="size-4" />
                  <span>核心计算公式与推导：</span>
                </div>
                <div className="font-mono text-xs text-foreground bg-surface p-2 rounded-lg border border-border">
                  {currentQ.keyFormula}
                </div>
              </div>
            )}

            {/* Trap Alert Box if any */}
            {currentQ.trapAlert && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-200">⚠️ 考场避坑指南：</strong>
                  <span>{currentQ.trapAlert}</span>
                </div>
              </div>
            )}

            {/* Detailed Explanation / Analysis */}
            <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-2 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              <div className="font-bold text-brand text-xs flex items-center gap-1">
                <Sparkles className="size-3.5" />
                <span>答案详细解析：</span>
              </div>
              {currentQ.explanation || currentQ.analysis}
            </div>
          </div>
        )}

        {/* Action Controls & Keyboard Hints */}
        <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground flex items-center gap-3">
            <span>快捷键: <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-mono">1-4</kbd> / <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-mono">A-D</kbd> 选题</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-mono">Enter</kbd> 提交/下一题</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-mono">→</kbd> 切题</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-border flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="size-4" />
              <span>上一题</span>
            </button>

            {!isSubmitted ? (
              <button
                type="button"
                disabled={!selectedOption}
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                提交判分 (Enter)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs"
              >
                下一题 (Space / Enter)
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-border flex items-center gap-1 transition-colors"
            >
              <span>下一题</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
