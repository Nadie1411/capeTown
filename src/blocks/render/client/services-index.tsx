"use client";
import { asset } from "@/lib/base";
import { useState } from "react";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

export interface IndexItem {
  id: string;
  no: string;
  title: string;
  summary: string;
  href: string;
  image: string;
}

export function ServicesIndex({ items, showImages, locale, exploreLabel, countLabel }: { items: IndexItem[]; showImages: boolean; locale: Locale; exploreLabel: string; countLabel: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const current = items[active] || items[0];
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <ol className={cn("border-t border-[var(--line-cur)]", showImages ? "lg:col-span-7" : "lg:col-span-12")}>
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <li key={it.id} className="border-b border-[var(--line-cur)]" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
              <button type="button" aria-expanded={isOpen} aria-controls={`svc-${it.id}`} onClick={() => setOpen(isOpen ? null : i)} className="group flex w-full items-baseline gap-4 py-5 text-start sm:gap-6 lg:py-6">
                <span className="mono w-7 shrink-0 text-[var(--fg-muted)]" dir="ltr">{it.no}</span>
                <span className={cn("display display-md flex-1 transition-colors duration-300", active === i || isOpen ? "text-[var(--c-primary)]" : "text-[var(--heading)]")}>{it.title}</span>
                <span className="shrink-0 text-[var(--fg-muted)] transition-transform duration-300 group-hover:rotate-90">{isOpen ? <Minus size={18} /> : <Plus size={18} />}</span>
              </button>
              <div id={`svc-${it.id}`} className={cn("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <div className="pb-7 ps-11 sm:ps-13">
                    {it.image ? (
                      <div className="plate mb-5 aspect-[16/10] lg:hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset(it.image)} alt={it.title} loading="lazy" />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <p className="max-w-lg text-[var(--fg-muted)]">{it.summary}</p>
                      <a href={it.href} className="btn btn-ghost shrink-0">{exploreLabel} <span className="arrow">→</span></a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {showImages && current ? (
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <div className="plate aspect-[4/5]">
              {items.map((it, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                it.image ? <img key={it.id} src={asset(it.image)} alt="" loading={i === 0 ? "eager" : "lazy"} className={cn("!absolute inset-0 transition-opacity duration-700", active === i ? "opacity-100" : "opacity-0")} /> : null
              ))}
            </div>
            <div className="mono mt-3 flex items-center justify-between text-[var(--fg-muted)]">
              <span>{current.no} — {current.title}</span>
              <span dir="ltr">{String(items.length).padStart(2, "0")} {countLabel}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
