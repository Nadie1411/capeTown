"use client";
import { useMemo, useState } from "react";
import type { Locale, ProjectCategory, ProjectData } from "@/lib/types";
import { localePath, lt, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";

export function ProjectsGrid({ projects, categories, locale, columns, cardStyle, showFilters, showMeta }: { projects: ProjectData[]; categories: ProjectCategory[]; locale: Locale; columns: string; cardStyle: "overlay" | "card"; showFilters: boolean; showMeta: boolean }) {
  const [active, setActive] = useState("all");
  const used = useMemo(() => categories.filter((c) => projects.some((p) => p.category === c.key)), [categories, projects]);
  const list = useMemo(() => (active === "all" ? projects : projects.filter((p) => p.category === active)), [projects, active]);
  const cols = { "2": "sm:grid-cols-2", "3": "sm:grid-cols-2 lg:grid-cols-3", "4": "sm:grid-cols-2 lg:grid-cols-4" }[columns] || "sm:grid-cols-2 lg:grid-cols-3";
  const catLabel = (key: string) => lt(categories.find((c) => c.key === key)?.label, locale) || key;

  return (
    <div>
      {showFilters && used.length > 1 ? (
        <div className="mb-8 flex flex-wrap gap-2" role="tablist">
          {[{ key: "all", label: { ar: t("ar", "all"), en: t("en", "all") } }, ...used].map((c) => (
            <button
              key={c.key}
              role="tab"
              aria-selected={active === c.key}
              onClick={() => setActive(c.key)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-[.95em] font-medium transition",
                active === c.key ? "border-[var(--c-primary)] bg-[var(--c-primary)] text-white" : "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--fg)] hover:border-[var(--c-primary)]"
              )}
            >
              {lt(c.label, locale)}
            </button>
          ))}
        </div>
      ) : null}

      <div className={cn("grid grid-cols-1 gap-6", cols)}>
        {list.map((p) => {
          const href = localePath(locale, `/projects/${p.slug}`);
          const title = lt(p.title, locale);
          const meta = [showMeta && lt(p.location, locale), showMeta && p.year].filter(Boolean);
          if (cardStyle === "card") {
            return (
              <a key={p.id} href={href} className="card card-hover group block overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.coverUrl ? <img src={p.coverUrl} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                </div>
                <div className="p-5">
                  <div className="mb-2"><span className="tag tag-accent">{catLabel(p.category)}</span></div>
                  <h3 className="text-xl text-[var(--heading)]">{title}</h3>
                  {meta.length ? (
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--fg-muted)]">
                      {showMeta && lt(p.location, locale) ? <span className="inline-flex items-center gap-1"><MapPin size={16} /> {lt(p.location, locale)}</span> : null}
                      {showMeta && p.year ? <span className="inline-flex items-center gap-1"><Calendar size={16} /> {p.year}</span> : null}
                    </div>
                  ) : null}
                </div>
              </a>
            );
          }
          return (
            <a key={p.id} href={href} className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-[var(--c-primary-dark)] text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.coverUrl ? <img src={p.coverUrl} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-2"><span className="tag tag-light">{catLabel(p.category)}</span></div>
                <h3 className="text-xl font-semibold leading-snug drop-shadow">{title}</h3>
                {meta.length ? <div className="mt-1 text-sm text-white/80">{meta.join(" · ")}</div> : null}
              </div>
              <div className="absolute end-4 top-4 rounded-full bg-white/15 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100">
                <ArrowUpRight size={20} />
              </div>
            </a>
          );
        })}
      </div>
      {!list.length ? <p className="py-10 text-center text-[var(--fg-muted)]">—</p> : null}
    </div>
  );
}
