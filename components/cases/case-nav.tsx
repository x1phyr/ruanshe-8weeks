"use client";

import React from "react";
import {
  Layers,
  Database,
  GitBranch,
  Cpu,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { CaseStudy, CaseEvaluation } from "@/lib/scoringHelper";

export const QUESTION_TYPES = [
  { key: "ALL", name: "全部大题", shortName: "全部", icon: Layers },
  { key: "DFD", name: "试题一：数据流图（DFD）", shortName: "DFD", icon: Layers },
  { key: "DATABASE", name: "试题二：数据库设计", shortName: "数据库", icon: Database },
  { key: "UML", name: "试题三：UML建模", shortName: "UML", icon: GitBranch },
  { key: "ALGORITHM", name: "试题四：C语言算法设计", shortName: "C算法", icon: Cpu },
  { key: "DESIGN_PATTERN", name: "试题五：设计模式", shortName: "设计模式", icon: BookOpen },
];

interface CaseNavProps {
  caseStudies: CaseStudy[];
  selectedType: string;
  onSelectType: (type: string) => void;
  currentCaseId: string;
  onSelectCase: (caseId: string) => void;
  caseScores?: Record<string, CaseEvaluation & { isChecked?: boolean }>;
}

export function CaseNav({
  caseStudies = [],
  selectedType = "ALL",
  onSelectType,
  currentCaseId,
  onSelectCase,
  caseScores = {},
}: CaseNavProps) {
  const displayedCases =
    selectedType === "ALL"
      ? caseStudies
      : caseStudies.filter((c) => c.type === selectedType);

  const currentIndex = displayedCases.findIndex((c) => c.id === currentCaseId);

  const handlePrev = () => {
    if (displayedCases.length === 0) return;
    const nextIdx =
      currentIndex > 0 ? currentIndex - 1 : displayedCases.length - 1;
    onSelectCase(displayedCases[nextIdx].id);
  };

  const handleNext = () => {
    if (displayedCases.length === 0) return;
    const nextIdx =
      currentIndex < displayedCases.length - 1 ? currentIndex + 1 : 0;
    onSelectCase(displayedCases[nextIdx].id);
  };

  return (
    <div className="space-y-4">
      {/* 1. Five Question Types Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin">
        {QUESTION_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.key;
          const dynamicCount =
            type.key === "ALL"
              ? caseStudies.length
              : caseStudies.filter((c) => c.type === type.key).length;

          return (
            <button
              key={type.key}
              type="button"
              onClick={() => onSelectType(type.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-brand border-brand text-brand-foreground shadow-sm"
                  : "bg-card hover:bg-surface border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{type.name}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected
                    ? "bg-black/20 text-white"
                    : "bg-surface text-muted-foreground"
                }`}
              >
                {dynamicCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Case Selector Cards / Pills with Quick Status Badges */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>当前题型案例列表 ({displayedCases.length} 套)</span>
            <span>·</span>
            <span>当前选中: #{currentIndex >= 0 ? currentIndex + 1 : 1}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              title="切换上一题"
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="切换下一题"
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {displayedCases.map((c) => {
            const isCurrent = c.id === currentCaseId;
            const scoreInfo = caseScores[c.id];
            const isChecked = Boolean(scoreInfo?.isChecked);
            const totalEarned = scoreInfo?.totalEarned ?? 0;
            const isPassed = Boolean(scoreInfo?.isPassed);
            const answeredCount = scoreInfo?.answeredCount ?? 0;
            const totalBlanks =
              scoreInfo?.totalBlanks ??
              c.subQuestions.flatMap((sq) => sq.blanks).length;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCase(c.id)}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                  isCurrent
                    ? "bg-surface border-brand ring-2 ring-brand/30 shadow-md"
                    : "bg-surface/50 border-border hover:border-brand/40 hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <span
                    className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? "bg-brand/20 text-brand"
                        : "bg-surface border border-border text-muted-foreground"
                    }`}
                  >
                    {c.id}
                  </span>

                  {/* Status Badge */}
                  {isChecked ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${
                        isPassed
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      <CheckCircle2 className="size-2.5" />
                      {totalEarned} / 15分
                    </span>
                  ) : answeredCount > 0 ? (
                    <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                      已填 {answeredCount}/{totalBlanks}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground bg-surface px-1.5 py-0.5 rounded-full border border-border">
                      待作答
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-foreground line-clamp-1">
                  {c.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
