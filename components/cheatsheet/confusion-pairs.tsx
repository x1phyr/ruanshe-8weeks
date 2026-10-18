"use client";

import React, { useState, useMemo } from "react";
import {
  GitCompare,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import confusionPairsData from "@/src/data/confusionPairs.json";

interface ConfusionPairsProps {
  searchQuery?: string;
}

export function ConfusionPairs({ searchQuery = "" }: ConfusionPairsProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const pairs = confusionPairsData;

  const domains = useMemo(() => {
    return ["ALL", ...Array.from(new Set(pairs.map((p) => p.domain)))];
  }, [pairs]);

  const filteredPairs = useMemo(() => {
    let list = pairs;

    if (selectedDomain !== "ALL") {
      list = list.filter((p) => p.domain === selectedDomain);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.conceptA.name.toLowerCase().includes(q) ||
          p.conceptB.name.toLowerCase().includes(q) ||
          p.distinction.toLowerCase().includes(q) ||
          p.examTrap.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [pairs, selectedDomain, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Domain filter bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-md">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80 text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <GitCompare className="size-4 text-brand" />
            <span>软考易混淆概念 35 组对比库</span>
          </span>
          <span className="text-muted-foreground font-mono">
            共 {pairs.length} 组高频辨析
          </span>
        </div>

        <div className="flex overflow-x-auto gap-1.5 pb-1 max-w-full">
          {domains.map((d) => {
            const isSelected = selectedDomain === d;
            const count =
              d === "ALL"
                ? pairs.length
                : pairs.filter((p) => p.domain === d).length;

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
                {d === "ALL" ? "全部辨析" : d}
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Pairs Cards */}
      <div className="space-y-5">
        {filteredPairs.length === 0 ? (
          <div className="text-center p-8 bg-card border border-border rounded-xl text-xs text-muted-foreground">
            未找到匹配的易混淆概念对比，请调整搜索词或分类。
          </div>
        ) : (
          filteredPairs.map((pair) => (
            <div
              key={pair.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-brand/40 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-brand">
                    辨析 #{pair.id}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {pair.title}
                  </h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface text-muted-foreground border border-border">
                  {pair.domain}
                </span>
              </div>

              {/* Side-by-Side Concept A vs Concept B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Concept A */}
                <div className="bg-surface/50 rounded-xl p-3.5 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <span className="size-4 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">
                      A
                    </span>
                    <span>{pair.conceptA.name}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground/90 pl-1">
                    {pair.conceptA.traits.map((trait, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concept B */}
                <div className="bg-surface/50 rounded-xl p-3.5 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <span className="size-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">
                      B
                    </span>
                    <span>{pair.conceptB.name}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground/90 pl-1">
                    {pair.conceptB.traits.map((trait, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-400 mt-1">•</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Distinction (核心鉴别法则) */}
              <div className="bg-brand/10 border border-brand/20 p-3 rounded-xl text-xs text-brand leading-relaxed flex items-start gap-2">
                <Lightbulb className="size-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">核心秒杀辨析准则：</strong>
                  <span>{pair.distinction}</span>
                </div>
              </div>

              {/* Exam Trap (考场避坑指南) */}
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-200">⚠️ 考场避坑陷阱：</strong>
                  <span>{pair.examTrap}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
