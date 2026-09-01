import type { StateStorage } from "zustand/middleware";

const memory = new Map<string, string>();

export const memoryStorage: StateStorage = {
  getItem: (name) => memory.get(name) ?? null,
  setItem: (name, value) => {
    memory.set(name, value);
  },
  removeItem: (name) => {
    memory.delete(name);
  },
};

export function getPersistStorage(): StateStorage {
  if (typeof window === "undefined") return memoryStorage;
  try {
    const probe = "__ruanshe_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}
