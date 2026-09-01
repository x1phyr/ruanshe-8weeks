"use client";

import { LearnSession } from "@/components/learn/learn-session";
import { firstDay } from "@/lib/calendar";
import { resolveFocusDay } from "@/lib/progress";
import { useTrainerStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function LearnCurrentPage() {
  const hydrated = useHydrated();
  const progress = useTrainerStore((s) => s.progress);
  const simulateDate = useTrainerStore((s) => s.simulateDate);
  const day = hydrated ? resolveFocusDay(progress, simulateDate) : firstDay;
  return <LearnSession day={day} />;
}
