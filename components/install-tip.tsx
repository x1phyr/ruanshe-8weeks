"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui-bits";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Optional tip when the browser fires beforeinstallprompt.
 * Hidden after install / dismiss / if the event never fires (e.g. already installed).
 */
export function InstallTip() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setHidden(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || !deferred) return null;

  return (
    <Surface className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">安装到桌面</div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          可像 App 一样打开；离线可看壳页，完整做题仍建议联网。
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setHidden(true)}
        >
          稍后
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={async () => {
            try {
              await deferred.prompt();
              await deferred.userChoice;
            } catch {
              // user dismissed or browser rejected
            }
            setDeferred(null);
          }}
        >
          <Download className="size-3.5" />
          安装
        </Button>
      </div>
    </Surface>
  );
}
