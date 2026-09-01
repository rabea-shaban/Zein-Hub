"use client";

import * as React from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "zein_hub_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeState(storedTheme);
      } else {
        // default is dark for Zein Hub broadcast studio theme
        setThemeState("dark");
      }
    } catch {
      setThemeState("dark");
    }
    setMounted(true);
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  React.useEffect(() => {
    if (mounted && typeof document !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
