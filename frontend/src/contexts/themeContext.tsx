import { createContext, useContext, useState, type ReactNode } from "react";
import { catppuccinMocha, catppuccinLatte } from "../theme/catppuccin";

type Mode = "dark" | "light";

type ThemeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  catppuccin: typeof catppuccinMocha;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(
    (localStorage.getItem("theme") as Mode) ?? "dark",
  );

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("theme", newMode);
  };

  const catppuccin = mode === "dark" ? catppuccinMocha : catppuccinLatte;

  return (
    <ThemeContext.Provider value={{ mode, setMode, catppuccin }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
}
