import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export const getPreferredTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return { theme, toggleTheme };
};
