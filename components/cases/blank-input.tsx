"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Blank, BlankEvaluation } from "@/lib/scoringHelper";

interface BlankInputProps {
  blank: Blank;
  value?: string;
  onChange?: (val: string) => void;
  checked?: boolean;
  evaluation?: BlankEvaluation | null;
}

export function BlankInput({
  blank,
  value = "",
  onChange,
  checked = false,
  evaluation = null,
}: BlankInputProps) {
  const isCorrect = Boolean(evaluation?.isCorrect);
  const earnedPoints = evaluation?.earnedPoints ?? 0;
  const totalPoints = blank?.points || 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        checked
          ? isCorrect
            ? "bg-emerald-950/20 border-emerald-500/40"
            : "bg-rose-950/20 border-rose-500/40"
          : "bg-surface/50 border-border hover:border-brand/40"
      }`}
    >
      {/* Blank Header & Point Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-brand/15 text-brand border border-brand/30">
            空缺 {blank.label || `[${blank.blankIndex}]`}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            (序号 #{blank.blankIndex})
          </span>
        </div>

        {/* Score Badge */}
        <div>
          {checked ? (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isCorrect
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  +{earnedPoints} 分 / {totalPoints} 分
                </>
              ) : (
                <>
                  <XCircle className="size-3.5 text-rose-400" />
                  0 分 / {totalPoints} 分
                </>
              )}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] bg-surface text-muted-foreground border border-border font-mono">
              满分 {totalPoints} 分
            </span>
          )}
        </div>
      </div>

      {/* Input Field with strict keyboard shortcut isolation */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => {
            // Strictly isolate input from global hotkeys
            e.stopPropagation();
          }}
          placeholder={`请输入空缺 [${blank.label || blank.blankIndex}] 的答案...`}
          className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl font-sans transition-all focus:outline-none focus:ring-2 ${
            checked
              ? isCorrect
                ? "bg-emerald-950/30 text-emerald-100 border border-emerald-500/50 focus:ring-emerald-500"
                : "bg-rose-950/30 text-rose-100 border border-rose-500/50 focus:ring-rose-500"
              : "bg-surface border border-border text-foreground placeholder-muted-foreground focus:border-brand focus:ring-brand/30"
          }`}
        />
      </div>

      {/* Grading Rubric & Explanation (Revealed when checked) */}
      {checked && (
        <div className="mt-3 pt-3 border-t border-border/80 space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              className={`font-bold ${
                isCorrect ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              得分: {earnedPoints} 分
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-foreground">
              标准答案:{" "}
              <strong className="text-amber-300 font-semibold">
                {blank.standardAnswer}
              </strong>
            </span>
          </div>

          {/* Acceptable variations if any */}
          {Array.isArray(blank.acceptableAnswers) &&
            blank.acceptableAnswers.length > 1 && (
              <div className="text-muted-foreground text-[11px] leading-relaxed">
                <span>智能容错备选: </span>
                {blank.acceptableAnswers
                  .filter((ans) => ans !== blank.standardAnswer)
                  .join(" / ")}
              </div>
            )}

          {/* Detailed Rubric Explanation */}
          {blank.explanation && (
            <div className="p-2.5 rounded-lg bg-surface/60 border border-border text-muted-foreground leading-relaxed">
              <span className="font-semibold text-brand">采分点解析: </span>
              {blank.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
