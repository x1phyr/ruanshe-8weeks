"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarRange,
  Target,
  CheckCircle2,
  Square,
  CheckSquare,
  Clock,
  BookOpen,
  Zap,
  FileCode2,
  ArrowRight,
} from "lucide-react";
import { useTrainerStore } from "@/lib/store";
import studyPlansData from "@/src/data/studyPlans.json";

export function RegularView() {
  const [activeWeek, setActiveWeek] = useState(1);
  const checklist = useTrainerStore((s) => s.checklist);
  const toggleTask = useTrainerStore((s) => s.toggleTask);

  const regularWeeks = studyPlansData.regular8Weeks;
  const currentWeek =
    regularWeeks.find((w) => w.week === activeWeek) || regularWeeks[0];

  const phaseConfig: Record<string, { label: string; badge: string }> = {
    基础通读: {
      label: "第一轮 · 基础通读与考点梳理",
      badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
    专题突破: {
      label: "第二轮 · 上午专题与大题攻坚",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    模考冲刺: {
      label: "第三轮 · 全真模考与查漏补缺",
      badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    },
  };

  const currentPhase =
    phaseConfig[currentWeek.phase] || phaseConfig["基础通读"];

  const typeConfig: Record<string, { badge: string; icon: any; href: string }> = {
    理论精读: {
      badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      icon: BookOpen,
      href: "/cheatsheet",
    },
    上午刷题: {
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: Zap,
      href: "/practice",
    },
    下午案例: {
      badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      icon: FileCode2,
      href: "/cases",
    },
  };

  return (
    <div className="space-y-5">
      {/* 1. Week Selector Pills (Week 1..8) */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {regularWeeks.map((w) => {
          const isSelected = w.week === activeWeek;
          const completedCount = w.dailyTasks.filter((t) => {
            const taskId = `W${w.week}-D${t.dayInWeek}`;
            return checklist[taskId];
          }).length;
          const totalCount = w.dailyTasks.length;
          const isAllDone = completedCount === totalCount && totalCount > 0;

          return (
            <button
              key={w.week}
              type="button"
              onClick={() => setActiveWeek(w.week)}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-surface border-brand ring-2 ring-brand/30 shadow-md"
                  : "bg-card hover:bg-surface border-border"
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  第 {w.week} 周
                </span>
                {isAllDone && <CheckCircle2 className="size-3 text-emerald-400" />}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {completedCount}/{totalCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Current Week Summary Card */}
      <div className="bg-gradient-to-br from-card via-card to-brand/10 rounded-2xl border border-border p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentPhase.badge}`}
              >
                {currentPhase.label}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {currentWeek.title}
            </h2>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            阶段进度: 第 {currentWeek.week} / 8 周
          </div>
        </div>

        {/* Weekly Goals */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Target className="size-4 text-brand" />
            <span>本周攻坚核心目标:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentWeek.goals.map((goal, idx) => (
              <div
                key={idx}
                className="bg-surface/60 rounded-xl p-2.5 border border-border text-xs text-foreground/90 flex items-start gap-2"
              >
                <span className="size-4 rounded-full bg-brand/15 text-brand text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Daily Task List for the Week (7 days) */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CalendarRange className="size-4 text-brand" />
            <span>第 {activeWeek} 周每日学习打卡任务</span>
          </h3>
          <span className="text-xs text-muted-foreground">共 7 天学习任务</span>
        </div>

        <div className="divide-y divide-border/80">
          {currentWeek.dailyTasks.map((t) => {
            const taskId = `W${currentWeek.week}-D${t.dayInWeek}`;
            const isDone = Boolean(checklist[taskId]);
            const typeInfo = typeConfig[t.type] || typeConfig["理论精读"];
            const TypeIcon = typeInfo.icon;

            return (
              <div
                key={taskId}
                className={`py-3.5 flex items-start justify-between gap-3 transition-colors rounded-lg px-2 ${
                  isDone ? "bg-surface/30 opacity-80" : "hover:bg-surface/50"
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTask(taskId)}
                    aria-label={`完成任务 ${t.task}`}
                    className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckSquare className="size-4 text-emerald-400" />
                    ) : (
                      <Square className="size-4 text-muted-foreground hover:text-brand" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        第 {t.dayInWeek} 天
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${typeInfo.badge}`}
                      >
                        <TypeIcon className="size-3" />
                        {t.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="size-3" />
                        {t.estimatedMinutes} 分钟
                      </span>
                    </div>

                    <div
                      onClick={() => toggleTask(taskId)}
                      className={`text-xs sm:text-sm font-medium cursor-pointer ${
                        isDone
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {t.task}
                    </div>
                  </div>
                </div>

                <Link
                  href={typeInfo.href}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface hover:bg-surface-hover text-brand border border-border flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>前往</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
