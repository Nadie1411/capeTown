import { asset } from "@/lib/base";
import { preload } from "react-dom";
import { lt, localePath, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Buttons, Icon, MediaView, Section, type BlockProps } from "./shared";

const HEIGHT: Record<string, string> = { sm: "min-h-[46svh]", md: "min-h-[64svh]", lg: "min-h-[84svh] lg:min-h-[78vh]", full: "min-h-[calc(100svh-4.5rem)]" };

/** Simple, image-led hero: headline, short text, one strong CTA. */
export function HeroBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const title = lt(content.title, locale);
  const subtitle = lt(content.subtitle, locale);
  const eyebrow = lt(content.eyebrow, locale);
  const split = content.layout === "split";
  const center = content.layout === "center";
  const logo = ctx.settings.brand.logoWhiteUrl || ctx.settings.brand.logoUrl;
  if (style.background.type === "image" && style.background.mediaUrl) preload(asset(style.background.mediaUrl), { as: "image", fetchPriority: "high" });
  if (style.background.type === "video" && style.background.posterUrl) preload(asset(style.background.posterUrl), { as: "image", fetchPriority: "high" });

  return (
    <Section block={block} style={style} tag="header" index={index} locale={locale} className={cn("flex items-end lg:items-center", HEIGHT[content.height] || HEIGHT.lg)}>
      <div className={cn("grid w-full items-center gap-10 pb-12 pt-32 lg:py-24", split && "lg:grid-cols-2", center && "justify-items-center text-center")}>
        <div className={cn("max-w-2xl", center && "mx-auto")}>
          {content.showLogo && logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(logo)} alt="" className="mb-6 h-20 w-auto" />
          ) : null}
          {eyebrow ? <div className="eyebrow mb-4">{eyebrow}</div> : null}
          <h1 className="display display-xl text-[var(--heading)]" data-reveal="fade-up">{title}</h1>
          {subtitle ? <p className="lede mt-5 !text-[var(--fg-muted)]" data-reveal="fade-up" style={{ transitionDelay: "120ms" } as any}>{subtitle}</p> : null}
          <Buttons buttons={content.buttons} ctx={ctx} size="lg" className={cn("mt-8 flex-col sm:flex-row", center && "sm:justify-center")} itemClassName="w-full sm:w-auto" />
          {content.badges?.length ? (
            <ul className={cn("mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[.92em] text-[var(--fg-muted)]", center && "justify-center")}>
              {content.badges.map((b: any, i: number) => (
                <li key={i} className="inline-flex items-center gap-2">
                  <span className="text-[var(--c-accent)]"><Icon name={b.icon} size={18} /></span>
                  {lt(b.text, locale)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {split && content.sideMedia ? (
          <div className="plate aspect-[4/3] w-full shadow-2xl lg:aspect-[5/4]">
            <MediaView url={content.sideMedia} alt={title} priority />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

export function PageHeaderBlock({ block, content, style, ctx, index }: BlockProps) {
  const { locale } = ctx;
  const title = lt(content.title, locale) || lt(ctx.pageTitle, locale);
  const subtitle = lt(content.subtitle, locale);
  return (
    <Section block={block} style={{ ...style, align: "start" }} tag="header" index={index} locale={locale} className="flex min-h-[34svh] flex-col justify-end">
      <div className="max-w-3xl pt-28">
        {content.showBreadcrumb ? (
          <nav className="mb-4 flex items-center gap-2 text-[.9em] text-[var(--fg-muted)]" aria-label="breadcrumb">
            <a href={localePath(locale, "/")} className="hover:text-[var(--heading)]">{t(locale, "home")}</a>
            <span aria-hidden="true">/</span>
            <span>{title}</span>
          </nav>
        ) : null}
        <h1 className="display display-xl text-[var(--heading)]">{title}</h1>
        {subtitle ? <p className="lede mt-4">{subtitle}</p> : null}
      </div>
    </Section>
  );
}
