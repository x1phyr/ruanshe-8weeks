"use client";

import React from "react";
import {
  RotateCw,
  CheckCircle2,
  Zap,
  Calculator,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export interface FlashcardData {
  id: string;
  domain: string;
  title: string;
  frequency?: string;
  explanation: string;
  mnemonic: string;
  formula?: string | null;
  trapAlert: string;
}

interface FlashcardItemProps {
  card: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
  isMastered: boolean;
  onToggleMastered: (id: string) => void;
  currentIndex: number;
  totalCount: number;
}

export function FlashcardItem({
  card,
  isFlipped,
  onFlip,
  isMastered,
  onToggleMastered,
  currentIndex,
  totalCount,
}: FlashcardItemProps) {
  if (!card) return null;

  const frequencyConfig: Record<string, { label: string; bg: string }> = {
    critical: {
      label: "🔥 核心必考",
      bg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    },
    high: {
      label: "⭐ 高频考点",
      bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    medium: {
      label: "常考考点",
      bg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
  };

  const freq = frequencyConfig[card.frequency || "high"] || frequencyConfig.high;

  return (
    <div className="w-full select-none" style={{ perspective: "1200px" }}>
      <div
        data-testid="flashcard"
        role="article"
        onClick={onFlip}
        className={`flashcard card-flip relative w-full min-h-[380px] rounded-2xl p-6 sm:p-8 cursor-pointer shadow-2xl transition-all duration-500 flex flex-col justify-between border ${
          isMastered
            ? "bg-card/90 border-emerald-500/40 shadow-emerald-500/5"
            : "bg-card border-border hover:border-brand/50 shadow-brand/5"
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {!isFlipped ? (
          /* ================= FRONT FACE ================= */
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Bar */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-brand bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/20">
                    {card.domain}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${freq.bg}`}
                  >
                    {freq.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMastered(card.id);
                    }}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors border ${
                      isMastered
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                        : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    <CheckCircle2
                      className={`size-3.5 ${
                        isMastered ? "text-emerald-400" : "text-muted-foreground"
                      }`}
                    />
                    <span>{isMastered ? "已掌握" : "标记掌握"}</span>
                  </button>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <RotateCw className="size-3.5 text-brand" />
                    <span className="hidden sm:inline">点击翻转</span>
                  </span>
                </div>
              </div>

              {/* Title & Core Explanation */}
              <div className="my-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
                    {card.title}
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border shrink-0">
                    {card.id}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-normal bg-surface/50 p-4 rounded-xl border border-border/80">
                  {card.explanation}
                </p>
              </div>
            </div>

            {/* Front Bottom Bar */}
            <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 text-brand font-medium">
                <Sparkles className="size-3.5" /> 背面含：秒杀口诀 · 核心公式 · 考场避坑
              </span>
              <span className="font-mono text-muted-foreground">
                {currentIndex + 1} / {totalCount}
              </span>
            </div>
          </div>
        ) : (
          /* ================= BACK FACE ================= */
          <div
            className="flex-1 flex flex-col justify-between"
            style={{ transform: "rotateY(180deg)" }}
          >
            {/* Back Top Bar */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-brand bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/20">
                    {card.domain}
                  </span>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    背面 · 极速破题秘籍
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMastered(card.id);
                    }}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors border ${
                      isMastered
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                        : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    <CheckCircle2
                      className={`size-3.5 ${
                        isMastered ? "text-emerald-400" : "text-muted-foreground"
                      }`}
                    />
                    <span>{isMastered ? "已掌握" : "标记掌握"}</span>
                  </button>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <RotateCw className="size-3.5 text-brand" />
                    <span className="hidden sm:inline">翻回正面</span>
                  </span>
                </div>
              </div>

              {/* Back Content: Mnemonic, Formula, Trap Alert */}
              <div className="my-5 space-y-3.5">
                {/* 1. Mnemonic Highlight (秒杀口诀) */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1.5">
                    <Zap className="size-4 fill-amber-400" />
                    <span>⚡ 秒杀口诀：</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-amber-200 tracking-wide leading-relaxed pl-1">
                    {card.mnemonic}
                  </p>
                </div>

                {/* 2. Formula Box (if exists) */}
                {card.formula && (
                  <div className="p-3.5 bg-brand/10 border border-brand/30 rounded-xl">
                    <div className="flex items-center gap-1.5 text-brand font-bold text-xs mb-1.5">
                      <Calculator className="size-4 text-brand" />
                      <span>📐 核心公式与计算法则：</span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-foreground bg-surface p-2.5 rounded-lg border border-border overflow-x-auto">
                      {card.formula}
                    </div>
                  </div>
                )}

                {/* 3. Exam Trap Alert Box (考场避坑) */}
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1.5">
                    <AlertTriangle className="size-4 text-rose-400" />
                    <span>⚠️ 考场避坑陷阱 (高频失分点)：</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed pl-1">
                    {card.trapAlert}
                  </p>
                </div>
              </div>
            </div>

            {/* Back Bottom Bar */}
            <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-muted-foreground">
                卡片 ID: <span className="font-mono text-foreground">{card.id}</span>
              </span>
              <span className="font-mono text-muted-foreground">
                {currentIndex + 1} / {totalCount}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
