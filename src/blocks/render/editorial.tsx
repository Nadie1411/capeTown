import { asset } from "@/lib/base";
import type { ProjectData, ServiceData } from "@/lib/types";
import { localePath, lt, t } from "@/lib/i18n";
import { cn, telHref, waHref } from "@/lib/utils";
import { Buttons, MediaView, Section, resolveHref, type BlockProps } from "./shared";
import { Counter } from "./client/counter";
import { Parallax } from "./client/parallax";
import { SnapRow } from "./client/snap-row";
import { ServicesIndex } from "./client/services-index";
import { ContactForm } from "./client/contact-form";
import { SOCIAL_ICONS } from "@/components/site/social-icons";

const pad = (n: number) => String(n).padStart(2, "0");

/** Headline split into animated lines; optionally one line outlined */
function Lines({ text, outline = 0, className }: { text: string; outline?: number; className?: string }) {
  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask">
          <span className={cn("line", i + 1 === outline && "outline")} style={{ "--i": i } as any}>{l}</span>
        </span>
      ))}
    </span>
  );
}

function Eyebrow({ text, no }: { text: string; no?: number }) {
  if (!text && !no) return null;
  return (
    <div className="flex items-center gap-4">
      {text ? <span className="eyebrow">{text}</span> : null}
    </div>
  );
}

