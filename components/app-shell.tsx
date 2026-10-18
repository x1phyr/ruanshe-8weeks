"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  FileText,
  Zap,
  Dumbbell,
  BookOpen,
  FileCode2,
  Flame,
  CalendarCheck,
  FlaskConical,
} from "lucide-react";
import { SimulateDialog } from "@/components/simulate-dialog";
import { examConfig, APP_NAME } from "@/lib/config";
import { pad2 } from "@/lib/dates";
import { useTrainerStore, getPrepMode } from "@/lib/store";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "备考驾驶舱", icon: Gauge },
  { href: "/cheatsheet", label: "考前速查", icon: FileText },
  { href: "/flashcards", label: "速记卡", icon: Zap },
  { href: "/practice", label: "上午刷题", icon: Dumbbell },
  { href: "/mistakes", label: "错题本", icon: BookOpen },
  { href: "/cases", label: "下午案例", icon: FileCode2 },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const remainingDays = useTrainerStore((s) => s.remainingDays);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const mistakeCount = useTrainerStore((s) => s.mistakeQuestionIds.length);
  const mode = getPrepMode(remainingDays);
  const isSprint = mode === "sprint";

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="app-shell-aside print-hidden sticky top-0 hidden h-dvh w-[230px] shrink-0 flex-col border-r border-border bg-background md:flex">
        {/* Brand header */}
        <div className="flex h-14 items-center justify-between border-b border-border/80 px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg border border-border bg-surface font-mono text-[11px] font-bold text-brand shadow-sm">
              软
            </span>
            <div className="leading-tight">
              <div className="text-[13px] font-bold tracking-tight text-foreground">
                {APP_NAME}
              </div>
              <div className="label-caps text-[10px] text-muted-foreground">
                8-Week & Crash Sprint
              </div>
            </div>
          </div>
        </div>

        {/* Mode & Countdown Banner */}
        <div className="p-3 border-b border-border/80 bg-surface/40">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs transition-colors",
                isSprint
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              )}
            >
              {isSprint ? (
                <>
                  <Flame className="size-3 text-rose-400 animate-pulse" />
                  极限冲刺模式
                </>
              ) : (
                <>
                  <CalendarCheck className="size-3 text-emerald-400" />
                  常规8周计划
                </>
              )}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="mono-num text-lg font-bold text-foreground">
                {pad2(remainingDays)}
              </span>
              <span className="text-[11px] text-muted-foreground">天</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-2.5" aria-label="主导航">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center justify-between rounded-lg px-2.5 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-brand/15 text-brand font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </div>
                {item.href === "/mistakes" && mistakeCount > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                    {mistakeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & simulation dialog */}
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between text-[11px]">
            <span>统考目标</span>
            <span className="font-mono text-foreground">{examConfig.examDate}</span>
          </div>
          <SimulateDialog hotkeyOpen>
            <div className="mt-2.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer">
              <FlaskConical className="size-3.5" />
              <span>{simulateDate ? `模拟 · ${simulateDate}` : "考试日期模拟"}</span>
            </div>
          </SimulateDialog>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header
          className="app-shell-mobile-top print-hidden sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-background/95 px-3.5 backdrop-blur md:hidden"
          aria-label="顶部状态"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-sm border border-border bg-surface font-mono text-[10px] font-bold text-brand">
              软
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                isSprint
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              )}
            >
              {isSprint ? (
                <>
                  <Flame className="size-2.5 text-rose-400" />
                  极限冲刺
                </>
              ) : (
                <>
                  <CalendarCheck className="size-2.5 text-emerald-400" />
                  常规周计划
                </>
              )}
            </span>
          </div>

          <div className="flex items-baseline gap-1 text-[12px]">
            <span className="text-muted-foreground">距考</span>
            <span className="mono-num font-bold text-foreground">
              {pad2(remainingDays)}
            </span>
            <span className="text-muted-foreground">天</span>
          </div>
        </header>

        {/* Content Body */}
        <main className="app-shell-main flex-1 pb-16 md:pb-6 print:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          className="app-shell-bottom-nav print-hidden fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-border bg-background/95 backdrop-blur md:hidden"
          aria-label="移动端主导航"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "text-brand font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="truncate max-w-[52px]">{item.label}</span>
                {item.href === "/mistakes" && mistakeCount > 0 && (
                  <span className="absolute top-1 right-2 size-2 rounded-full bg-rose-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
