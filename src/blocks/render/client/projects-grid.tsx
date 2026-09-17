"use client";
import { asset } from "@/lib/base";
import { useMemo, useState } from "react";
import type { Locale, ProjectCategory, ProjectData } from "@/lib/types";
import { localePath, lt, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SnapRow } from "./snap-row";

/** Project cards: swipe row on phones, grid on large screens. */
export function ProjectsGrid({ projects, categories, locale, columns, cardStyle, showFilters, showMeta, stacked = false }: { projects: ProjectData[]; categories: ProjectCategory[]; locale: Locale; columns: string; cardStyle: "overlay" | "card"; showFilters: boolean; showMeta: boolean; stacked?: boolean }) {
  const [active, setActive] = useState("all");
  const used = useMemo(() => categories.filter((c) => projects.some((p) => p.category === c.key)), [categories, projects]);
  const list = useMemo(() => (active === "all" ? projects : projects.filter((p) => p.category === active)), [projects, active]);
  const cols = { "2": "lg:grid-cols-2", "3": "lg:grid-cols-3", "4": "lg:grid-cols-4" }[columns] || "lg:grid-cols-3";
  const catLabel = (key: string) => lt(categories.find((c) => c.key === key)?.label, locale) || key;

  const card = (p: ProjectData) => {
    const href = localePath(locale, `/projects/${p.slug}`);
    const title = lt(p.title, locale);
    const meta = [showMeta && lt(p.location, locale), showMeta && p.year].filter(Boolean).join(" · ");
    if (cardStyle === "card") {
      return (
        <a key={p.id} href={href} className="group block">
          <div className="plate plate-hover aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.coverUrl ? <img src={asset(p.coverUrl)} alt={title} loading="lazy" decoding="async" /> : null}
          </div>
          <div className="mt-4">
            <div className="text-[.8rem] font-semibold uppercase tracking-wider text-[var(--c-primary)] rtl:tracking-normal">{catLabel(p.category)}</div>
            <h3 className="mt-1 text-[1.15rem] font-semibold text-[var(--heading)] group-hover:text-[var(--c-primary)]">{title}</h3>
            {meta ? <div className="mt-1 text-sm text-[var(--fg-muted)]">{meta}</div> : null}
          </div>
        </a>
      );
    }
    return (
      <a key={p.id} href={href} className="plate plate-hover group block aspect-[4/3] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.coverUrl ? <img src={asset(p.coverUrl)} alt={title} loading="lazy" decoding="async" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,38,.88)] via-[rgba(8,12,38,.2)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="text-[.75rem] font-semibold uppercase tracking-wider text-white/75 rtl:tracking-normal">{catLabel(p.category)}</div>
          <h3 className="mt-1 text-[1.2rem] font-semibold leading-snug">{title}</h3>
          {meta ? <div className="mt-1 text-sm text-white/75">{meta}</div> : null}
        </div>
      </a>
    );
  };

  return (
    <div>
      {showFilters && used.length > 1 ? (
        <div className="mb-8 flex flex-wrap gap-2" role="tablist">
          {[{ key: "all", label: { ar: t("ar", "all"), en: t("en", "all") } }, ...used].map((c) => (
            <button key={c.key} role="tab" aria-selected={active === c.key} onClick={() => setActive(c.key)} className={cn("rounded-full border px-4 py-2 text-[.9em] font-medium transition", active === c.key ? "border-[var(--c-primary)] bg-[var(--c-primary)] text-white" : "border-[var(--line-cur-strong)] text-[var(--fg)] hover:border-[var(--c-primary)]")}>
              {lt(c.label, locale)}
            </button>
          ))}
        </div>
      ) : null}
      {stacked ? (
        <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2", cols)}>{list.map(card)}</div>
      ) : (
        <SnapRow count={list.length} className={cn("lg:grid lg:gap-6 lg:overflow-visible", cols)} locale={locale}>
          {list.map(card)}
        </SnapRow>
      )}
      {!list.length ? <p className="py-10 text-center text-[var(--fg-muted)]">—</p> : null}
    </div>
  );
}
