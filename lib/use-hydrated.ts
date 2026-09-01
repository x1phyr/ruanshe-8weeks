"use client";

import { useEffect, useState } from "react";
import { useTrainerStore } from "@/lib/store";

let rehydratePromise: Promise<void> | null = null;

function ensureRehydrated() {
  if (!rehydratePromise) {
    rehydratePromise = new Promise((resolve) => {
      const finish = () => resolve();
      try {
        const persist = useTrainerStore.persist;
        if (!persist) {
          finish();
          return;
        }
        const result = persist.rehydrate();
        if (result && typeof result.then === "function") {
          void result.then(finish, finish);
        } else {
          finish();
        }
      } catch {
        finish();
      }
      window.setTimeout(finish, 100);
    });
  }
  return rehydratePromise;
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    void ensureRehydrated().then(() => {
      if (alive) setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  return hydrated;
}
