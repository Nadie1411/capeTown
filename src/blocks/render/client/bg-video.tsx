"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Background video that picks the right file for the screen size, starts muted/inline,
 * and quietly falls back to the poster image when autoplay is refused (Low Power Mode),
 * when the visitor prefers reduced motion, or when phones are excluded.
 */
export function BgVideo({ src, mobileSrc, poster, playOnMobile }: { src: string; mobileSrc?: string; poster?: string; playOnMobile: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as any).connection?.saveData === true;
    if (reduced || saveData || (mobile && !playOnMobile)) return;
    setFile(mobile && mobileSrc ? mobileSrc : src);
  }, [src, mobileSrc, playOnMobile]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !file) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => setFailed(true));
  }, [file]);

  return (
    <>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" decoding="async" />
      ) : null}
      {file && !failed ? (
        <video ref={ref} className={cn("absolute inset-0 h-full w-full object-cover")} src={file} poster={poster || undefined} autoPlay muted loop playsInline preload="auto" disablePictureInPicture aria-hidden="true" />
      ) : null}
    </>
  );
}
