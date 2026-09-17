import { asset } from "@/lib/base";
import { localePath, lt } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Icon, Section, SectionHeading, gridCols, resolveHref, type BlockProps } from "./shared";
import { ProjectsGrid } from "./client/projects-grid";
import { ArrowUpRight } from "lucide-react";
import type { ServiceData } from "@/lib/types";

/* ------------------------------ services ------------------------------ */
export function ServicesBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale, services } = ctx;
  let list: ServiceData[] = services;
  if (content.source === "featured") list = services.filter((s) => s.featured);
  if (content.source === "selected") list = (content.selected || []).map((id: string) => services.find((s) => s.id === id)).filter(Boolean) as ServiceData[];
  list = list.slice(0, Number(content.limit) || 12);
  const cs = content.cardStyle || "overlay";
  const allHref = resolveHref("/services", ctx);
  const allLabel = lt(content.buttonLabel, locale) || (locale === "ar" ? "جميع الخدمات" : "All services");

  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading content={content} ctx={ctx} className="!mb-0" />
        {content.showButton ? <a href={allHref} className="btn btn-ghost hidden lg:inline-flex">{allLabel} <span className="arrow">→</span></a> : null}
      </div>

      {cs === "list" ? (
        <ul className={cn("grid gap-3", gridCols(content.columns))}>
          {list.map((s) => (
            <li key={s.id}>
              <a href={localePath(locale, `/services/${s.slug}`)} className="card card-hover flex items-center gap-4 px-5 py-4 text-start">
                <span className="icon-bubble !h-11 !w-11"><Icon name={s.icon} size={22} /></span>
                <span className="font-semibold text-[var(--heading)]">{lt(s.title, locale)}</span>
                <ArrowUpRight className="ms-auto flex-none opacity-50 rtl:-scale-x-100" size={18} />
              </a>
            </li>
          ))}
        </ul>
      ) : cs === "overlay" ? (
        /* image tiles — 2 columns on phones, 4 on desktop */
        <div className={cn("grid grid-cols-2 gap-3 sm:gap-5", Number(content.columns) === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")} data-reveal="stagger">
          {list.map((s, i) => {
            const title = lt(s.title, locale);
            return (
              <a key={s.id} href={localePath(locale, `/services/${s.slug}`)} className="plate plate-hover group block aspect-[4/5] text-white" style={{ "--i": i } as any}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.coverUrl ? <img src={asset(s.coverUrl)} alt={title} loading="lazy" decoding="async" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,12,38,.88)] via-[rgba(8,12,38,.25)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="text-[1.02rem] font-semibold leading-snug sm:text-[1.15rem]">{title}</h3>
                  {content.showDescription && lt(s.summary, locale) ? <p className="mt-1 hidden text-sm text-white/80 sm:line-clamp-2">{lt(s.summary, locale)}</p> : null}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-white/75 opacity-0 transition group-hover:opacity-100">{locale === "ar" ? "التفاصيل" : "Details"} <span className="arrow">→</span></span>
                </div>
              </a>
            );
          })}
        </div>
      ) : cs === "image" ? (
        <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2", gridCols(content.columns))}>
          {list.map((s) => {
            const title = lt(s.title, locale);
            return (
              <a key={s.id} href={localePath(locale, `/services/${s.slug}`)} className="group block">
                <div className="plate plate-hover aspect-[16/11]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.coverUrl ? <img src={asset(s.coverUrl)} alt={title} loading="lazy" decoding="async" /> : null}
                </div>
                <h3 className="mt-4 text-[1.15rem] font-semibold text-[var(--heading)] group-hover:text-[var(--c-primary)]">{title}</h3>
                {content.showDescription && lt(s.summary, locale) ? <p className="mt-1.5 line-clamp-2 text-[var(--fg-muted)]">{lt(s.summary, locale)}</p> : null}
              </a>
            );
          })}
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", gridCols(content.columns))}>
          {list.map((s) => (
            <a key={s.id} href={localePath(locale, `/services/${s.slug}`)} className="card card-hover group block p-6 text-start">
              <span className="icon-bubble mb-4"><Icon name={s.icon} size={24} /></span>
              <h3 className="text-[1.1rem] font-semibold text-[var(--heading)]">{lt(s.title, locale)}</h3>
              {content.showDescription && lt(s.summary, locale) ? <p className="mt-2 line-clamp-3 text-[var(--fg-muted)]">{lt(s.summary, locale)}</p> : null}
            </a>
          ))}
        </div>
      )}

      {content.showButton ? (
        <div className="mt-8 lg:hidden">
          <a href={allHref} className="btn btn-outline w-full">{allLabel} <span className="arrow">→</span></a>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------ projects ------------------------------ */
export function ProjectsBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale, projects, settings } = ctx;
  let list = projects;
  if (content.source === "featured") list = projects.filter((p) => p.featured);
  if (content.source === "category" && content.category) list = projects.filter((p) => p.category === content.category);
  if (content.source === "selected") list = (content.selected || []).map((id: string) => projects.find((p) => p.id === id)).filter(Boolean) as typeof projects;
  list = list.slice(0, Number(content.limit) || 12);
  const allHref = resolveHref("/projects", ctx);
  const allLabel = lt(content.buttonLabel, locale) || (locale === "ar" ? "جميع الأعمال" : "All projects");
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading content={content} ctx={ctx} className="!mb-0" />
        {content.showButton ? <a href={allHref} className="btn btn-ghost hidden lg:inline-flex">{allLabel} <span className="arrow">→</span></a> : null}
      </div>
      <ProjectsGrid projects={list} categories={settings.projectCategories} locale={locale} columns={String(content.columns || "3")} cardStyle={content.cardStyle || "overlay"} showFilters={!!content.showFilters && content.source !== "category"} showMeta={content.showMeta !== false} stacked={content.mobileLayout === "stacked"} />
      {content.showButton ? (
        <div className="mt-8 lg:hidden">
          <a href={allHref} className="btn btn-outline w-full">{allLabel} <span className="arrow">→</span></a>
        </div>
      ) : null}
    </Section>
  );
}
