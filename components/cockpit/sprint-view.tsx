"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Zap,
  FileCode2,
  Square,
  CheckSquare,
  ArrowRight,
  Clock,
  Compass,
} from "lucide-react";
import { useTrainerStore } from "@/lib/store";
import sprintPlanData from "@/src/data/sprintPlan.json";

export function SprintView() {
  const [activeDay, setActiveDay] = useState(1);
  const checklist = useTrainerStore((s) => s.checklist);
  const toggleTask = useTrainerStore((s) => s.toggleTask);
  const remainingDays = useTrainerStore((s) => s.remainingDays);

  // Filter category
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const sprintPlan = sprintPlanData;
  const currentDay = sprintPlan.find((d) => d.day === activeDay) || sprintPlan[0];

  const categoryConfig: Record<
    string,
    { label: string; badge: string; icon: any; href: string; actionText: string }
  > = {
    reading: {
      label: "核心速记",
      badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      icon: BookOpen,
      href: "/flashcards",
      actionText: "去速记",
    },
    morning_quiz: {
      label: "上午特训",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: Zap,
      href: "/practice",
      actionText: "去刷题",
    },
    afternoon_case: {
      label: "下午案例",
      badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      icon: FileCode2,
      href: "/cases",
      actionText: "做案例",
    },
  };

  const filteredTasks = currentDay.tasks.filter((t) => {
    if (categoryFilter === "all") return true;
    return t.category === categoryFilter;
  });

  return (
    <div className="space-y-5">
      {/* 1. Day Selector Tabs */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {sprintPlan.map((d) => {
          const isSelected = d.day === activeDay;
          const completedCount = d.tasks.filter((t) => checklist[t.id]).length;
          const totalCount = d.tasks.length;
          const isAllDone = totalCount > 0 && completedCount === totalCount;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <button
              key={d.day}
              type="button"
              onClick={() => setActiveDay(d.day)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? "bg-surface border-brand shadow-md ring-2 ring-brand/30"
                  : "bg-card hover:bg-surface border-border"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  Day {d.day}
                </span>
                {isAllDone && <CheckCircle2 className="size-3.5 text-emerald-400" />}
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {completedCount}/{totalCount} 项
              </span>
              <div className="w-full bg-surface-hover rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isAllDone ? "bg-emerald-400" : "bg-brand"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Active Day Strategy Banner */}
      <div className="bg-gradient-to-br from-card via-card to-brand/10 rounded-2xl border border-border p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                极限攻坚目标
              </span>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {currentDay.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 rounded-xl border border-border shrink-0 self-start lg:self-center">
            <Target className="size-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">
              {currentDay.targetScore}
            </span>
          </div>
        </div>

        {/* Focus Morning & Afternoon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-surface/60 rounded-xl p-3 border border-border flex items-start gap-3">
            <div className="size-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-bold text-xs">
              上午
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground mb-0.5">
                上午核心攻坚知识域
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {currentDay.focusMorning}
              </p>
            </div>
          </div>

          <div className="bg-surface/60 rounded-xl p-3 border border-border flex items-start gap-3">
            <div className="size-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 font-bold text-xs">
              下午
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground mb-0.5">
                下午大题保底专项
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {currentDay.focusAfternoon}
              </p>
            </div>
          </div>
        </div>

        {/* 20/80 Strategy Note */}
        <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 flex items-start gap-2.5">
          <Lightbulb className="size-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-300">二八法则夺分军规：</span>
            {currentDay.strategy}
          </div>
        </div>
      </div>

      {/* 3. Task Checklist */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Day {activeDay} 攻坚任务打卡清单</span>
              <span className="text-xs font-normal text-muted-foreground">
                (共 {currentDay.tasks.length} 项任务，完成即得分)
              </span>
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`px-2.5 py-0.5 text-xs rounded-md font-medium transition-colors ${
                categoryFilter === "all"
                  ? "bg-surface-hover text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              全部 ({currentDay.tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("reading")}
              className={`px-2 py-0.5 text-xs rounded-md font-medium transition-colors ${
                categoryFilter === "reading"
                  ? "bg-blue-500/20 text-blue-300 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              速记
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("morning_quiz")}
              className={`px-2 py-0.5 text-xs rounded-md font-medium transition-colors ${
                categoryFilter === "morning_quiz"
                  ? "bg-amber-500/20 text-amber-300 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              刷题
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("afternoon_case")}
              className={`px-2 py-0.5 text-xs rounded-md font-medium transition-colors ${
                categoryFilter === "afternoon_case"
                  ? "bg-purple-500/20 text-purple-300 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              案例
            </button>
          </div>
        </div>

        {/* Task Items */}
        <div className="divide-y divide-border/80">
          {filteredTasks.map((task) => {
            const isDone = Boolean(checklist[task.id]);
            const cfg = categoryConfig[task.category] || categoryConfig.reading;
            const CategoryIcon = cfg.icon;

            return (
              <div
                key={task.id}
                className={`py-3.5 flex items-start justify-between gap-3 transition-colors rounded-lg px-2 ${
                  isDone ? "bg-surface/30 opacity-80" : "hover:bg-surface/50"
                }`}
              >
                {/* Checkbox & Task Title */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={`标记任务 ${task.title}`}
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
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${cfg.badge}`}
                      >
                        <CategoryIcon className="size-3" />
                        {cfg.label}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {task.id}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {task.recommendedMinutes}分钟
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400">
                        +{task.points}分战力
                      </span>
                    </div>

                    <div
                      onClick={() => toggleTask(task.id)}
                      className={`text-xs sm:text-sm font-medium cursor-pointer ${
                        isDone
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </div>
                  </div>
                </div>

                {/* Quick Action Link */}
                <Link
                  href={cfg.href}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface hover:bg-surface-hover text-brand border border-border flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>{cfg.actionText}</span>
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
