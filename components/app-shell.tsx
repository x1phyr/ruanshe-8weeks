"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarRange,
  Crosshair,
  Dumbbell,
  FlaskConical,
} from "lucide-react";
import { SimulateDialog } from "@/components/simulate-dialog";
import { examConfig, APP_NAME } from "@/lib/config";
import { examCountdown, pad2, todayISO } from "@/lib/dates";
import { useTrainerStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "今日", icon: Crosshair },
  { href: "/plan", label: "计划", icon: CalendarRange },
  { href: "/practice", label: "练习", icon: Dumbbell },
  { href: "/mistakes", label: "错题", icon: BookOpen },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const today = todayISO(simulateDate);
  const daysLeft = examCountdown(today);

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="app-shell-aside print-hidden sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <span className="flex size-6 items-center justify-center rounded-sm border border-border bg-surface font-mono text-[10px] text-brand">
            软
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium tracking-tight">{APP_NAME}</div>
            <div className="label-caps">Soft Designer</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-2" aria-label="主导航">
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
                  "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-surface-hover text-foreground"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="label-caps">距考试</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="mono-num text-xl text-foreground">
              {daysLeft > 0 ? pad2(daysLeft) : "00"}
            </span>
            <span className="text-xs text-muted-foreground">天</span>
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {examConfig.examDate}
          </div>
          <SimulateDialog hotkeyOpen>
            <div className="mt-3 flex w-full items-center gap-1.5 text-left text-[12px] text-muted-foreground hover:text-foreground">
              <FlaskConical className="size-3.5" />
              {simulateDate ? `调试 · ${simulateDate}` : "调试设置"}
            </div>
          </SimulateDialog>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="app-shell-mobile-top print-hidden sticky top-0 z-40 flex h-9 items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur md:hidden"
          aria-label="考试倒计时"
        >
          <div className="flex items-baseline gap-1.5 text-[13px]">
            <span className="text-muted-foreground">距考</span>
            <span className="mono-num text-foreground">
              {daysLeft > 0 ? pad2(daysLeft) : "00"}
            </span>
            <span className="text-muted-foreground">天</span>
          </div>
          {simulateDate ? (
            <span className="inline-flex h-5 max-w-[55%] items-center truncate rounded-sm border border-brand/40 bg-brand/10 px-1.5 font-mono text-[10px] tracking-wide text-brand">
              模拟 {simulateDate}
            </span>
          ) : null}
        </header>
        <main className="app-shell-main flex-1 pb-16 md:pb-0 print:pb-0">{children}</main>
        <nav
          className="app-shell-bottom-nav print-hidden fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-border bg-background/95 backdrop-blur md:hidden"
          aria-label="主导航"
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
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
