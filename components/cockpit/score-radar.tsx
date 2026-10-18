"use client";

import React from "react";
import {
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Target,
  CheckCircle2,
} from "lucide-react";
import { RadarMetrics } from "@/lib/store";

interface ScoreRadarProps {
  metrics: RadarMetrics;
  mode: "regular" | "sprint";
}

export function ScoreRadar({ metrics, mode }: ScoreRadarProps) {
  const {
    taskCompletionRate,
    completedTasks,
    totalTasks,
    morningScore,
    afternoonScore,
    morningPass,
    afternoonPass,
    doublePass,
    passProbability,
    statusLabel,
  } = metrics;

  // Passing threshold constant: 45 / 75 = 60%
  const PASSING_THRESHOLD = 45;
  const morningPct = Math.round((morningScore / 75) * 100);
  const afternoonPct = Math.round((afternoonScore / 75) * 100);
  const thresholdPct = 60; // 45 / 75

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-5">
      {/* 1. Header with Pass Probability */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand/10 border border-brand/20 text-brand">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              45/75 及格安全雷达
            </h3>
            <p className="text-[11px] text-muted-foreground">
              软考双科必须同时 $\ge$ 45 分方可通过
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            {doublePass ? (
              <ShieldCheck className="size-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="size-4 text-amber-400" />
            )}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                doublePass
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
            预估过线率: <strong className="text-foreground">{passProbability}%</strong>
          </div>
        </div>
      </div>

      {/* 2. Overall Task Completion Meter */}
      <div className="bg-surface/60 rounded-xl p-4 border border-border/80 text-center">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">任务攻坚完成度</span>
          <span className="font-mono font-bold text-brand">
            {completedTasks} / {totalTasks} 项 ({taskCompletionRate}%)
          </span>
        </div>
        <div className="relative w-full bg-surface rounded-full h-3 overflow-hidden border border-border/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${taskCompletionRate}%` }}
          />
        </div>
      </div>

      {/* 3. Dual Score Trackers with 45-Point Safety Threshold Line */}
      <div className="space-y-4">
        {/* Morning Score */}
        <div className="space-y-1.5 bg-surface/40 p-3 rounded-xl border border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>上午综合知识预估</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  morningPass
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {morningPass ? "达标通过" : "攻坚冲刺"}
              </span>
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              {morningScore} <span className="text-[10px] text-muted-foreground">/ 75分</span>
            </span>
          </div>

          <div className="relative w-full bg-surface rounded-full h-2.5 overflow-hidden border border-border/60">
            {/* 45 threshold indicator marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
              style={{ left: `${thresholdPct}%` }}
              title="45分及格线"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                morningPass ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${morningPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>0</span>
            <span className="text-rose-400 font-bold" style={{ marginLeft: "-10px" }}>
              ▲ 45及格线
            </span>
            <span>75</span>
          </div>
        </div>

        {/* Afternoon Score */}
        <div className="space-y-1.5 bg-surface/40 p-3 rounded-xl border border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>下午案例分析预估</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  afternoonPass
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {afternoonPass ? "达标通过" : "大题攻坚"}
              </span>
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              {afternoonScore} <span className="text-[10px] text-muted-foreground">/ 75分</span>
            </span>
          </div>

          <div className="relative w-full bg-surface rounded-full h-2.5 overflow-hidden border border-border/60">
            {/* 45 threshold indicator marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
              style={{ left: `${thresholdPct}%` }}
              title="45分及格线"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                afternoonPass ? "bg-emerald-500" : "bg-purple-500"
              }`}
              style={{ width: `${afternoonPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>0</span>
            <span className="text-rose-400 font-bold" style={{ marginLeft: "-10px" }}>
              ▲ 45及格线
            </span>
            <span>75</span>
          </div>
        </div>
      </div>

      {/* 4. Strategic Advice Card */}
      <div className="p-3 bg-brand/10 rounded-xl border border-brand/20 text-xs text-brand leading-relaxed flex items-start gap-2">
        <Sparkles className="size-4 shrink-0 mt-0.5" />
        <span>
          <strong>及格线哲学：</strong>
          不求70分高分，只求双科稳过45！上午抓选择题核心考点，下午攻破DFD与数据库保底大题，严卡时间，稳拿证书！
        </span>
      </div>
    </div>
  );
}
