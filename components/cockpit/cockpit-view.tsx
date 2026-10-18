"use client";

import React, { useMemo } from "react";
import { DaysAdjuster } from "./days-adjuster";
import { ScoreRadar } from "./score-radar";
import { SprintView } from "./sprint-view";
import { RegularView } from "./regular-view";
import {
  useTrainerStore,
  getPrepMode,
  computeRadarMetrics,
} from "@/lib/store";
import sprintPlanData from "@/src/data/sprintPlan.json";
import studyPlansData from "@/src/data/studyPlans.json";

export function CockpitView() {
  const remainingDays = useTrainerStore((s) => s.remainingDays);
  const checklist = useTrainerStore((s) => s.checklist);
  const answers = useTrainerStore((s) => s.answers);
  const caseAnswers = useTrainerStore((s) => s.caseAnswers);
  const mode = getPrepMode(remainingDays);
  const isSprint = mode === "sprint";

  // Calculate total tasks depending on mode
  const totalTasks = useMemo(() => {
    if (isSprint) {
      return sprintPlanData.reduce((acc, d) => acc + d.tasks.length, 0);
    }
    return studyPlansData.regular8Weeks.reduce(
      (acc, w) => acc + w.dailyTasks.length,
      0
    );
  }, [isSprint]);

  // Questions answered stats
  const answeredQuestionsCount = answers.length;
  const correctQuestionsCount = answers.filter((a) => a.correct).length;

  // Case study evaluation stats
  const caseAnswerCount = useMemo(() => {
    let count = 0;
    Object.values(caseAnswers).forEach((caseMap) => {
      count += Object.keys(caseMap).length;
    });
    return count;
  }, [caseAnswers]);

  // Calculate Radar Metrics
  const radarMetrics = useMemo(() => {
    return computeRadarMetrics({
      checklist,
      totalTasks,
      answeredQuestionsCount,
      correctQuestionsCount,
      caseScoresTotal: Math.min(60, caseAnswerCount * 3),
      casePossibleTotal: 60,
    });
  }, [
    checklist,
    totalTasks,
    answeredQuestionsCount,
    correctQuestionsCount,
    caseAnswerCount,
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Dynamic Prep Adjuster (1..56 days with auto <10d switch) */}
      <DaysAdjuster />

      {/* 2. Passing Probability Radar */}
      <ScoreRadar metrics={radarMetrics} mode={mode} />

      {/* 3. Task Workflow: Sprint Day Stream (< 10d) vs Regular 8-Week Stream (>= 10d) */}
      {isSprint ? <SprintView /> : <RegularView />}
    </div>
  );
}
