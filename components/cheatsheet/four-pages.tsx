"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
} from "lucide-react";
import cheatsheetData from "@/src/data/cheatsheet.json";

interface FourPagesProps {
  searchQuery?: string;
}

export function FourPages({ searchQuery = "" }: FourPagesProps) {
  const [activeSheet, setActiveSheet] = useState(1);
  const sheets = cheatsheetData.fourPages;

  const currentSheet =
    sheets.find((s) => s.page === activeSheet) || sheets[0];

  const q = searchQuery.trim().toLowerCase();

  const filteredModules = useMemo(() => {
    if (!q) return currentSheet.modules;
    return currentSheet.modules.filter((m) => {
      const matchName = m.name.toLowerCase().includes(q);
      const matchContent = m.content.toLowerCase().includes(q);
      const matchKeyPoints = m.keyPoints.some((kp) =>
        kp.toLowerCase().includes(q)
      );
      return matchName || matchContent || matchKeyPoints;
    });
  }, [currentSheet, q]);

  return (
    <div className="space-y-6">
      {/* 4 Sheets Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {sheets.map((s) => {
          const isSelected = s.page === activeSheet;
          return (
            <button
              key={s.page}
              type="button"
              onClick={() => setActiveSheet(s.page)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? "bg-surface border-brand ring-2 ring-brand/30 shadow-md"
                  : "bg-card hover:bg-surface border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  Sheet {s.page}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-muted-foreground font-mono">
                  {s.modules.length} 模块
                </span>
              </div>
              <div className="text-xs font-semibold text-foreground line-clamp-1">
                {s.title.split(": ")[1] || s.title}
              </div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">
                {s.coreDomain}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Sheet Header Banner */}
      <div className="bg-gradient-to-br from-card via-card to-brand/10 rounded-2xl border border-border p-5 shadow-lg space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/20 text-brand border border-brand/30">
              考前必备四页纸 · Sheet {currentSheet.page}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {currentSheet.coreDomain}
            </span>
          </div>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          {currentSheet.title}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {currentSheet.summary}
        </p>
      </div>

      {/* Modules & Key Points Cards */}
      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <div className="text-center p-8 bg-card border border-border rounded-xl text-xs text-muted-foreground">
            当前 Sheet 未找到匹配关键词 “{searchQuery}” 的模块，请切换其他 Sheet 或清空搜索词。
          </div>
        ) : (
          filteredModules.map((mod, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-5 shadow-md space-y-3.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calculator className="size-4 text-brand" />
                  <span>{mod.name}</span>
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {mod.keyPoints.length} 条核心考点
                </span>
              </div>

              {mod.content && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-surface/40 p-2.5 rounded-lg border border-border/60">
                  {mod.content}
                </p>
              )}

              {/* Dense Key Points List */}
              <div className="space-y-2">
                {mod.keyPoints.map((kp, kIdx) => (
                  <div
                    key={kIdx}
                    className="p-3 rounded-xl bg-surface/60 border border-border text-xs leading-relaxed text-foreground flex items-start gap-2.5 hover:border-brand/40 transition-colors"
                  >
                    <span className="size-4 rounded-full bg-brand/15 text-brand text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {kIdx + 1}
                    </span>
                    <div className="flex-1 font-sans">{kp}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
