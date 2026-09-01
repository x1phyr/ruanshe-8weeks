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
  const hydrated = useTrainerStore((s) => s.hydrated);
  const today = hydrated ? todayISO(simulateDate) : todayISO();
  const daysLeft = examCountdown(today);

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <span className="flex size-6 items-center justify-center rounded-sm border border-border bg-surface font-mono text-[10px] text-brand">
            软
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium tracking-tight">{APP_NAME}</div>
            <div className="label-caps">Soft Designer</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                  active
                    ? "bg-surface-hover text-foreground"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
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
          <SimulateDialog>
            <div className="mt-3 flex w-full items-center gap-1.5 text-left text-[12px] text-muted-foreground hover:text-foreground">
              <FlaskConical className="size-3.5" />
              {simulateDate ? `模拟 ${simulateDate}` : "模拟今日"}
            </div>
          </SimulateDialog>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 pb-16 md:pb-0">{children}</div>
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-border bg-background/95 backdrop-blur md:hidden">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
