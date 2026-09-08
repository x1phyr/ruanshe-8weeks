"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/config";

/** Registers the app-shell service worker (installable PWA on GitHub Pages). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const swUrl = `${BASE_PATH}/sw.js`;
    void navigator.serviceWorker.register(swUrl, { scope: `${BASE_PATH}/` }).catch(() => {
      // SW optional — site still works without it
    });
  }, []);

  return null;
}
