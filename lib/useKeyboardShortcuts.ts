"use client";

import { useEffect } from "react";

export interface KeyboardShortcutsOptions {
  enabled?: boolean;
  onSelectOption?: (option: "A" | "B" | "C" | "D") => void;
  onSubmit?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

/**
 * Global Keyboard Shortcut Engine with STRICT Input Focus Protection.
 * Ensures typing in any input, textarea, select, or contentEditable element
 * never triggers quiz selection or navigation.
 */
export function useKeyboardShortcuts({
  enabled = true,
  onSelectOption,
  onSubmit,
  onNext,
  onPrev,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. CRITICAL: Strict input focus isolation
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toUpperCase();
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        // Typing in input/textarea/blank must NEVER trigger quiz shortcuts!
        return;
      }

      // 2. Modifier keys guard (Ctrl, Meta, Alt)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key;

      // 3. Option Selection: 1-4 or A-D
      if (key === "1" || key === "a" || key === "A") {
        e.preventDefault();
        onSelectOption?.("A");
      } else if (key === "2" || key === "b" || key === "B") {
        e.preventDefault();
        onSelectOption?.("B");
      } else if (key === "3" || key === "c" || key === "C") {
        e.preventDefault();
        onSelectOption?.("C");
      } else if (key === "4" || key === "d" || key === "D") {
        e.preventDefault();
        onSelectOption?.("D");
      }
      // 4. Submit Answer: Enter or Space
      else if (key === "Enter" || key === " ") {
        e.preventDefault();
        onSubmit?.();
      }
      // 5. Navigation: ArrowRight or ArrowLeft
      else if (key === "ArrowRight") {
        e.preventDefault();
        onNext?.();
      } else if (key === "ArrowLeft") {
        e.preventDefault();
        onPrev?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onSelectOption, onSubmit, onNext, onPrev]);
}
