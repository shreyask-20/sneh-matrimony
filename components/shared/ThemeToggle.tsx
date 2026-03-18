"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem("sneh-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const activeDark = stored ? stored === "dark" : prefersDark;
    root.classList.toggle("dark", activeDark);
    setIsDark(activeDark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("sneh-theme", next ? "dark" : "light");
    setIsDark(next);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      aria-label="Toggle dark mode"
      type="button"
    >
      <span className="h-2 w-2 rounded-full bg-brand-500" />
      {isDark ? "Dark" : "Light"}
    </button>
  );
}
