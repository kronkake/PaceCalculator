import { useState } from "react";

export type UnitMode = "km" | "miles" | "both";

const STORAGE_KEY = "unitMode";

const isUnitMode = (value: string | null): value is UnitMode =>
  value === "km" || value === "miles" || value === "both";

export const useUnitMode = () => {
  const [unitMode, setUnitModeState] = useState<UnitMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isUnitMode(stored) ? stored : "km";
  });

  const setUnitMode = (mode: UnitMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setUnitModeState(mode);
  };

  return { unitMode, setUnitMode };
};
