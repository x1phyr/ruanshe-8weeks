"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Surface } from "@/components/ui-bits";
import {
  CURRICULUM_DAY_COUNT,
  examOverlap,
  studyDays,
} from "@/lib/calendar";
import { examConfig } from "@/lib/config";
import { examCountdown, todayISO } from "@/lib/dates";
import { isCompleted } from "@/lib/progress";
import { resolvedStartDate, useTrainerStore } from "@/lib/store";

export function StartDateControl() {
  const startDateRaw = useTrainerStore((s) => s.startDate);
  const setStartDate = useTrainerStore((s) => s.setStartDate);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const progress = useTrainerStore((s) => s.progress);
  const startDate = resolvedStartDate(startDateRaw);
  const today = todayISO();
  const overlap = examOverlap(startDate);
  const examDaysLeft = examCountdown(todayISO(simulateDate));
  const remainingLessons = studyDays.filter(
    (day) => !isCompleted(progress, day.id),
  ).length;

  return (
    <Surface className="p-4">
      <div className="label-caps">学习开始日</div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        第 1 周第 1 日排在这一天，后面每一日按顺序顺延。改开始日只平移课表，
        不会清空按「第 N 周 / 第 M 日」保存的进度和错题。
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="grid min-w-[12rem] gap-1.5">
          <Label htmlFor="start-date">开营日期</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="font-mono"
          />
        </div>
        <Button variant="outline" onClick={() => setStartDate(today)}>
          用今天
        </Button>
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        课表 {overlap.start} → {overlap.end} · 共 {CURRICULUM_DAY_COUNT} 日 · 考试{" "}
        {examConfig.examDate}
      </p>
      {overlap.overrunsExam ? (
        <p className="mt-2 text-xs leading-5 text-destructive">
          课表最后一日在考试{overlap.endsOnExam ? "当天" : "之后"}。距考试还剩{" "}
          {examDaysLeft > 0 ? examDaysLeft : 0} 天，课程还剩 {remainingLessons}{" "}
          日。考试日仍以准考证 / examDate 为准，不会自动改期。
        </p>
      ) : null}
    </Surface>
  );
}
