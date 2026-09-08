"use client";

import { useEffect } from "react";
import { Focus, X } from "lucide-react";
import { useTrainerStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Sync persisted focusMode onto document.body for CSS chrome hiding. */
export function FocusModeSync() {
  const focusMode = useTrainerStore((s) => s.focusMode);

  useEffect(() => {
    document.body.classList.toggle("focus-mode", focusMode);
    return () => {
      document.body.classList.remove("focus-mode");
    };
  }, [focusMode]);

  return null;
}

/** Compact 「专注」 toggle for learn-session / quiz-run headers. */
export function FocusModeToggle({ className }: { className?: string }) {
  const focusMode = useTrainerStore((s) => s.focusMode);
  const setFocusMode = useTrainerStore((s) => s.setFocusMode);

  return (
    <button
      type="button"
      onClick={() => setFocusMode(!focusMode)}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-sm border px-2 font-mono text-[11px] transition-colors",
        focusMode
          ? "border-brand/50 bg-brand/10 text-brand"
          : "border-border text-muted-foreground hover:text-foreground",
        className,
      )}
      aria-pressed={focusMode}
      title={focusMode ? "关闭专注模式" : "开启专注：隐藏侧栏与底栏"}
    >
      <Focus className="size-3" />
      专注
    </button>
  );
}

/**
 * Always-visible exit when focus mode is on (fixed corner).
 * Works on both AppShell pages and learn FocusFrame.
 */
export function FocusModeExitButton() {
  const focusMode = useTrainerStore((s) => s.focusMode);
  const setFocusMode = useTrainerStore((s) => s.setFocusMode);

  if (!focusMode) return null;

  return (
    <button
      type="button"
      onClick={() => setFocusMode(false)}
      className="print-hidden fixed bottom-4 right-4 z-[60] inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-background/95 px-3 text-sm shadow-lg backdrop-blur hover:bg-surface-hover md:bottom-6 md:right-6"
      aria-label="退出专注"
      title="退出专注模式，恢复侧栏与底栏"
    >
      <X className="size-4" />
      退出专注
    </button>
  );
}
