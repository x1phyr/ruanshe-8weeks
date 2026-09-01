"use client";

import { LearnSession } from "@/components/learn/learn-session";
import { resolveFocusDay } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";

export default function LearnCurrentPage() {
  const progress = useTrainerStore((s) => s.progress);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  return <LearnSession day={resolveFocusDay(progress, simulateDate)} />;
}
