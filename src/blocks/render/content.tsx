import { lt, t } from "@/lib/i18n";
import { cn, isVideoUrl, telHref } from "@/lib/utils";
import { Buttons, Icon, MediaView, Section, SectionHeading, gridCols, resolveHref, type BlockProps } from "./shared";
import { Counter } from "./client/counter";
import { ChevronDown, Star, Quote, Phone, Mail } from "lucide-react";

/* ------------------------------ about ------------------------------ */
export function AboutBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  const mediaFirst = content.mediaPosition !== "end";
  const body = lt(content.body, locale);
  return (
    <Section block={block} style={style}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn("relative", mediaFirst ? "lg:order-1" : "lg:order-2")}>
          <div className={cn("relative aspect-[4/3] overflow-hidden", content.mediaStyle !== "plain" && "rounded-[var(--radius)]", content.mediaStyle === "framed" && "shadow-2xl")}>
            <MediaView url={content.media} poster={content.mediaPoster} alt={lt(content.title, locale)} />
          </div>
          {content.mediaStyle === "framed" ? <div className="absolute -inset-3 -z-10 rounded-[calc(var(--radius)+8px)] border border-[var(--sec-accent)] opacity-60 [inset-inline-start:-1.25rem] [top:1.25rem]" aria-hidden="true" /> : null}
          {content.badge?.show ? (
            <div className="absolute -bottom-5 end-5 rounded-[var(--radius)] bg-[var(--c-primary)] px-6 py-4 text-white shadow-xl">
              <div className="text-3xl font-bold leading-none" dir="ltr">{content.badge.value}</div>
              <div className="mt-1 text-sm opacity-90">{lt(content.badge.label, locale)}</div>
            </div>
          ) : null}
        </div>
        <div className={cn(mediaFirst ? "lg:order-2" : "lg:order-1")}>
          <SectionHeading content={content} ctx={ctx} className="mb-5" />
          {body ? <div className="rich text-[1.05em]" dangerouslySetInnerHTML={{ __html: body }} /> : null}
          {content.bullets?.length ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {content.bullets.map((b: any, i: number) => (
                <li key={i} className="flex items-start gap-3 font-medium">
                  <span className="mt-0.5 flex-none text-[var(--sec-accent)]"><Icon name={b.icon || "CircleCheck"} size={24} /></span>
                  <span>{lt(b.text, locale)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Buttons buttons={content.buttons} ctx={ctx} size="lg" className="mt-8" />
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ features ------------------------------ */
export function FeaturesBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  const cs = content.cardStyle || "card";
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      <div className={cn("grid grid-cols-1 gap-5", gridCols(content.columns))}>
        {(content.items || []).map((it: any, i: number) => (
          <div key={i} className={cn(cs === "card" && "card card-hover relative p-7", cs === "plain" && "p-2", cs === "numbered" && "card p-7", cs === "side" && "flex gap-5 p-2", "text-start")}>
            {cs === "card" ? <span className="card-accent" aria-hidden="true" /> : null}
            {cs === "numbered" ? (
              <div className="mb-4 text-4xl font-bold text-[var(--sec-accent)]" dir="ltr">{String(i + 1).padStart(2, "0")}</div>
            ) : (
              <div className="icon-bubble mb-4" data-style={content.iconStyle || "filled"}>
                <Icon name={it.icon} size={28} />
              </div>
            )}
            <div>
              <h3 className="text-xl text-[var(--heading)]">{lt(it.title, locale)}</h3>
              {lt(it.text, locale) ? <p className="mt-2 text-[var(--fg-muted)]">{lt(it.text, locale)}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ building types ------------------------------ */
export function BuildingTypesBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  const items = content.items || [];
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      {content.layout === "pills" ? (
        <div className="flex flex-wrap gap-3">
          {items.map((it: any, i: number) => {
            const Tag = it.href ? "a" : "div";
            return (
              <Tag key={i} href={it.href ? resolveHref(it.href, ctx) : undefined} className="card card-hover inline-flex items-center gap-3 px-5 py-3 font-medium">
                <span className="text-[var(--c-primary)]"><Icon name={it.icon} size={26} /></span>
                {lt(it.title, locale)}
              </Tag>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {items.map((it: any, i: number) => {
            const Tag = it.href ? "a" : "div";
            return (
              <Tag key={i} href={it.href ? resolveHref(it.href, ctx) : undefined} className="card card-hover flex flex-col items-center gap-3 p-6 text-center">
                <span className="icon-bubble"><Icon name={it.icon} size={30} /></span>
                <span className="text-lg font-semibold text-[var(--heading)]">{lt(it.title, locale)}</span>
                {lt(it.text, locale) ? <span className="text-sm text-[var(--fg-muted)]">{lt(it.text, locale)}</span> : null}
              </Tag>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* ------------------------------ stats ------------------------------ */
export function StatsBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  const layout = content.layout || "divided";
  return (
    <Section block={block} style={style}>
      <div className={cn("grid grid-cols-2 gap-6", gridCols(content.columns), layout === "divided" && "divide-x divide-[var(--card-border)] rtl:divide-x-reverse gap-0")}>
        {(content.items || []).map((it: any, i: number) => (
          <div key={i} className={cn("flex flex-col items-center text-center", layout === "cards" && "card p-6", layout === "divided" && "px-4 py-2")}>
            {it.icon ? <span className="mb-2 text-[var(--sec-accent)]"><Icon name={it.icon} size={30} /></span> : null}
            <div className="text-[clamp(2rem,1.5rem+2vw,3.2rem)] font-bold leading-none text-[var(--heading)]">
              <Counter value={Number(it.value) || 0} suffix={it.suffix || ""} animate={content.animate !== false && !ctx.preview} />
            </div>
            <div className="mt-2 text-[var(--fg-muted)]">{lt(it.label, locale)}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ steps ------------------------------ */
export function StepsBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  const items = content.items || [];
  const vertical = content.layout === "vertical";
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      <ol className={cn("relative grid gap-6", vertical ? "grid-cols-1 max-w-3xl" : "md:grid-cols-2 lg:grid-cols-4")}>
        {items.map((it: any, i: number) => (
          <li key={i} className={cn("relative text-start", vertical && "flex gap-5")}>
            <div className="flex-none">
              <div className="icon-bubble"><Icon name={it.icon} size={26} /></div>
              {vertical && i < items.length - 1 ? <div className="mx-auto mt-2 h-full w-px bg-[var(--card-border)]" /> : null}
            </div>
            <div className={cn(!vertical && "mt-4", vertical && "pb-6")}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[.12em] text-[var(--sec-accent)]" dir="ltr">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="text-xl text-[var(--heading)]">{lt(it.title, locale)}</h3>
              <p className="mt-1.5 text-[var(--fg-muted)]">{lt(it.text, locale)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------ cta ------------------------------ */
export function CtaBlock({ block, content, style, ctx }: BlockProps) {
  const { locale, settings } = ctx;
  const phone = settings.contact.phones[0]?.number;
  const split = content.layout === "split";
  return (
    <Section block={block} style={style}>
      <div className={cn("flex flex-col gap-6", split ? "lg:flex-row lg:items-center lg:justify-between" : "items-center text-center")}>
        <div className="max-w-2xl">
          <h2 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] text-[var(--heading)]">{lt(content.title, locale)}</h2>
          {lt(content.text, locale) ? <p className="mt-3 text-[1.05em] text-[var(--fg-muted)]">{lt(content.text, locale)}</p> : null}
          {content.showPhone && phone ? (
            <a href={telHref(phone)} dir="ltr" className="mt-4 inline-flex items-center gap-3 text-[clamp(1.5rem,1.2rem+1.5vw,2.2rem)] font-bold tracking-wide text-[var(--sec-accent)] hover:underline">
              <Phone size={30} /> {phone}
            </a>
          ) : null}
        </div>
        <Buttons buttons={content.buttons} ctx={ctx} size="lg" className={cn(!split && "justify-center")} />
      </div>
    </Section>
  );
}

/* ------------------------------ rich text ------------------------------ */
export function RichTextBlock({ block, content, style, ctx }: BlockProps) {
  const body = lt(content.body, ctx.locale);
  return (
    <Section block={block} style={style}>
      <div className={cn(content.maxWidth === "narrow" && "mx-auto max-w-3xl")}>
        <SectionHeading content={content} ctx={ctx} className="mb-6" />
        <div className={cn("rich text-[1.05em]", content.twoColumns && "md:columns-2 md:gap-10")} dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    </Section>
  );
}

/* ------------------------------ testimonials ------------------------------ */
export function TestimonialsBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      <div className={cn("grid grid-cols-1 gap-5", gridCols(content.columns))}>
        {(content.items || []).map((it: any, i: number) => (
          <figure key={i} className="card relative p-7 text-start">
            <Quote className="absolute end-6 top-6 opacity-15" size={44} />
            {it.rating ? (
              <div className="mb-3 flex gap-0.5 text-[var(--sec-accent)]" dir="ltr">
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={18} fill={s < Number(it.rating) ? "currentColor" : "none"} />)}
              </div>
            ) : null}
            <blockquote className="text-[1.05em] leading-relaxed">“{lt(it.quote, locale)}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              {it.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-primary)] text-lg font-bold text-white">{(lt(it.name, locale) || "?").slice(0, 1)}</span>
              )}
              <div>
                <div className="font-semibold text-[var(--heading)]">{lt(it.name, locale)}</div>
                <div className="text-sm text-[var(--fg-muted)]">{lt(it.role, locale)}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ partners ------------------------------ */
export function PartnersBlock({ block, content, style, ctx }: BlockProps) {
  const items = (content.items || []).filter((i: any) => i.logoUrl);
  if (!items.length && !ctx.preview) return null;
  const title = lt(content.title, ctx.locale);
  const Logo = ({ it }: { it: any }) => {
    const Tag = it.href ? "a" : "span";
    return (
      <Tag href={it.href || undefined} target={it.href ? "_blank" : undefined} rel="noopener" className={cn("flex h-20 w-44 flex-none items-center justify-center px-4 transition", content.grayscale && "opacity-60 grayscale hover:opacity-100 hover:grayscale-0")} title={it.name}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={it.logoUrl} alt={it.name || ""} className="max-h-16 w-auto object-contain" loading="lazy" />
      </Tag>
    );
  };
  return (
    <Section block={block} style={style} noWrap>
      {title ? <h2 className="wrap wrap-default mb-6 text-center text-lg font-bold text-[var(--fg-muted)]">{title}</h2> : null}
      {content.marquee && items.length > 3 ? (
        <div className="marquee overflow-hidden" style={{ "--marquee-speed": "35s" } as any}>
          <div className="marquee-track gap-6">
            {[...items, ...items].map((it: any, i: number) => <Logo key={i} it={it} />)}
          </div>
        </div>
      ) : (
        <div className="wrap wrap-default flex flex-wrap justify-center gap-4">{items.map((it: any, i: number) => <Logo key={i} it={it} />)}</div>
      )}
      {!items.length ? <p className="text-center text-sm text-[var(--fg-muted)]">{ctx.locale === "ar" ? "أضف شعارات من لوحة التحكم" : "Add logos from the admin panel"}</p> : null}
    </Section>
  );
}

/* ------------------------------ faq ------------------------------ */
export function FaqBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      <div className="faq mx-auto grid max-w-3xl gap-3">
        {(content.items || []).map((it: any, i: number) => (
          <details key={i} className="card group px-6 py-4 text-start">
            <summary className="flex items-center justify-between gap-4 text-lg font-semibold text-[var(--heading)]">
              {lt(it.q, locale)}
              <ChevronDown className="faq-chevron flex-none transition" />
            </summary>
            <p className="mt-3 text-[var(--fg-muted)]">{lt(it.a, locale)}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ team ------------------------------ */
export function TeamBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      <div className={cn("grid grid-cols-1 gap-5", gridCols(content.columns))}>
        {(content.items || []).map((m: any, i: number) => (
          <div key={i} className="card card-hover overflow-hidden text-center">
            <div className="aspect-square bg-black/5">
              {m.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photoUrl} alt={lt(m.name, locale)} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-bold text-[var(--c-primary)]/30">{(lt(m.name, locale) || "?").slice(0, 1)}</div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg text-[var(--heading)]">{lt(m.name, locale)}</h3>
              <div className="text-sm text-[var(--fg-muted)]">{lt(m.role, locale)}</div>
              <div className="mt-3 flex justify-center gap-2">
                {m.phone ? <a href={telHref(m.phone)} className="icon-bubble !h-10 !w-10" aria-label={t(locale, "phone")}><Phone size={18} /></a> : null}
                {m.email ? <a href={`mailto:${m.email}`} className="icon-bubble !h-10 !w-10" aria-label={t(locale, "email")}><Mail size={18} /></a> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ marquee ------------------------------ */
export function MarqueeBlock({ block, content, style, ctx }: BlockProps) {
  const items = content.items || [];
  const sep = content.separator || "✦";
  return (
    <Section block={block} style={style} noWrap>
      <div className="marquee overflow-hidden" style={{ "--marquee-speed": `${content.speed || 35}s` } as any}>
        <div className="marquee-track items-center gap-8 whitespace-nowrap text-[1.1em] font-semibold">
          {[...items, ...items].map((it: any, i: number) => (
            <span key={i} className="inline-flex items-center gap-8">
              {lt(it.text, ctx.locale)}
              <span className="opacity-60">{sep}</span>
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ image ------------------------------ */
export function ImageBlock({ block, content, style, ctx }: BlockProps) {
  const alt = lt(content.alt, ctx.locale);
  const caption = lt(content.caption, ctx.locale);
  const img = content.url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={content.url} alt={alt} loading="lazy" className={cn("w-full", content.rounded && content.width !== "full" && "rounded-[var(--radius)]")} />
  ) : null;
  return (
    <Section block={block} style={style} noWrap={content.width === "full"}>
      <figure>
        {content.href ? <a href={resolveHref(content.href, ctx)}>{img}</a> : img}
        {caption ? <figcaption className="mt-3 text-center text-[var(--fg-muted)]">{caption}</figcaption> : null}
      </figure>
    </Section>
  );
}

/* ------------------------------ spacer ------------------------------ */
export function SpacerBlock({ block, content, style }: BlockProps) {
  return (
    <Section block={block} style={{ ...style, paddingY: "none", animation: "none" }} tag="div">
      <div style={{ height: Number(content.height) || 0 }} className={cn("flex items-center")}>
        {content.line ? <hr className="w-full border-[var(--card-border)]" /> : null}
      </div>
    </Section>
  );
}

/* ------------------------------ html ------------------------------ */
export function HtmlBlock({ block, content, style }: BlockProps) {
  return (
    <Section block={block} style={style}>
      <div dangerouslySetInnerHTML={{ __html: content.code || "" }} />
    </Section>
  );
}

export { isVideoUrl };
