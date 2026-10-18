"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Bookmark,
  Zap,
  Star,
  Search,
  Filter,
} from "lucide-react";
import { useTrainerStore } from "@/lib/store";
import knowledgePointsData from "@/src/data/knowledgePoints.json";

interface HundredPointsProps {
  searchQuery?: string;
}

export function HundredPoints({ searchQuery = "" }: HundredPointsProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [onlyUnmastered, setOnlyUnmastered] = useState<boolean>(false);

  const masteredPointIds = useTrainerStore((s) => s.masteredPointIds);
  const toggleMasteredPoint = useTrainerStore((s) => s.toggleMasteredPoint);

  const masteredSet = useMemo(() => new Set(masteredPointIds), [masteredPointIds]);

  const points = knowledgePointsData;

  const domains = useMemo(() => {
    return ["ALL", ...Array.from(new Set(points.map((p) => p.domain)))];
  }, [points]);

  const filteredPoints = useMemo(() => {
    let list = points;

    if (selectedDomain !== "ALL") {
      list = list.filter((p) => p.domain === selectedDomain);
    }

    if (onlyUnmastered) {
      list = list.filter((p) => !masteredSet.has(p.id));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.memoryTip.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          String(p.id) === q
        );
      });
    }

    return list;
  }, [points, selectedDomain, onlyUnmastered, searchQuery, masteredSet]);

  return (
    <div className="space-y-5">
      {/* Filters and Stats Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Domain tabs */}
          <div className="flex overflow-x-auto gap-1.5 pb-1 max-w-full">
            {domains.map((d) => {
              const isSelected = selectedDomain === d;
              const count =
                d === "ALL"
                  ? points.length
                  : points.filter((p) => p.domain === d).length;

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
                  {d === "ALL" ? "全部知识点" : d}
                  <span className="ml-1 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Mastered Filter & Stat Badge */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyUnmastered(!onlyUnmastered)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                onlyUnmastered
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-surface hover:bg-surface-hover text-muted-foreground border-border"
              }`}
            >
              <span>只看未掌握</span>
            </button>
            <div className="px-3 py-1 text-xs font-mono rounded-xl bg-surface border border-border text-muted-foreground">
              已背诵: <strong className="text-emerald-400">{masteredPointIds.length}</strong> / 100 条
            </div>
          </div>
        </div>
      </div>

      {/* Points Card List */}
      <div className="space-y-4">
        {filteredPoints.length === 0 ? (
          <div className="text-center p-8 bg-card border border-border rounded-xl text-xs text-muted-foreground">
            未找到符合条件的知识点，请尝试调整筛选条件。
          </div>
        ) : (
          filteredPoints.map((pt) => {
            const isMastered = masteredSet.has(pt.id);

            return (
              <div
                key={pt.id}
                className={`rounded-2xl border p-5 shadow-sm transition-all ${
                  isMastered
                    ? "bg-card/70 border-emerald-500/30"
                    : "bg-card border-border hover:border-brand/40"
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-brand">
                      #{pt.id}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {pt.title}
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface text-muted-foreground border border-border">
                      {pt.domain}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Importance */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: pt.importance || 5 }).map((_, i) => (
                        <Star key={i} className="size-3 fill-amber-400" />
                      ))}
                    </div>

                    {/* Mastered Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleMasteredPoint(pt.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        isMastered
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                          : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border"
                      }`}
                    >
                      <CheckCircle2
                        className={`size-3.5 ${
                          isMastered ? "text-emerald-400" : "text-muted-foreground"
                        }`}
                      />
                      <span>{isMastered ? "已背诵" : "标记掌握"}</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="my-3 text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed font-sans bg-surface/30 p-3 rounded-xl border border-border/60">
                  {pt.content}
                </div>

                {/* Memory Tip */}
                {pt.memoryTip && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                    <Zap className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt.memoryTip}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
