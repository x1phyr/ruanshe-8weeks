"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui-bits";
import { pad2 } from "@/lib/dates";
import type { StudyDay } from "@/lib/types";

function formatRemain(seconds: number) {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

export function PaperTimer({ day }: { day: StudyDay }) {
  const total = day.durationMin * 60;
  const [remain, setRemain] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemain((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <Surface className="p-5">
      <div className="label-caps">
        {day.paperSlot === "morning" ? "MORNING PAPER" : "AFTERNOON PAPER"} ·{" "}
        {day.durationMin} MIN
      </div>
      <div className="mt-3 font-mono text-4xl tracking-widest">{formatRemain(remain)}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        完整真题卷尚未接入。先按考试时长走一遍计时，保持 150
        分钟的体感。可在本步结束后直接收尾完成本日。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => setRunning((v) => !v)}>
          {running ? "暂停" : remain === total ? "开始计时" : "继续"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false);
            setRemain(total);
          }}
        >
          重置
        </Button>
      </div>
    </Surface>
  );
}
