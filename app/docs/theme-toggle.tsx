"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("docs-light", isLight);

    return () => {
      document.documentElement.classList.remove("docs-light");
    };
  }, [isLight]);

  return (
    <button
      type="button"
      onClick={() => setIsLight((value) => !value)}
      aria-pressed={isLight}
      aria-label={`Switch docs to ${isLight ? "dark" : "light"} mode`}
      className="docs-theme-pill rounded-full px-8 py-3 text-sm font-black tracking-[0.45em] shadow-[inset_0_1px_8px_rgba(255,255,255,0.35),0_8px_20px_rgba(0,0,0,0.35)]"
    >
      {isLight ? "DARK" : "LIGHT"}
    </button>
  );
}