/* ------------------------------ hero ------------------------------ */
export function HeroEditorialBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const title = lt(content.title, locale);
  const subtitle = lt(content.subtitle, locale);
  const eyebrow = lt(content.eyebrow, locale);
  const caption = lt(content.mediaCaption, locale);
  const stats: any[] = content.stats || [];
  return (
    <Section block={block} style={style} tag="header" index={index} locale={locale} className="flex min-h-[calc(100svh-4.5rem)] flex-col">
      <div className="grid flex-1 items-end gap-8 pt-6 lg:grid-cols-12 lg:gap-8 lg:pt-10 pb-10 lg:pb-14">
        {/* image column */}
        <div className="relative order-1 lg:order-2 lg:col-span-5 lg:col-start-8 lg:self-start">
          <Parallax speed={0.08}>
            <div className="plate aspect-[4/5] max-h-[62svh] lg:max-h-none" data-reveal="clip">
              <MediaView url={content.mainMedia} alt={title.replace(/\n/g, " ")} priority />
            </div>
          </Parallax>
          {content.secondaryMedia ? (
            <div className="plate absolute -bottom-6 -start-3 w-[44%] aspect-[4/3] ring-[6px] ring-[var(--c-bg)] sm:-start-8 sm:-bottom-10" data-reveal="clip" style={{ transitionDelay: "250ms" } as any}>
              <MediaView url={content.secondaryMedia} alt="" />
            </div>
          ) : null}
          {caption ? <div className={cn("mono mt-4 text-[var(--fg-muted)]", content.secondaryMedia && "ps-[48%] sm:mt-14")} dir="auto">{caption}</div> : null}
        </div>
        {/* text column */}
        <div className="order-2 lg:order-1 lg:col-span-7 lg:pe-10">
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h1 className="display display-xl mt-5 text-[var(--heading)]" data-reveal="lines">
            <Lines text={title} outline={Number(content.outlineLine) || 0} />
          </h1>
          {subtitle ? <p className="lede mt-7">{subtitle}</p> : null}
          <Buttons buttons={content.buttons} ctx={ctx} size="lg" className="mt-8 items-center gap-6" />
        </div>
      </div>
      {/* dimension bar */}
      {stats.length ? (
        <div className="relative">
          <div className="rule rule-draw" data-reveal="fade" />
          <div className={cn("grid grid-cols-3", stats.length === 4 && "grid-cols-2 sm:grid-cols-4", "lg:grid-cols-[repeat(var(--n),minmax(0,1fr))_auto]")} style={{ "--n": stats.length } as any}>
            {stats.map((s, i) => (
              <div key={i} className="tick py-5 pe-4 ps-4 first:ps-0">
                <div className="display display-md text-[var(--heading)]" dir="ltr">{s.value}</div>
                <div className="mono mt-1 text-[var(--fg-muted)]">{lt(s.label, locale)}</div>
              </div>
            ))}
            {content.showScrollHint ? (
              <div className="mono hidden items-center gap-3 py-5 text-[var(--fg-muted)] lg:flex">
                <span className="relative block h-9 w-px overflow-hidden bg-[var(--line-cur)]"><span className="scroll-line absolute inset-0 bg-[var(--c-accent)]" /></span>
                {t(locale, "scrollHint")}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------ services index ------------------------------ */
export function ServicesIndexBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale, services } = ctx;
  let list: ServiceData[] = services;
  if (content.source === "featured") list = services.filter((s) => s.featured);
  if (content.source === "selected") list = (content.selected || []).map((id: string) => services.find((s) => s.id === id)).filter(Boolean) as ServiceData[];
  list = list.slice(0, Number(content.limit) || 12);
  const items = list.map((s, i) => ({ id: s.id, no: pad(i + 1), title: lt(s.title, locale), summary: lt(s.summary, locale), href: localePath(locale, `/services/${s.slug}`), image: s.coverUrl }));
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Eyebrow text={lt(content.eyebrow, locale)} />
          <h2 className="display display-lg mt-5 text-[var(--heading)]" data-reveal="lines"><Lines text={lt(content.title, locale)} /></h2>
          {lt(content.subtitle, locale) ? <p className="lede mt-5">{lt(content.subtitle, locale)}</p> : null}
        </div>
        {content.showButton ? <a href={resolveHref("/services", ctx)} className="btn btn-ghost self-start lg:self-auto">{lt(content.buttonLabel, locale) || t(locale, "viewAllServices")} <span className="arrow">→</span></a> : null}
      </div>
      <ServicesIndex items={items} showImages={content.showImages !== false} locale={locale} exploreLabel={t(locale, "readMore")} countLabel={t(locale, "servicesCount")} />
    </Section>
  );
}

/* ------------------------------ story ------------------------------ */
export function StoryBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const stats: any[] = content.stats || [];
  const ach: any[] = content.achievements || [];
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow text={lt(content.eyebrow, locale)} />
          <h2 className="display display-lg mt-5 text-[var(--heading)]" data-reveal="lines"><Lines text={lt(content.statement, locale)} /></h2>
          {ach.length ? (
            <ol className="mt-10 border-t border-[var(--line-cur)]" data-reveal="stagger">
              {ach.map((a, i) => (
                <li key={i} className="flex items-baseline gap-4 border-b border-[var(--line-cur)] py-3.5" style={{ "--i": i } as any}>
                  <span className="mono text-[var(--c-accent)]" dir="ltr">{pad(i + 1)}</span>
                  <span className="font-medium">{lt(a.text, locale)}</span>
                </li>
              ))}
            </ol>
          ) : null}
          <Buttons buttons={content.buttons} ctx={ctx} size="md" className="mt-8" />
        </div>
        <div className="lg:col-span-7 lg:ps-6">
          <div className="relative">
            <div className="plate aspect-[4/3]" data-reveal="clip">
              <MediaView url={content.imageA} alt={lt(content.imageCaption, locale)} />
            </div>
            {content.imageB ? (
              <div className="plate absolute -bottom-8 -start-2 w-[40%] aspect-[3/4] ring-[6px] ring-[var(--c-bg)] sm:-start-6 sm:-bottom-12" data-reveal="clip" style={{ transitionDelay: "200ms" } as any}>
                <MediaView url={content.imageB} alt="" />
              </div>
            ) : null}
          </div>
          {lt(content.imageCaption, locale) ? <div className={cn("mono mt-4 text-[var(--fg-muted)]", content.imageB && "ps-[44%] sm:mt-16")}>{lt(content.imageCaption, locale)}</div> : null}
          {lt(content.body, locale) ? <div className={cn("rich mt-8 text-[1.02em] lg:columns-2 lg:gap-10", !content.imageB && "mt-10")} dangerouslySetInnerHTML={{ __html: lt(content.body, locale) }} /> : null}
          {stats.length ? (
            <div className={cn("mt-10 grid border-t border-[var(--line-cur)]", stats.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
              {stats.map((s, i) => (
                <div key={i} className="tick py-5 ps-4 pe-3 first:ps-0">
                  <div className="display display-md text-[var(--heading)]"><Counter value={Number(s.value) || 0} suffix={s.suffix || ""} animate={!ctx.preview} /></div>
                  <div className="mono mt-1 text-[var(--fg-muted)]">{lt(s.label, locale)}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ capabilities ------------------------------ */
export function CapabilitiesBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const items: any[] = content.items || [];
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Eyebrow text={lt(content.eyebrow, locale)} />
          <h2 className="display display-lg mt-5 text-[var(--heading)]" data-reveal="lines"><Lines text={lt(content.title, locale)} /></h2>
        </div>
        <ol className="border-t border-[var(--line-cur)] lg:col-span-8" data-reveal="stagger">
          {items.map((it, i) => {
            const Tag: any = it.href ? "a" : "div";
            return (
              <li key={i} className="border-b border-[var(--line-cur)]" style={{ "--i": i } as any}>
                <Tag href={it.href ? resolveHref(it.href, ctx) : undefined} className="group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-4 gap-y-1 py-5 sm:grid-cols-[3rem_1.1fr_1fr] lg:py-6">
                  <span className="mono text-[var(--fg-muted)]" dir="ltr">{pad(i + 1)}</span>
                  <span className="display display-sm text-[var(--heading)] transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{lt(it.title, locale)}</span>
                  <span className="col-start-2 text-[var(--fg-muted)] sm:col-start-3 sm:text-end">{lt(it.text, locale)}</span>
                </Tag>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}

/* ------------------------------ portfolio ------------------------------ */
export function PortfolioBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale, projects, settings } = ctx;
  let list: ProjectData[] = projects;
  if (content.source === "featured") list = projects.filter((p) => p.featured);
  if (content.source === "category" && content.category) list = projects.filter((p) => p.category === content.category);
  if (content.source === "selected") list = (content.selected || []).map((id: string) => projects.find((p) => p.id === id)).filter(Boolean) as ProjectData[];
  list = list.slice(0, Number(content.limit) || 12);
  const cat = (key: string) => lt(settings.projectCategories.find((c) => c.key === key)?.label, locale) || key;
  const featured = content.featuredFirst !== false ? list[0] : null;
  const rest = featured ? list.slice(1) : list;
  const meta = (p: ProjectData) => [cat(p.category), lt(p.location, locale), p.year].filter(Boolean).join(" — ");

  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Eyebrow text={lt(content.eyebrow, locale)} />
          <h2 className="display display-lg mt-5 text-[var(--heading)]" data-reveal="lines"><Lines text={lt(content.title, locale)} /></h2>
          {lt(content.subtitle, locale) ? <p className="lede mt-5">{lt(content.subtitle, locale)}</p> : null}
        </div>
        {content.showButton ? <a href={resolveHref("/projects", ctx)} className="btn btn-ghost self-start lg:self-auto">{lt(content.buttonLabel, locale) || t(locale, "viewAllProjects")} <span className="arrow">→</span></a> : null}
      </div>

      {featured ? (
        <a href={localePath(locale, `/projects/${featured.slug}`)} className="plate plate-hover group block aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]" data-reveal="clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {featured.coverUrl ? <img src={asset(featured.coverUrl)} alt={lt(featured.title, locale)} loading="lazy" /> : null}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(8,11,32,.82)] via-[rgba(8,11,32,.35)] to-transparent p-5 pt-24 text-white sm:p-8 lg:p-10">
            <div className="mono text-white/75" dir="auto">01 — {meta(featured)}</div>
            <div className="mt-2 flex items-end justify-between gap-6">
              <h3 className="display display-lg">{lt(featured.title, locale)}</h3>
              <span className="mono hidden shrink-0 items-center gap-2 border-b border-white/60 pb-1 sm:inline-flex">{t(locale, "readMore")} <span className="arrow">→</span></span>
            </div>
          </div>
        </a>
      ) : null}

      {rest.length ? (
        <div className="mt-8 lg:mt-16">
          <SnapRow count={rest.length} className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20 lg:overflow-visible" locale={locale}>
            {rest.map((p, i) => {
              const wide = i % 2 === 0;
              return (
                <a key={p.id} href={localePath(locale, `/projects/${p.slug}`)} className={cn("group block", wide ? "lg:col-span-7" : "lg:col-span-5 lg:mt-24")}>
                  <div className={cn("plate plate-hover", wide ? "aspect-[4/5] lg:aspect-[4/3]" : "aspect-[4/5] lg:aspect-[3/4]")} data-reveal="clip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.coverUrl ? <img src={asset(p.coverUrl)} alt={lt(p.title, locale)} loading="lazy" /> : null}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4 border-t border-[var(--line-cur)] pt-3">
                    <div className="min-w-0">
                      <div className="mono text-[var(--fg-muted)]" dir="auto">{pad(i + (featured ? 2 : 1))} — {cat(p.category)}</div>
                      <h3 className="display display-sm mt-1 text-[var(--heading)] group-hover:text-[var(--c-primary)]">{lt(p.title, locale)}</h3>
                    </div>
                    <div className="mono shrink-0 text-end text-[var(--fg-muted)]">
                      {lt(p.location, locale) ? <div>{lt(p.location, locale)}</div> : null}
                      {p.year ? <div dir="ltr">{p.year}</div> : null}
                    </div>
                  </div>
                </a>
              );
            })}
          </SnapRow>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------ principles ------------------------------ */
export function PrinciplesBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const items: any[] = content.items || [];
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Eyebrow text={lt(content.eyebrow, locale)} />
          <h2 className="display display-lg mt-5 text-[var(--heading)]" data-reveal="lines"><Lines text={lt(content.title, locale)} /></h2>
        </div>
        <ol className="grid border-t border-[var(--line-cur)] sm:grid-cols-2 sm:gap-x-10 lg:col-span-7" data-reveal="stagger">
          {items.map((it, i) => (
            <li key={i} className="border-b border-[var(--line-cur)] py-6 sm:py-7" style={{ "--i": i } as any}>
              <div className="mono text-[var(--c-accent)]" dir="ltr">{pad(i + 1)}</div>
              <h3 className="display display-sm mt-3 text-[var(--heading)]">{lt(it.title, locale)}</h3>
              <p className="mt-2 max-w-sm text-[var(--fg-muted)]">{lt(it.text, locale)}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ------------------------------ start a project ------------------------------ */
export function StartProjectBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale, settings, services } = ctx;
  const phone = settings.contact.phones[0]?.number;
  const c = settings.contact;
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow text={lt(content.eyebrow, locale)} />
          <h2 className="display display-lg mt-5 text-[var(--heading)]" data-reveal="lines"><Lines text={lt(content.title, locale)} /></h2>
          {lt(content.text, locale) ? <p className="lede mt-6">{lt(content.text, locale)}</p> : null}
          {phone ? (
            <div className="mt-10 border-t border-[var(--line-cur)] pt-6">
              <div className="mono text-[var(--fg-muted)]">{t(locale, "callNow")}</div>
              <a href={telHref(phone)} className="display display-md mt-2 block text-[var(--heading)] hover:text-[var(--c-primary)]" dir="ltr">{phone}</a>
            </div>
          ) : null}
          {c.whatsapp ? (
            <a href={waHref(c.whatsapp, lt(c.whatsappMessage, locale))} target="_blank" rel="noopener" className="btn btn-ghost mt-5 [&_svg]:h-5 [&_svg]:w-5">{SOCIAL_ICONS.whatsapp.icon} {t(locale, "whatsapp")} <span className="arrow">→</span></a>
          ) : null}
          {content.showInfo ? (
            <dl className="mt-10 grid gap-4 border-t border-[var(--line-cur)] pt-6 sm:grid-cols-2 lg:grid-cols-1">
              {lt(c.address, locale) ? <div><dt className="mono text-[var(--fg-muted)]">{t(locale, "address")}</dt><dd className="mt-1">{lt(c.address, locale)}</dd></div> : null}
              {lt(c.hours, locale) ? <div><dt className="mono text-[var(--fg-muted)]">{t(locale, "hours")}</dt><dd className="mt-1">{lt(c.hours, locale)}</dd></div> : null}
              {c.email ? <div><dt className="mono text-[var(--fg-muted)]">{t(locale, "email")}</dt><dd className="mt-1"><a href={`mailto:${c.email}`} className="hover:underline" dir="ltr">{c.email}</a></dd></div> : null}
            </dl>
          ) : null}
        </div>
        {content.showForm !== false ? (
          <div className="lg:col-span-7">
            <div className="border border-[var(--line-cur)] bg-[var(--card-bg)] p-5 sm:p-8 lg:p-10" data-reveal="fade-up">
              <ContactForm
                locale={locale}
                services={services}
                showServiceSelect={content.showServiceSelect !== false && settings.forms.services}
                showEmailField={content.showEmailField !== false}
                formMode={content.formMode || "both"}
                whatsapp={settings.contact.whatsapp}
                buttonLabel={lt(content.buttonLabel, locale) || t(locale, "send")}
                successMessage={lt(settings.forms.successMessage, locale)}
                preview={ctx.preview}
              />
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
