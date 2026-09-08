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
import { todayISO } from "@/lib/dates";
import { useTrainerStore } from "@/lib/store";

export function SimulateDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const setSimulateDate = useTrainerStore((s) => s.setSimulateDate);
  const unlockAll = useTrainerStore((s) => s.unlockAll);
  const setUnlockAll = useTrainerStore((s) => s.setUnlockAll);
  const resetAll = useTrainerStore((s) => s.resetAll);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(simulateDate ?? todayISO());

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValue(simulateDate ?? todayISO());
          setOpen(true);
        }}
        className="contents"
      >
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle>调试设置</DialogTitle>
            <DialogDescription>
              默认使用系统日期。覆盖后，仪表盘与待复习都按该日计算。考试日从配置项{" "}
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
            </p>
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
                onClick={() => {
                  setSimulateDate(null);
                  setOpen(false);
                }}
              >
                使用系统日期
              </Button>
              <Button
                onClick={() => {
                  setSimulateDate(value || null);
                  setOpen(false);
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
