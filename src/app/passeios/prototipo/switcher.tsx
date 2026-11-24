"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type SwitcherProps = { variants: { key: string; name: string }[]; current: string };

export function PrototypeSwitcher({ variants, current }: SwitcherProps) {
  const router = useRouter();
  const index = Math.max(0, variants.findIndex((variant) => variant.key === current));

  function go(step: number) {
    const next = variants[(index + step + variants.length) % variants.length];

    router.replace(`?variant=${next.key}`, { scroll: false });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (target?.closest("input, textarea, [contenteditable]")) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-3 py-2 font-mono text-sm text-black shadow-2xl">
      <button type="button" onClick={() => go(-1)} aria-label="Variante anterior" className="size-8 rounded-full bg-black text-white">
        ←
      </button>
      <span className="whitespace-nowrap">
        PROTÓTIPO · {variants[index].key} ({variants[index].name})
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Próxima variante" className="size-8 rounded-full bg-black text-white">
        →
      </button>
    </div>
  );
}
