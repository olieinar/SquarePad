import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Theme } from "../types";

export function useTheme(): [Theme, Dispatch<SetStateAction<Theme>>] {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("squarepad-theme");
    return saved === "light" || saved === "dark" ? saved : "system";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("squarepad-theme", theme);
  }, [theme]);

  return [theme, setTheme];
}
