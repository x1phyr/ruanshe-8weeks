"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTrainerStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const setHydrated = useTrainerStore((s) => s.setHydrated);

  useEffect(() => {
    if (useTrainerStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useTrainerStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, [setHydrated]);

  return <TooltipProvider delay={200}>{children}</TooltipProvider>;
}
