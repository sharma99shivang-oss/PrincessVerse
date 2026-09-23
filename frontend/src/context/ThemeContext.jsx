import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext(null);
const themes = ["light", "dark", "lavender", "midnight"];
const legacyThemes = {
  "princess-pink": "light",
  "dark-princess": "dark",
  "lavender-dream": "lavender",
  "midnight-love": "midnight",
  lavender: "lavender",
  "midnight-purple": "midnight",
};

const normalizeTheme = (value) => legacyThemes[value] || (themes.includes(value) ? value : null);

function getInitialTheme() {
  const saved = normalizeTheme(localStorage.getItem("pv-theme") || localStorage.getItem("pv_theme"));
  if (saved) return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pv-theme", theme);
    localStorage.setItem("pv_theme", theme);
  }, [theme]);

  const setActiveTheme = useCallback((nextTheme) => {
    const normalized = normalizeTheme(nextTheme);
    if (normalized) setTheme(normalized);
  }, []);

  const value = useMemo(() => ({
    theme,
    themes,
    setTheme: setActiveTheme,
  }), [setActiveTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
