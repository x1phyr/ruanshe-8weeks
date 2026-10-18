"use client";

import React, { useState, useMemo } from "react";
import {
  Network,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import mindMapsData from "@/src/data/mindMaps.json";

interface MindMapsProps {
  searchQuery?: string;
}

interface TreeNode {
  id: string;
  label: string;
  level: number;
  mastered?: boolean;
  children?: TreeNode[];
}

export function MindMaps({ searchQuery = "" }: MindMapsProps) {
  const [activeChapterId, setActiveChapterId] = useState<string>("CH-01");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const chapters = mindMapsData;
  const currentChapter =
    chapters.find((c) => c.chapterId === activeChapterId) || chapters[0];

  const q = searchQuery.trim().toLowerCase();

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const expandAll = () => {
    setCollapsedNodes({});
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    const walk = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          allCollapsed[n.id] = true;
          walk(n.children);
        }
      });
    };
    walk(currentChapter.nodes as TreeNode[]);
    setCollapsedNodes(allCollapsed);
  };

  // Node component
  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isCollapsed = Boolean(collapsedNodes[node.id]);
    const matchesSearch = q ? node.label.toLowerCase().includes(q) : false;

    return (
      <div key={node.id} className="relative">
        <div
          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs transition-colors ${
            matchesSearch
              ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold"
              : "hover:bg-surface/60 text-foreground"
          }`}
          style={{ paddingLeft: `${Math.max(10, depth * 20)}px` }}
        >
          {/* Collapse/Expand Toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleNode(node.id)}
              className="size-4 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          ) : (
            <span className="size-4 flex items-center justify-center text-muted-foreground/40 shrink-0">
              •
            </span>
          )}

          {/* Level Badge */}
          <span className="text-[10px] font-mono px-1 rounded bg-surface border border-border text-muted-foreground shrink-0">
            L{node.level}
          </span>

          {/* Node Label */}
          <span className="truncate">{node.label}</span>

          {hasChildren && (
            <span className="text-[10px] font-mono text-muted-foreground ml-1">
              ({node.children!.length})
            </span>
          )}
        </div>

        {/* Recursive Children */}
        {hasChildren && !isCollapsed && (
          <div className="border-l border-border/50 ml-4 pl-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* 8 Chapters Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {chapters.map((ch) => {
          const isSelected = ch.chapterId === activeChapterId;
          return (
            <button
              key={ch.chapterId}
              type="button"
              onClick={() => {
                setActiveChapterId(ch.chapterId);
                setCollapsedNodes({});
              }}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
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
                  第 {ch.chapterNumber} 章
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {ch.chapterId}
                </span>
              </div>
              <div className="text-xs font-semibold text-foreground line-clamp-1">
                {ch.chapterTitle.replace(/^第\d+章\s*/, "")}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Chapter Header & Tree View */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-brand">
                {currentChapter.chapterId}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {currentChapter.chapterTitle}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              思维导图知识树：全章核心考点层级脉络梳理
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1 text-xs rounded-lg bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border flex items-center gap-1 transition-colors"
            >
              <Maximize2 className="size-3" />
              <span>全部展开</span>
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1 text-xs rounded-lg bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border flex items-center gap-1 transition-colors"
            >
              <Minimize2 className="size-3" />
              <span>全部折叠</span>
            </button>
          </div>
        </div>

        {/* Tree Container */}
        <div className="bg-surface/30 rounded-xl p-3 border border-border/80 divide-y divide-border/40">
          {(currentChapter.nodes as TreeNode[]).map((node) => (
            <div key={node.id} className="py-2">
              {renderTreeNode(node, 0)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
