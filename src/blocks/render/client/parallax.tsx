"use client";
import { useEffect, useRef } from "react";

/** Moves its child vertically against the scroll (desktop only, respects reduced motion). */
export function Parallax({ children, speed = 0.12, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [speed]);
  return <div ref={ref} className={className} style={{ willChange: "transform" }}>{children}</div>;
}
