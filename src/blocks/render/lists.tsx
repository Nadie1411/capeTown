import { localePath, lt } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Icon, Section, SectionHeading, gridCols, resolveHref, type BlockProps } from "./shared";
import { ProjectsGrid } from "./client/projects-grid";
import { ArrowUpRight } from "lucide-react";
import type { ServiceData } from "@/lib/types";

/* ------------------------------ services ------------------------------ */
export function ServicesBlock({ block, content, style, ctx }: BlockProps) {
  const { locale, services } = ctx;
  let list: ServiceData[] = services;
  if (content.source === "featured") list = services.filter((s) => s.featured);
  if (content.source === "selected") list = (content.selected || []).map((id: string) => services.find((s) => s.id === id)).filter(Boolean) as ServiceData[];
  list = list.slice(0, Number(content.limit) || 12);
  const cs = content.cardStyle || "icon";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      {cs === "list" ? (
        <ul className={cn("grid gap-3", gridCols(content.columns))}>
          {list.map((s) => (
            <li key={s.id}>
              <a href={localePath(locale, `/services/${s.slug}`)} className="card card-hover flex items-center gap-4 px-5 py-4 text-start">
                <span className="icon-bubble !h-12 !w-12"><Icon name={s.icon} size={24} /></span>
                <span className="text-lg font-semibold text-[var(--heading)]">{lt(s.title, locale)}</span>
                <ArrowUpRight className="ms-auto flex-none opacity-50 rtl:-scale-x-100" size={20} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className={cn("grid grid-cols-1 gap-5", gridCols(content.columns))}>
          {list.map((s, idx) => {
            const href = localePath(locale, `/services/${s.slug}`);
            const title = lt(s.title, locale);
            const summary = lt(s.summary, locale);
            if (cs === "overlay") {
              return (
                <a key={s.id} href={href} className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-[var(--c-primary-dark)] text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.coverUrl ? <img src={s.coverUrl} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /> : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-start">
                    <span className="mb-2 inline-flex rounded-lg bg-white/15 p-2 backdrop-blur"><Icon name={s.icon} size={24} /></span>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    {content.showDescription && summary ? <p className="mt-1 line-clamp-2 text-sm text-white/80">{summary}</p> : null}
                  </div>
                </a>
              );
            }
            if (cs === "image") {
              return (
                <a key={s.id} href={href} className="card card-hover group block overflow-hidden text-start">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--c-primary)]/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {s.coverUrl ? <img src={s.coverUrl} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                    <span className="absolute bottom-3 start-3 icon-bubble !h-12 !w-12 !bg-white !text-[var(--c-primary)] shadow"><Icon name={s.icon} size={24} /></span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl text-[var(--heading)]">{title}</h3>
                    {content.showDescription && summary ? <p className="mt-2 line-clamp-3 text-[var(--fg-muted)]">{summary}</p> : null}
                  </div>
                </a>
              );
            }
            return (
              <a key={s.id} href={href} className="card card-hover group relative block p-7 text-start">
                <span className="card-accent" aria-hidden="true" />
                <span className="card-index" dir="ltr">{String(idx + 1).padStart(2, "0")}</span>
                <span className="icon-bubble mb-5 transition group-hover:bg-[var(--c-primary)] group-hover:text-white"><Icon name={s.icon} size={28} /></span>
                <h3 className="text-xl text-[var(--heading)]">{title}</h3>
                {content.showDescription && summary ? <p className="mt-2 line-clamp-3 text-[var(--fg-muted)]">{summary}</p> : null}
                <span className="mt-4 inline-flex items-center gap-1 font-medium text-[var(--c-primary)] group-hover:underline">
                  {locale === "ar" ? "التفاصيل" : "Details"} <ArrowUpRight size={18} className="rtl:-scale-x-100" />
                </span>
              </a>
            );
          })}
        </div>
      )}
      {content.showButton ? (
        <div className={cn("mt-10 flex", style.align === "center" ? "justify-center" : "justify-start")}>
          <a href={resolveHref("/services", ctx)} className={cn("btn btn-primary btn-lg", ctx.settings.brand.buttonStyle === "pill" && "btn-pill")} dir={dir}>
            {lt(content.buttonLabel, locale) || (locale === "ar" ? "جميع الخدمات" : "All services")}
          </a>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------ projects ------------------------------ */
export function ProjectsBlock({ block, content, style, ctx }: BlockProps) {
  const { locale, projects, settings } = ctx;
  let list = projects;
  if (content.source === "featured") list = projects.filter((p) => p.featured);
  if (content.source === "category" && content.category) list = projects.filter((p) => p.category === content.category);
  if (content.source === "selected") list = (content.selected || []).map((id: string) => projects.find((p) => p.id === id)).filter(Boolean) as typeof projects;
  list = list.slice(0, Number(content.limit) || 12);
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      <ProjectsGrid projects={list} categories={settings.projectCategories} locale={locale} columns={String(content.columns || "3")} cardStyle={content.cardStyle || "overlay"} showFilters={!!content.showFilters && content.source !== "category"} showMeta={content.showMeta !== false} />
      {content.showButton ? (
        <div className={cn("mt-10 flex", style.align === "center" ? "justify-center" : "justify-start")}>
          <a href={resolveHref("/projects", ctx)} className={cn("btn btn-primary btn-lg", settings.brand.buttonStyle === "pill" && "btn-pill")}>
            {lt(content.buttonLabel, locale) || (locale === "ar" ? "جميع الأعمال" : "All projects")}
          </a>
        </div>
      ) : null}
    </Section>
  );
}
