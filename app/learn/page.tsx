"use client";

import { LearnSession } from "@/components/learn/learn-session";
import { resolveFocusDay } from "@/lib/progress";
import { resolvedStartDate, useTrainerStore } from "@/lib/store";

export default function LearnCurrentPage() {
  const progress = useTrainerStore((s) => s.progress);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const startDate = useTrainerStore((s) => s.startDate);
  return (
    <LearnSession
      day={resolveFocusDay(
        progress,
        simulateDate,
        resolvedStartDate(startDate),
      )}
    />
  );
}
