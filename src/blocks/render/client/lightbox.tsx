"use client";
import { asset } from "@/lib/base";
import { useCallback, useEffect, useState } from "react";
import { cn, isVideoUrl } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxItem {
  url: string;
  caption?: string;
  posterUrl?: string;
}

export function Lightbox({ items, index, onClose, onIndex }: { items: LightboxItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null;
  const go = useCallback(
    (d: number) => {
      if (index === null || !items.length) return;
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex]
  );
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, onClose]);
  if (!open || index === null) return null;
  const item = items[index];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onClose} role="dialog" aria-modal="true" dir="ltr">
      <button className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={onClose} aria-label="Close">
        <X size={26} />
      </button>
      {items.length > 1 ? (
        <>
          <button className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">
            <ChevronLeft size={30} />
          </button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">
            <ChevronRight size={30} />
          </button>
        </>
      ) : null}
      <figure className="max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        {isVideoUrl(item.url) ? (
          <video src={asset(item.url)} poster={item.posterUrl ? asset(item.posterUrl) : undefined} controls autoPlay className="max-h-[82vh] w-auto rounded-lg" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(item.url)} alt={item.caption || ""} className="max-h-[82vh] w-auto rounded-lg object-contain" />
        )}
        {item.caption ? <figcaption className="mt-3 text-center text-white/90">{item.caption}</figcaption> : null}
        <div className="mt-2 text-center text-sm text-white/60">{index + 1} / {items.length}</div>
      </figure>
    </div>
  );
}

export function GalleryGrid({ items, columns, aspect, lightbox }: { items: LightboxItem[]; columns: string; aspect: "square" | "video" | "portrait"; lightbox: boolean }) {
  const [idx, setIdx] = useState<number | null>(null);
  const cols = { "2": "sm:grid-cols-2", "3": "sm:grid-cols-2 lg:grid-cols-3", "4": "sm:grid-cols-2 lg:grid-cols-4" }[columns] || "sm:grid-cols-2 lg:grid-cols-3";
  const ratio = { square: "aspect-square", video: "aspect-video", portrait: "aspect-[3/4]" }[aspect] || "aspect-video";
  return (
    <>
      <div className={cn("grid grid-cols-1 gap-4", cols)}>
        {items.map((it, i) => (
          <figure key={i} className="group overflow-hidden rounded-[var(--radius)] border border-[var(--card-border)] bg-black/5">
            <button type="button" className={cn("block w-full", ratio, lightbox ? "cursor-zoom-in" : "cursor-default")} onClick={() => lightbox && setIdx(i)} aria-label={it.caption || "Open"}>
              {isVideoUrl(it.url) ? (
                <video src={asset(it.url)} poster={it.posterUrl ? asset(it.posterUrl) : undefined} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(it.url)} alt={it.caption || ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
            </button>
            {it.caption ? <figcaption className="px-3 py-2 text-sm text-[var(--fg-muted)]">{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      {lightbox ? <Lightbox items={items} index={idx} onClose={() => setIdx(null)} onIndex={setIdx} /> : null}
    </>
  );
}
