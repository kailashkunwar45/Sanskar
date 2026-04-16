import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { hinduTheme, buddhistTheme } from "../theme/colors";
import * as storage from "../services/storage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("hindu");

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getThemePref();
        if (saved === "hindu" || saved === "buddhist") {
          setThemeName(saved);
        }
      } catch {
        // ignore – fallback to default theme
      }
    })();
  }, []);

  const theme = useMemo(
    () => (themeName === "buddhist" ? buddhistTheme : hinduTheme),
    [themeName]
  );

  const toggleTheme = useCallback(() => {
    setThemeName((prev) => {
      const next = prev === "hindu" ? "buddhist" : "hindu";
      storage.storeThemePref(next).catch(() => {});
      return next;
    });
  }, []);

  const setTheme = useCallback((name) => {
    if (name === "hindu" || name === "buddhist") {
      setThemeName(name);
      storage.storeThemePref(name).catch(() => {});
    }
  }, []);

  const value = useMemo(
    () => ({ theme, themeName, toggleTheme, setTheme }),
    [theme, themeName, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
