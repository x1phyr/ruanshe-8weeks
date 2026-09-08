"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { examConfig } from "@/lib/config";
import { addDaysISO, todayISO } from "@/lib/dates";
import { useTrainerStore } from "@/lib/store";

function normalizeISO(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

export function SimulateDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const setSimulateDate = useTrainerStore((s) => s.setSimulateDate);
  const startDate = useTrainerStore((s) => s.startDate);
  const unlockAll = useTrainerStore((s) => s.unlockAll);
  const setUnlockAll = useTrainerStore((s) => s.setUnlockAll);
  const resetAll = useTrainerStore((s) => s.resetAll);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(simulateDate ?? todayISO());
  const previewDate = normalizeISO(value) ?? value;
  const beforeStart =
    Boolean(previewDate) &&
    /^\d{4}-\d{2}-\d{2}$/.test(previewDate) &&
    previewDate < startDate;

  function openDialog() {
    setValue(simulateDate ?? todayISO());
    setOpen(true);
  }

  function applyDate(next: string | null) {
    if (next === null) {
      setSimulateDate(null);
      setOpen(false);
      return;
    }
    const iso = normalizeISO(next);
    if (!iso) return;
    setSimulateDate(iso);
    setOpen(false);
  }

  return (
    <>
      <button type="button" onClick={openDialog} className="contents">
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle>调试设置</DialogTitle>
            <DialogDescription>
              默认使用系统本地日期。覆盖后，仪表盘与待复习都按该日计算。模拟日与开课日
              （{startDate}）独立：模拟早于开课日时计划处于「未开课」。考试日从配置项{" "}
              <span className="font-mono text-foreground">examDate</span>{" "}
              读取（当前{" "}
              <span className="mono-num text-foreground">{examConfig.examDate}</span>
              ）。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="sim-date">模拟日期</Label>
              <Input
                id="sim-date"
                type="date"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setValue(startDate)}
                >
                  开课日
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setValue(addDaysISO(examConfig.examDate, -1))}
                >
                  考试前一天
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setValue(todayISO());
                    applyDate(null);
                  }}
                >
                  清空模拟
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              系统今日：<span className="mono-num">{todayISO()}</span>
              {simulateDate ? (
                <>
                  {" "}
                  · 当前覆盖：
                  <span className="mono-num"> {simulateDate}</span>
                </>
              ) : (
                " · 未覆盖"
              )}
              {" · 开课日："}
              <span className="mono-num">{startDate}</span>
            </p>
            {beforeStart ? (
              <p className="rounded-md border border-border bg-background/60 px-2.5 py-2 text-xs text-amber-400/90">
                提示：所选模拟日早于开课日 → 未开课（仪表盘 phase=not-started）。
              </p>
            ) : null}
            <div className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
              <div className="min-w-0 space-y-1">
                <Label htmlFor="unlock-all" className="text-sm font-medium">
                  全解锁（调试）
                </Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  打开后可跳关浏览全部学习日；进度不自动标完成。重置进度不会关闭本开关。
                </p>
              </div>
              <Switch
                id="unlock-all"
                checked={unlockAll}
                onCheckedChange={setUnlockAll}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  confirm(
                    "清空本地进度、错题与作答记录？（保留全解锁与模拟日期设置）",
                  )
                ) {
                  resetAll();
                }
              }}
            >
              重置进度
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => applyDate(null)}
              >
                使用系统日期
              </Button>
              <Button
                onClick={() => {
                  const iso = normalizeISO(value);
                  if (!iso) return;
                  applyDate(iso);
                }}
              >
                应用
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
