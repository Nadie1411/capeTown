"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Horizontal swipe row on small screens (with a position counter); becomes a normal grid on large screens via the className passed in. */
export function SnapRow({ children, count, className, hint, locale, style }: { children: React.ReactNode; count: number; className?: string; hint?: string; locale?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "16");
      setI(Math.min(count - 1, Math.max(0, Math.round(Math.abs(el.scrollLeft) / step))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);
  return (
    <div>
      <div ref={ref} className={cn("snap-row", className)} style={style}>
        {children}
      </div>
      {count > 1 ? (
        <div className="mt-4 flex items-center justify-between lg:hidden">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: count }).map((_, k) => <span key={k} className={cn("h-px transition-all", k === i ? "w-8 bg-current" : "w-3 bg-current opacity-30")} />)}
          </div>
          <div className="mono text-[var(--fg-muted)]" dir="ltr">{String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}{hint ? ` · ${hint}` : ""}</div>
        </div>
      ) : null}
    </div>
  );
}
