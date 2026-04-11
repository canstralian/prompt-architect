import { useState, useCallback } from "react";

export type PaginationMode = "infinite" | "manual";

const STORAGE_KEY = "pagination-preference";

export function usePaginationPreference() {
  const [mode, setModeState] = useState<PaginationMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "infinite" || stored === "manual") return stored;
    } catch {}
    return "infinite";
  });

  const setMode = useCallback((newMode: PaginationMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  }, []);

  return { mode, setMode };
}
