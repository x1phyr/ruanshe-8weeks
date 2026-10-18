"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Lightbulb,
  RotateCcw,
  BookOpen,
  Award,
} from "lucide-react";
import { CaseNav } from "./case-nav";
import { BlankInput } from "./blank-input";
import { SolutionModal } from "./solution-modal";
import { evaluateCase, CaseStudy } from "@/lib/scoringHelper";
import { useTrainerStore } from "@/lib/store";
import caseStudiesData from "@/src/data/caseStudies.json";

export function CasesView() {
  const caseStudies = caseStudiesData as CaseStudy[];

  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [currentCaseId, setCurrentCaseId] = useState<string>(
    () => caseStudies[0]?.id || "CASE-DFD-01"
  );
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);

  // Store persistence
  const caseAnswers = useTrainerStore((s) => s.caseAnswers);
  const caseChecked = useTrainerStore((s) => s.caseChecked);
  const setCaseAnswer = useTrainerStore((s) => s.setCaseAnswer);
  const setCaseChecked = useTrainerStore((s) => s.setCaseChecked);

  // Active case study
  const currentCase = useMemo(() => {
    return (
      caseStudies.find((c) => c.id === currentCaseId) || caseStudies[0]
    );
  }, [caseStudies, currentCaseId]);

  // Current answers for active case
  const currentCaseAnswers = useMemo(() => {
    return (currentCase && caseAnswers[currentCase.id]) || {};
  }, [currentCase, caseAnswers]);

  // Check state for current active case
  const isCurrentChecked = Boolean(currentCase && caseChecked[currentCase.id]);

  // Global evaluation results across all cases for CaseNav indicators
  const allCaseScores = useMemo(() => {
    const scores: Record<string, ReturnType<typeof evaluateCase> & { isChecked?: boolean }> = {};
    caseStudies.forEach((cs) => {
      const answers = caseAnswers[cs.id] || {};
      const evalRes = evaluateCase(cs, answers);
      scores[cs.id] = {
        ...evalRes,
        isChecked: Boolean(caseChecked[cs.id]),
      };
    });
    return scores;
  }, [caseStudies, caseAnswers, caseChecked]);

  // Evaluation for active case
  const currentEvaluation = useMemo(() => {
    if (!currentCase) return null;
    return evaluateCase(currentCase, currentCaseAnswers);
  }, [currentCase, currentCaseAnswers]);

  // Change type handler
  const handleSelectType = useCallback(
    (newType: string) => {
      setSelectedType(newType);
      if (newType !== "ALL") {
        const active = caseStudies.find((c) => c.id === currentCaseId);
        if (!active || active.type !== newType) {
          const displayed = caseStudies.filter((c) => c.type === newType);
          if (displayed.length > 0) {
            setCurrentCaseId(displayed[0].id);
          }
        }
      }
    },
    [caseStudies, currentCaseId]
  );

  // Evaluate action
  const handleCheckAnswers = () => {
    if (currentCase) {
      setCaseChecked(currentCase.id, true);
    }
  };

  // Reset current case answers
  const handleResetAnswers = () => {
    if (currentCase && window.confirm("确定要重置当前案例的所有填空答案吗？")) {
      currentCase.subQuestions.forEach((sq) => {
        sq.blanks.forEach((b) => {
          setCaseAnswer(currentCase.id, b.blankIndex, "");
        });
      });
      setCaseChecked(currentCase.id, false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-card via-card to-brand/10 rounded-2xl border border-border p-5 sm:p-6 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/20 text-brand border border-brand/30">
                下午大题专项攻坚
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                26 套全真案例 · 智能容错判分
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Afternoon Cases Interactive Workshop
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsSolutionModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1.5 transition-colors self-start sm:self-center"
          >
            <Lightbulb className="size-4 text-amber-400" />
            <span>查看解题套路与考场必杀技</span>
          </button>
        </div>
      </div>

      {/* 2. Type & Case Navigation */}
      <CaseNav
        caseStudies={caseStudies}
        selectedType={selectedType}
        onSelectType={handleSelectType}
        currentCaseId={currentCaseId}
        onSelectCase={(id) => setCurrentCaseId(id)}
        caseScores={allCaseScores}
      />

      {/* 3. Main Case Study Workspace */}
      {currentCase && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Case Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-brand">
                  {currentCase.id}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
                  {currentCase.type}
                </span>
                {currentCase.year && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-surface text-muted-foreground border border-border">
                    {currentCase.year}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-bold text-foreground">
                {currentCase.title}
              </h2>
            </div>

            {/* Score & Passed Status Badge */}
            <div className="flex items-center gap-2">
              {isCurrentChecked && currentEvaluation ? (
                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                    currentEvaluation.isPassed
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  <Award className="size-4" />
                  <span>
                    得分: {currentEvaluation.totalEarned} / {currentEvaluation.totalPoints} 分
                  </span>
                  <span>({currentEvaluation.isPassed ? "达标通过" : "攻坚及格"})</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-muted-foreground font-mono">
                  已填: {currentEvaluation?.answeredCount || 0} /{" "}
                  {currentEvaluation?.totalBlanks || 0} 空
                </div>
              )}
            </div>
          </div>

          {/* Scenario Description (【说明】) */}
          {currentCase.scenario && (
            <div className="bg-surface/40 p-4 rounded-xl border border-border/80 space-y-2">
              <div className="text-xs font-bold text-brand flex items-center gap-1">
                <BookOpen className="size-3.5" />
                <span>案例背景说明：</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {currentCase.scenario}
              </p>
            </div>
          )}

          {/* Diagram / Pseudocode Box */}
          {currentCase.diagramSvgOrText && (
            <div className="bg-surface/60 p-4 rounded-xl border border-border space-y-2">
              <div className="text-xs font-bold text-brand">
                案例架构与结构示意图：
              </div>
              <pre className="font-mono text-xs sm:text-sm text-foreground bg-surface p-4 rounded-lg border border-border/60 overflow-x-auto leading-relaxed">
                {currentCase.diagramSvgOrText}
              </pre>
            </div>
          )}

          {/* Relations if any (数据库关系模式) */}
          {currentCase.relations && currentCase.relations.length > 0 && (
            <div className="bg-surface/50 p-4 rounded-xl border border-border space-y-2">
              <div className="text-xs font-bold text-brand">
                关系模式明细：
              </div>
              <div className="space-y-1.5 font-mono text-xs text-foreground">
                {currentCase.relations.map((rel, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-2 rounded bg-surface border border-border/60"
                  >
                    {rel}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pseudocode if any (C语言算法 / Java设计模式代码) */}
          {currentCase.pseudocode && (
            <div className="bg-surface/60 p-4 rounded-xl border border-border space-y-2">
              <div className="text-xs font-bold text-brand">
                核心源码与算法实现：
              </div>
              <pre className="font-mono text-xs sm:text-sm text-foreground bg-surface p-4 rounded-lg border border-border/60 overflow-x-auto leading-relaxed">
                {currentCase.pseudocode}
              </pre>
            </div>
          )}

          {/* SubQuestions and Interactive Blanks */}
          <div className="space-y-6 pt-4 border-t border-border/80">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              案例试题与填空作答：
            </h3>

            {currentCase.subQuestions.map((sq, sqIdx) => (
              <div
                key={sqIdx}
                className="bg-surface/30 p-5 rounded-2xl border border-border/80 space-y-4"
              >
                <div className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
                  {sq.prompt}
                </div>

                {/* Blanks inputs */}
                <div className="space-y-3">
                  {sq.blanks.map((b) => (
                    <BlankInput
                      key={String(b.blankIndex)}
                      blank={b}
                      value={currentCaseAnswers[String(b.blankIndex)] || ""}
                      onChange={(val) =>
                        setCaseAnswer(currentCase.id, b.blankIndex, val)
                      }
                      checked={isCurrentChecked}
                      evaluation={
                        currentEvaluation?.blankResults[String(b.blankIndex)]
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Evaluation Controls */}
          <div className="pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCheckAnswers}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 transition-colors shadow-sm"
              >
                {isCurrentChecked ? "重新判分 (Re-evaluate)" : "提交判分 (Check Answers)"}
              </button>
              <button
                type="button"
                onClick={handleResetAnswers}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border transition-colors flex items-center gap-1"
              >
                <RotateCcw className="size-3.5" />
                <span>重置作答</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSolutionModalOpen(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Lightbulb className="size-3.5" />
              <span>考点精析与解题套路</span>
            </button>
          </div>
        </div>
      )}

      {/* Solution Cheatsheet Drawer Modal */}
      <SolutionModal
        isOpen={isSolutionModalOpen}
        onClose={() => setIsSolutionModalOpen(false)}
        currentCase={currentCase}
      />
    </div>
  );
}
