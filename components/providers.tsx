"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTrainerStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      void useTrainerStore.persist?.rehydrate?.();
    } catch {
      // localStorage unavailable — in-memory state still works
    }
  }, []);

  return <TooltipProvider>{children}</TooltipProvider>;
}
