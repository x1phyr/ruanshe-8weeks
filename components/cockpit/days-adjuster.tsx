"use client";

import React from "react";
import {
  Flame,
  CalendarDays,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useTrainerStore, getPrepMode } from "@/lib/store";

export function DaysAdjuster() {
  const remainingDays = useTrainerStore((s) => s.remainingDays);
  const setRemainingDays = useTrainerStore((s) => s.setRemainingDays);
  const mode = getPrepMode(remainingDays);
  const isSprint = mode === "sprint";

  const PRESETS = [
    { label: "3天极限", days: 3 },
    { label: "5天高频", days: 5 },
    { label: "7天冲刺", days: 7 },
    { label: "14天突破", days: 14 },
    { label: "30天巩固", days: 30 },
    { label: "56天(8周)", days: 56 },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
      {/* Top Banner: Mode Indicator */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isSprint
            ? "bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-rose-950/40 border-rose-500/40 shadow-inner"
            : "bg-gradient-to-r from-emerald-950/30 via-slate-900 to-emerald-950/30 border-emerald-500/30"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isSprint
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
                  : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              }`}
            >
              {isSprint ? <Flame className="size-5" /> : <CalendarDays className="size-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    isSprint
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {isSprint ? "🔥 极限冲刺模式 (Crash Sprint)" : "常规8周通关模式 (Regular Plan)"}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {isSprint ? "< 10天触发" : ">= 10天执行"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
                {isSprint
                  ? `距考试仅剩 ${remainingDays} 天 · 启动“二八法则”高频夺分任务流`
                  : `备考充裕（剩余 ${remainingDays} 天）· 稳步推进三轮复习法`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center bg-surface/80 px-3 py-1.5 rounded-xl border border-border">
            <span className="text-xs text-muted-foreground">剩余天数:</span>
            <span className="font-mono text-xl font-bold text-brand">
              {remainingDays}
            </span>
            <span className="text-xs text-muted-foreground">天</span>
          </div>
        </div>

        {/* Tactical Note */}
        <div className="mt-3 pt-3 border-t border-border/60 text-xs flex items-center gap-2 text-muted-foreground">
          {isSprint ? (
            <>
              <AlertTriangle className="size-4 text-amber-400 shrink-0" />
              <span className="text-amber-200/90">
                已自动过滤低性价比生僻偏题，集中攻坚必背四页纸、上午高频50分与下午DFD/数据库保底30分！
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="size-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-200/90">
                涵盖基础通读（第1-3周）、专题突破（第4-6周）、模考冲刺（第7-8周）全套进阶路线。
              </span>
            </>
          )}
        </div>
      </div>

      {/* Slider & Numeric Input Controls */}
      <div className="space-y-3 bg-surface/40 p-4 rounded-xl border border-border/80">
        <div className="flex items-center justify-between">
          <label
            htmlFor="days-slider"
            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <SlidersHorizontal className="size-3.5 text-brand" />
            <span>自由调节剩余备考天数 (1 ~ 56 天)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">直接输入:</span>
            <input
              type="number"
              min={1}
              max={56}
              value={remainingDays}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setRemainingDays(val);
                }
              }}
              className="w-14 px-2 py-1 text-center font-mono text-xs font-bold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative py-2">
          <input
            id="days-slider"
            type="range"
            min={1}
            max={56}
            step={1}
            value={remainingDays}
            onChange={(e) => setRemainingDays(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-brand"
          />
          {/* Threshold markers */}
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
            <span>1天</span>
            <span className="text-amber-400 font-bold">▲ 10天冲刺分界线</span>
            <span>28天(4周)</span>
            <span>56天(8周)</span>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground mr-1">快捷预设:</span>
          {PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setRemainingDays(p.days)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors border ${
                remainingDays === p.days
                  ? "bg-brand text-brand-foreground border-brand font-semibold shadow-xs"
                  : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
