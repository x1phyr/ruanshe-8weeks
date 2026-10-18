"use client";

import React, { useState } from "react";
import {
  FileText,
  ListOrdered,
  GitCompare,
  Network,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { FourPages } from "./four-pages";
import { HundredPoints } from "./hundred-points";
import { ConfusionPairs } from "./confusion-pairs";
import { MindMaps } from "./mind-maps";

export function CheatSheetView() {
  const [activeTab, setActiveTab] = useState<
    "four-pages" | "hundred-points" | "confusion-pairs" | "mind-maps"
  >("four-pages");
  const [searchQuery, setSearchQuery] = useState("");

  const TABS = [
    {
      id: "four-pages" as const,
      label: "考前必备四页纸",
      icon: FileText,
      badge: "4 页精粹",
    },
    {
      id: "hundred-points" as const,
      label: "软设知识点100条",
      icon: ListOrdered,
      badge: "100 必背",
    },
    {
      id: "confusion-pairs" as const,
      label: "易混淆知识点对比",
      icon: GitCompare,
      badge: "35 组对比",
    },
    {
      id: "mind-maps" as const,
      label: "8大章节思维导图",
      icon: Network,
      badge: "8 章架构",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-gradient-to-r from-card via-card to-brand/10 rounded-2xl border border-border p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/20 text-brand border border-brand/30">
                考前速查中心
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                CheatSheet & MindMap Hub
              </h1>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              整合自《考前必备四页纸》、《软设知识点100条》、《易混淆知识点》与《思维导图.xmind》，全考点极速检索。
            </p>
          </div>

          {/* Global Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索考点/公式/口诀/架构..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Main Sub-Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pt-2 border-t border-border/80">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-brand text-brand-foreground border-brand shadow-sm font-bold"
                    : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-black/20 text-white" : "bg-card text-muted-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === "four-pages" && <FourPages searchQuery={searchQuery} />}
      {activeTab === "hundred-points" && <HundredPoints searchQuery={searchQuery} />}
      {activeTab === "confusion-pairs" && <ConfusionPairs searchQuery={searchQuery} />}
      {activeTab === "mind-maps" && <MindMaps searchQuery={searchQuery} />}
    </div>
  );
}
