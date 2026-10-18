"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Search,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { FlashcardItem } from "./flashcard-item";
import { useTrainerStore } from "@/lib/store";
import flashcardsData from "@/src/data/flashcards.json";

export function FlashcardsView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [masteryFilter, setMasteryFilter] = useState<"ALL" | "UNMASTERED" | "MASTERED">("ALL");
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);

  const masteredFlashcardIds = useTrainerStore((s) => s.masteredFlashcardIds);
  const toggleMasteredFlashcard = useTrainerStore((s) => s.toggleMasteredFlashcard);

  const masteredSet = useMemo(
    () => new Set(masteredFlashcardIds),
    [masteredFlashcardIds]
  );

  const rawCards = flashcardsData;

  const domains = useMemo(() => {
    return ["ALL", ...Array.from(new Set(rawCards.map((f) => f.domain)))];
  }, [rawCards]);

  // Filter cards by domain, search, and mastery
  const filteredCards = useMemo(() => {
    let list = rawCards;

    // 1. Domain
    if (selectedDomain !== "ALL") {
      list = list.filter((f) => f.domain === selectedDomain);
    }

    // 2. Search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((f) => {
        return (
          f.title?.toLowerCase().includes(q) ||
          f.explanation?.toLowerCase().includes(q) ||
          f.mnemonic?.toLowerCase().includes(q) ||
          (f.formula && f.formula.toLowerCase().includes(q)) ||
          f.trapAlert?.toLowerCase().includes(q) ||
          f.domain?.toLowerCase().includes(q) ||
          f.id?.toLowerCase().includes(q)
        );
      });
    }

    // 3. Mastery filter
    if (masteryFilter === "MASTERED") {
      list = list.filter((f) => masteredSet.has(f.id));
    } else if (masteryFilter === "UNMASTERED") {
      list = list.filter((f) => !masteredSet.has(f.id));
    }

    // 4. Shuffle if enabled
    if (isShuffled && shuffledOrder) {
      const orderMap = new Map(shuffledOrder.map((id, index) => [id, index]));
      list = [...list].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        return orderA - orderB;
      });
    }

    return list;
  }, [
    rawCards,
    selectedDomain,
    searchQuery,
    masteryFilter,
    isShuffled,
    shuffledOrder,
    masteredSet,
  ]);

  // Index clamp
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [filteredCards.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
    setIsFlipped(false);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : filteredCards.length - 1
    );
    setIsFlipped(false);
  }, [filteredCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard navigation with strict input focus protection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  // Shuffle toggle
  const handleToggleShuffle = () => {
    if (!isShuffled) {
      const shuffled = [...rawCards.map((f) => f.id)].sort(
        () => Math.random() - 0.5
      );
      setShuffledOrder(shuffled);
      setIsShuffled(true);
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      setIsShuffled(false);
      setShuffledOrder(null);
    }
  };

  const currentCard = filteredCards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/20 text-brand border border-brand/30">
                3D 速记卡库
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                3D Flashcards Deck
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              共收录 {rawCards.length} 张核心考点与秒杀公式卡片，支持 3D 翻转、空格翻牌与掌握过滤。
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索卡片/公式/口诀..."
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

        {/* Domain Tabs */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 max-w-full border-t border-border/80 pt-3">
          {domains.map((d) => {
            const isSelected = selectedDomain === d;
            const count =
              d === "ALL"
                ? rawCards.length
                : rawCards.filter((f) => f.domain === d).length;

            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDomain(d);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-brand text-brand-foreground border-brand font-semibold shadow-xs"
                    : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {d === "ALL" ? "全部领域" : d}
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Action Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setMasteryFilter(masteryFilter === "UNMASTERED" ? "ALL" : "UNMASTERED")
              }
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                masteryFilter === "UNMASTERED"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-surface text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              只看未掌握
            </button>
            <button
              type="button"
              onClick={handleToggleShuffle}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                isShuffled
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-surface text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              <Shuffle className="size-3.5" />
              <span>{isShuffled ? "随机排序中" : "随机洗牌"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            <span>已掌握:</span>
            <strong className="text-emerald-400">{masteredFlashcardIds.length}</strong>
            <span>/ {rawCards.length}</span>
          </div>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      {filteredCards.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-2xl text-xs text-muted-foreground">
          未找到匹配筛选条件的速记卡，请调整分类或搜索关键词。
        </div>
      ) : (
        <div className="space-y-4">
          <FlashcardItem
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            isMastered={masteredSet.has(currentCard.id)}
            onToggleMastered={toggleMasteredFlashcard}
            currentIndex={currentIndex}
            totalCount={filteredCards.length}
          />

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between bg-card border border-border p-3 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-border flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="size-4" />
              <span>上一张 (←)</span>
            </button>

            <button
              type="button"
              onClick={handleFlip}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 transition-colors shadow-xs"
            >
              {isFlipped ? "翻回正面 (Space)" : "点击翻转背面 (Space)"}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-border flex items-center gap-1.5 transition-colors"
            >
              <span>下一张 (→)</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
