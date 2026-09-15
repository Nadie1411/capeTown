"use client";
import { useEffect, useRef, useState } from "react";

export function Counter({ value, suffix = "", animate = true, duration = 1600 }: { value: number; suffix?: string; animate?: boolean; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setN(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, animate, duration]);

  return (
    <span ref={ref} dir="ltr" className="tabular-nums">
      {n.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
