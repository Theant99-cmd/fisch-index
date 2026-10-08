import { useCallback, useEffect, useState } from "react";

const PREFIX = "fisch-codex:";

export function readStore<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("fisch-codex-store", { detail: key }));
    return true;
  } catch {
    return false;
  }
}

/** Hydration-safe persisted state: starts with fallback, loads after mount, syncs across hooks. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(readStore(key, fallback));
    const onChange = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(readStore(key, fallback));
    };
    window.addEventListener("fisch-codex-store", onChange);
    return () => window.removeEventListener("fisch-codex-store", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(readStore(key, fallback)) : next;
      setValue(resolved);
      writeStore(key, resolved);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set] as const;
}

export interface CatchEntry {
  id: string;
  fish: string;
  variant: string;
  weight: number | null;
  date: string;
}

export const KEYS = {
  owned: "owned-rods",
  catches: "catch-log",
  caught: "caught-fish",
  compare: "compare",
} as const;
