import { lt, localePath, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Buttons, Icon, MediaView, Section, type BlockProps } from "./shared";
import { ChevronDown } from "lucide-react";

const HEIGHT: Record<string, string> = { sm: "min-h-[40vh]", md: "min-h-[60vh]", lg: "min-h-[78vh]", full: "min-h-[calc(100vh-5rem)]" };

export function HeroBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  const title = lt(content.title, locale);
  const subtitle = lt(content.subtitle, locale);
  const eyebrow = lt(content.eyebrow, locale);
  const split = content.layout === "split";
  const center = content.layout === "center";
  const logo = ctx.settings.brand.logoWhiteUrl || ctx.settings.brand.logoUrl;

  return (
    <Section block={block} style={style} tag="header" className={cn("flex items-center", HEIGHT[content.height] || HEIGHT.lg)}>
      <div className={cn("grid items-center gap-10", split ? "lg:grid-cols-2" : "", center && "justify-items-center text-center")}>
        <div className={cn("max-w-3xl", center && "mx-auto")}>
          {content.showLogo && logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="mb-6 h-24 w-auto" />
          ) : null}
          {eyebrow ? <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-current/25 bg-white/10 px-4 py-1.5 text-[.9em] font-medium backdrop-blur-sm">{eyebrow}</div> : null}
          {title ? <h1 className="text-[clamp(2rem,1.2rem+3.4vw,4rem)] font-bold leading-[1.15] text-[var(--heading)]">{title}</h1> : null}
          {subtitle ? <p className="mt-5 max-w-2xl text-[clamp(1.05rem,1rem+.5vw,1.35rem)] leading-relaxed text-[var(--fg-muted)]">{subtitle}</p> : null}
          <Buttons buttons={content.buttons} ctx={ctx} size="lg" className={cn("mt-8", center && "justify-center")} />
          {content.badges?.length ? (
            <ul className={cn("mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[.95em] font-medium", center && "justify-center")}>
              {content.badges.map((b: any, i: number) => (
                <li key={i} className="inline-flex items-center gap-2">
                  <span className="text-[var(--sec-accent)]"><Icon name={b.icon} size={22} /></span>
                  {lt(b.text, locale)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {split ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius)] shadow-2xl ring-1 ring-white/20 lg:aspect-[5/4]">
            <MediaView url={content.sideMedia} alt={title} />
          </div>
        ) : null}
      </div>
      {content.showScrollHint ? (
        <a href="#after-hero" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center text-xs opacity-80 md:flex" aria-label={t(locale, "scroll")}>
          <span>{t(locale, "scroll")}</span>
          <ChevronDown className="animate-bounce" />
        </a>
      ) : null}
    </Section>
  );
}

export function PageHeaderBlock({ block, content, style, ctx }: BlockProps) {
  const { locale } = ctx;
  const title = lt(content.title, locale) || lt(ctx.pageTitle, locale);
  const subtitle = lt(content.subtitle, locale);
  return (
    <Section block={block} style={style} tag="header">
      {content.showBreadcrumb ? (
        <nav className="mb-3 text-[.95em] text-[var(--fg-muted)]" aria-label="breadcrumb">
          <a href={localePath(locale, "/")} className="hover:underline">{t(locale, "home")}</a>
          <span className="mx-2">/</span>
          <span>{title}</span>
        </nav>
      ) : null}
      <h1 className="text-[clamp(1.9rem,1.3rem+2.4vw,3.2rem)] font-bold text-[var(--heading)]">{title}</h1>
      {subtitle ? <p className="sec-sub">{subtitle}</p> : null}
    </Section>
  );
}
