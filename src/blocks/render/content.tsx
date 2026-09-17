import { asset } from "@/lib/base";
import { lt, t } from "@/lib/i18n";
import { cn, isVideoUrl, telHref } from "@/lib/utils";
import { Buttons, Icon, MediaView, Section, SectionHeading, gridCols, resolveHref, type BlockProps } from "./shared";
import { Counter } from "./client/counter";
import { SnapRow } from "./client/snap-row";
import { ChevronDown, Star, Quote, Phone, Mail } from "lucide-react";

/* ------------------------------ about ------------------------------ */
export function AboutBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const mediaFirst = content.mediaPosition !== "end";
  const body = lt(content.body, locale);
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className={cn("relative lg:col-span-6", mediaFirst ? "lg:order-1" : "lg:order-2")}>
          <div className="plate aspect-[4/3] lg:aspect-[4/5]" data-reveal="clip">
            <MediaView url={content.media} poster={content.mediaPoster} alt={lt(content.title, locale)} />
          </div>
          {content.badge?.show ? (
            <div className="absolute -bottom-5 end-5 rounded-[var(--radius)] bg-[var(--c-primary)] px-5 py-3 text-white shadow-lg">
              <div className="display display-md" dir="ltr">{content.badge.value}</div>
              <div className="mt-0.5 text-sm opacity-90">{lt(content.badge.label, locale)}</div>
            </div>
          ) : null}
        </div>
        <div className={cn("lg:col-span-6", mediaFirst ? "lg:order-2" : "lg:order-1")}>
          <SectionHeading content={content} ctx={ctx} className="mb-5" />
          {body ? <div className="rich text-[1.03em]" dangerouslySetInnerHTML={{ __html: body }} /> : null}
          {content.bullets?.length ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {content.bullets.map((b: any, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-none text-[var(--c-accent)]"><Icon name={b.icon || "CircleCheck"} size={22} /></span>
                  <span className="font-medium">{lt(b.text, locale)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Buttons buttons={content.buttons} ctx={ctx} size="md" className="mt-8" />
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
export function StatsBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const items = content.items || [];
  const layout = content.layout || "divided";
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      {(lt(content.title, locale) || lt(content.eyebrow, locale)) ? <SectionHeading content={content} ctx={ctx} className="mb-8" /> : null}
      <div className={cn("grid grid-cols-2 gap-y-8", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3", layout === "cards" && "gap-4")}>
        {items.map((it: any, i: number) => (
          <div key={i} className={cn("text-start", layout === "cards" ? "card p-6" : "border-s border-[var(--line-cur)] ps-5 lg:ps-6", layout === "divided" && "first:border-s-0 first:ps-0 lg:[&:nth-child(3)]:border-s [&:nth-child(3)]:border-s-0 [&:nth-child(3)]:ps-0 lg:[&:nth-child(3)]:ps-6")}>
            {it.icon ? <span className="mb-3 block text-[var(--c-accent)]"><Icon name={it.icon} size={26} /></span> : null}
            <div className="display display-lg text-[var(--heading)]">
              <Counter value={Number(it.value) || 0} suffix={it.suffix || ""} animate={content.animate !== false && !ctx.preview} />
            </div>
            <div className="mt-2 text-[.95em] text-[var(--fg-muted)]">{lt(it.label, locale)}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ steps ------------------------------ */
export function StepsBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const items = content.items || [];
  const vertical = content.layout === "vertical";
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <SectionHeading content={content} ctx={ctx} />
      {vertical ? (
        <ol className="relative max-w-3xl border-s border-[var(--line-cur)]">
          {items.map((it: any, i: number) => (
            <li key={i} className="relative ps-8 pb-10 last:pb-0">
              <span className="absolute -start-[5px] top-2 h-[9px] w-[9px] rounded-full bg-[var(--c-accent)]" />
              <div className="mono text-[var(--fg-muted)]" dir="ltr">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="display display-sm mt-2 text-[var(--heading)]">{lt(it.title, locale)}</h3>
              <p className="mt-2 max-w-md text-[var(--fg-muted)]">{lt(it.text, locale)}</p>
            </li>
          ))}
        </ol>
      ) : (
        <SnapRow count={items.length} className="lg:grid lg:gap-x-8 lg:overflow-visible lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]" style={{ "--cols": Math.min(items.length, 4) } as any} locale={locale}>
          {items.map((it: any, i: number) => (
            <div key={i} className="relative border-t border-[var(--line-cur)] pt-6">
              <span className="absolute -top-[5px] start-0 h-[9px] w-[9px] rounded-full bg-[var(--c-accent)]" />
              <div className="flex items-center justify-between">
                <div className="mono text-[var(--fg-muted)]" dir="ltr">{String(i + 1).padStart(2, "0")}</div>
                {it.icon ? <span className="text-[var(--fg-muted)]"><Icon name={it.icon} size={20} strokeWidth={1.5} /></span> : null}
              </div>
              <h3 className="display display-sm mt-6 text-[var(--heading)]">{lt(it.title, locale)}</h3>
              <p className="mt-3 text-[var(--fg-muted)]">{lt(it.text, locale)}</p>
            </div>
          ))}
        </SnapRow>
      )}
    </Section>
  );
}

/* ------------------------------ cta ------------------------------ */
export function CtaBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale, settings } = ctx;
  const phone = settings.contact.phones[0]?.number;
  const split = content.layout === "split";
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <div className={cn("flex flex-col gap-8", split ? "lg:flex-row lg:items-center lg:justify-between" : "items-center text-center")}>
        <div className="max-w-2xl">
          <h2 className="display display-lg text-[var(--heading)]">{lt(content.title, locale)}</h2>
          {lt(content.text, locale) ? <p className="lede mt-4">{lt(content.text, locale)}</p> : null}
          {content.showPhone && phone ? (
            <a href={telHref(phone)} dir="ltr" className="display display-md mt-6 inline-flex items-center gap-3 text-[var(--c-accent)] hover:underline">
              <Phone size={26} /> {phone}
            </a>
          ) : null}
        </div>
        <Buttons buttons={content.buttons} ctx={ctx} size="lg" className={cn("w-full flex-col sm:w-auto sm:flex-row", !split && "sm:justify-center")} itemClassName="w-full sm:w-auto" />
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
export function TestimonialsBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const items = content.items || [];
  return (
    <Section block={block} style={style} index={index} locale={locale}>
      <SectionHeading content={content} ctx={ctx} />
      <SnapRow count={items.length} className={cn("lg:grid lg:gap-x-10 lg:overflow-visible", Number(content.columns) === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3")} locale={locale}>
        {items.map((it: any, i: number) => (
          <figure key={i} className="flex flex-col border-t border-[var(--line-cur)] pt-6 text-start">
            <div className="display text-[3rem] leading-none text-[var(--c-accent)]" aria-hidden="true">“</div>
            <blockquote className="display display-sm mt-2 flex-1 text-[var(--heading)]">{lt(it.quote, locale)}</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              {it.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(it.avatarUrl)} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : null}
              <div>
                <div className="font-medium">{lt(it.name, locale)}</div>
                <div className="mono mt-0.5 text-[var(--fg-muted)]">{lt(it.role, locale)}</div>
              </div>
              {it.rating ? <div className="mono ms-auto text-[var(--c-accent)]" dir="ltr">{"★".repeat(Math.min(5, Number(it.rating)))}</div> : null}
            </figcaption>
          </figure>
        ))}
      </SnapRow>
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
        <img src={asset(it.logoUrl)} alt={it.name || ""} className="max-h-16 w-auto object-contain" loading="lazy" />
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
                <img src={asset(m.photoUrl)} alt={lt(m.name, locale)} className="h-full w-full object-cover" loading="lazy" />
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
  const sep = content.separator || "—";
  return (
    <Section block={block} style={style} noWrap>
      <div className="marquee overflow-hidden border-y border-[var(--line-cur)] py-3" style={{ "--marquee-speed": `${content.speed || 40}s` } as any}>
        <div className="marquee-track items-center gap-10 whitespace-nowrap">
          {[...items, ...items].map((it: any, i: number) => (
            <span key={i} className="mono inline-flex items-center gap-10">
              {lt(it.text, ctx.locale)}
              <span className="text-[var(--c-accent)]">{sep}</span>
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
    <img src={asset(content.url)} alt={alt} loading="lazy" className={cn("w-full", content.rounded && content.width !== "full" && "rounded-[var(--radius)]")} />
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
