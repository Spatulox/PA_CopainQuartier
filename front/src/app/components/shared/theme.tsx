import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  return [theme, setTheme];
}