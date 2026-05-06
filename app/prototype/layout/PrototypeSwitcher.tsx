"use client";
// PROTOTYPE — floating variant switcher. Hidden in production.

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";

const VARIANTS = [
  { key: "A", name: "Command Centre" },
  { key: "B", name: "Split View" },
  { key: "C", name: "Timeline" },
];

export function PrototypeSwitcher({ current }: { current: string }) {
  if (process.env.NODE_ENV === "production") return null;

  const router = useRouter();
  const idx = VARIANTS.findIndex(v => v.key === current);
  const currentVariant = VARIANTS[idx] ?? VARIANTS[0];

  const go = useCallback((dir: 1 | -1) => {
    const next = VARIANTS[(idx + dir + VARIANTS.length) % VARIANTS.length];
    router.replace(`?variant=${next.key}`);
  }, [idx, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement;
      const isInput = active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (isInput) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-white rounded-full px-4 py-2 shadow-xl text-sm select-none">
      <button
        onClick={() => go(-1)}
        className="hover:text-slate-300 transition-colors px-1 text-base"
        aria-label="Previous variant"
      >
        ←
      </button>
      <span className="font-medium px-2 min-w-[160px] text-center">
        <span className="text-slate-400 mr-1">{currentVariant.key}</span>
        {currentVariant.name}
      </span>
      <button
        onClick={() => go(1)}
        className="hover:text-slate-300 transition-colors px-1 text-base"
        aria-label="Next variant"
      >
        →
      </button>
      <span className="ml-2 text-slate-500 text-xs border-l border-slate-700 pl-2">PROTOTYPE</span>
    </div>
  );
}
