"use client";

import { LearnSession } from "@/components/learn/learn-session";
import { firstDay } from "@/lib/calendar";
import { resolveFocusDay } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";

export default function LearnCurrentPage() {
  const hydrated = useTrainerStore((s) => s.hydrated);
  const progress = useTrainerStore((s) => s.progress);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const day = hydrated ? resolveFocusDay(progress, simulateDate) : firstDay;
  return <LearnSession day={day} />;
}
