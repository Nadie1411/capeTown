import type { Block, BlockStyle, LText, LinkItem, Locale, ProjectData, ServiceData, SiteSettings } from "@/lib/types";
import { localePath, lt, makeT } from "@/lib/i18n";
import { cn, isVideoUrl, rgba, telHref, waHref } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import type { CSSProperties, ReactNode } from "react";

export interface RenderContext {
  locale: Locale;
  settings: SiteSettings;
  services: ServiceData[];
  projects: ProjectData[];
  preview?: boolean;
  pageTitle?: LText;
  pageSlug?: string;
}

export interface BlockProps<T = any> {
  block: Block;
  content: T;
  style: BlockStyle;
  ctx: RenderContext;
}

/* ------------------------------ links ------------------------------ */

export function resolveHref(href: string, ctx: RenderContext) {
  const { settings, locale } = ctx;
  const h = (href || "").trim();
  if (!h) return "#";
  if (h === "tel:" || h === "tel") return telHref(settings.contact.phones[0]?.number || settings.contact.whatsapp);
  if (h.startsWith("tel:")) return telHref(h.slice(4));
  if (h === "whatsapp:" || h === "whatsapp") return waHref(settings.contact.whatsapp, lt(settings.contact.whatsappMessage, locale));
  if (h.startsWith("whatsapp:")) return waHref(h.slice(9), lt(settings.contact.whatsappMessage, locale));
  if (h === "mailto:" || h === "mailto") return `mailto:${settings.contact.email}`;
  if (h.startsWith("/")) return localePath(locale, h);
  return h;
}

export function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function Icon({ name, className, size = 24, strokeWidth = 2 }: { name?: string; className?: string; size?: number; strokeWidth?: number }) {
  const C = getIcon(name);
  if (!C) return null;
  return <C className={className} size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function LinkButton({ item, ctx, size = "md", className }: { item: LinkItem; ctx: RenderContext; size?: "sm" | "md" | "lg"; className?: string }) {
  const href = resolveHref(item.href, ctx);
  const label = lt(item.label, ctx.locale);
  const shape = ctx.settings.brand.buttonStyle;
  const ext = isExternal(href) && !href.startsWith("tel:");
  const icon = item.icon || (item.style === "whatsapp" ? "MessageCircle" : item.style === "call" ? "Phone" : "");
  return (
    <a
      href={href}
      target={item.newTab || (ext && href.startsWith("https://wa.me")) ? "_blank" : undefined}
      rel={ext ? "noopener noreferrer" : undefined}
      className={cn("btn", `btn-${item.style || "primary"}`, size === "lg" && "btn-lg", size === "sm" && "btn-sm", shape === "pill" && "btn-pill", shape === "square" && "btn-square", className)}
    >
      {icon ? <Icon name={icon} size={20} /> : null}
      <span>{label}</span>
    </a>
  );
}

export function Buttons({ buttons, ctx, size = "lg", className }: { buttons?: LinkItem[]; ctx: RenderContext; size?: "sm" | "md" | "lg"; className?: string }) {
  if (!buttons?.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {buttons.map((b, i) => (
        <LinkButton key={i} item={b} ctx={ctx} size={size} />
      ))}
    </div>
  );
}

/* ------------------------------ headings ------------------------------ */

export function SectionHeading({ content, ctx, className, as = "h2" }: { content: { eyebrow?: LText; title?: LText; subtitle?: LText }; ctx: RenderContext; className?: string; as?: "h1" | "h2" }) {
  const eyebrow = lt(content.eyebrow, ctx.locale);
  const title = lt(content.title, ctx.locale);
  const subtitle = lt(content.subtitle, ctx.locale);
  if (!eyebrow && !title && !subtitle) return null;
  const H = as;
  return (
    <div className={cn("sec-head mb-10 max-w-3xl", className)}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      {title ? <H className="sec-title">{title}</H> : null}
      {subtitle ? <p className="sec-sub">{subtitle}</p> : null}
    </div>
  );
}

/* ------------------------------ media ------------------------------ */

export function MediaView({ url, poster, alt = "", className, imgClassName, autoPlay = true, controls = false, cover = true }: { url: string; poster?: string; alt?: string; className?: string; imgClassName?: string; autoPlay?: boolean; controls?: boolean; cover?: boolean }) {
  if (!url) return null;
  if (isVideoUrl(url)) {
    return (
      <video className={cn(cover && "h-full w-full object-cover", className)} src={url} poster={poster || undefined} autoPlay={autoPlay} muted={autoPlay} loop={autoPlay} playsInline controls={controls} preload="metadata" />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} loading="lazy" className={cn(cover && "h-full w-full object-cover", className, imgClassName)} />;
}

/* ------------------------------ section wrapper ------------------------------ */

const PAD: Record<BlockStyle["paddingY"], string> = { none: "sec-none", sm: "sec-sm", md: "sec-md", lg: "sec-lg", xl: "sec-xl" };
const WRAP: Record<BlockStyle["container"], string> = { narrow: "wrap-narrow", default: "wrap-default", wide: "wrap-wide", full: "wrap-full" };

export function sectionStyle(style: BlockStyle): CSSProperties {
  const s: CSSProperties & Record<string, string> = {};
  if (style.textColor) s["--fg"] = style.textColor;
  if (style.headingColor) s["--heading"] = style.headingColor;
  if (style.accentColor) s["--sec-accent"] = style.accentColor;
  if (style.textColor) s.color = style.textColor;
  const bg = style.background;
  if (bg.type === "color" || bg.type === "pattern") s.background = bg.color;
  if (bg.type === "gradient") s.background = `linear-gradient(${bg.gradientAngle}deg, ${bg.gradientFrom}, ${bg.gradientTo})`;
  if (style.radius === "none") s["--radius"] = "0px";
  if (style.radius === "md") s["--radius"] = "8px";
  if (style.radius === "xl") s["--radius"] = "24px";
  return s;
}

function overlayCss(bg: BlockStyle["background"]) {
  const c = bg.overlayColor || "#000";
  const a = Math.min(1, Math.max(0, bg.overlayOpacity / 100));
  const strong = rgba(c, a), mid = rgba(c, a * 0.92), weak = rgba(c, a * 0.3);
  switch (bg.overlayStyle) {
    case "fade-start":
      return `linear-gradient(to var(--fade-to, right), ${strong} 0%, ${mid} 50%, ${weak} 100%)`;
    case "fade-bottom":
      return `linear-gradient(to top, ${strong} 0%, ${weak} 70%, ${rgba(c, a * 0.25)} 100%)`;
    case "fade-top":
      return `linear-gradient(to bottom, ${strong} 0%, ${weak} 70%, ${rgba(c, a * 0.25)} 100%)`;
    default:
      return strong;
  }
}

export function SectionBackground({ style }: { style: BlockStyle }) {
  const bg = style.background;
  if (bg.type === "image" && bg.mediaUrl) {
    return (
      <>
        <div className="sec-bg" style={{ backgroundImage: `url("${bg.mediaUrl}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: bg.parallax ? "fixed" : undefined }} aria-hidden="true" />
        {bg.overlayColor && bg.overlayOpacity > 0 ? <div className="sec-overlay" style={{ background: overlayCss(bg) }} aria-hidden="true" /> : null}
        {bg.overlayColor && bg.overlayOpacity > 0 && bg.overlayStyle !== "solid" ? <div className="sec-overlay md:hidden" style={{ background: rgba(bg.overlayColor, (bg.overlayOpacity / 100) * 0.6) }} aria-hidden="true" /> : null}
      </>
    );
  }
  if (bg.type === "video" && bg.mediaUrl) {
    return (
      <>
        <div className="sec-bg" aria-hidden="true">
          <video className="h-full w-full object-cover" src={bg.mediaUrl} poster={bg.posterUrl || undefined} autoPlay muted loop playsInline preload="metadata" />
        </div>
        {bg.overlayColor && bg.overlayOpacity > 0 ? <div className="sec-overlay" style={{ background: overlayCss(bg) }} aria-hidden="true" /> : null}
      </>
    );
  }
  if (bg.type === "pattern") {
    return <div className={cn("sec-bg", `bg-pattern-${bg.pattern || "grid"}`)} aria-hidden="true" />;
  }
  return null;
}

export function Section({ block, style, children, className, tag = "section", noWrap = false }: { block: Block; style: BlockStyle; children: ReactNode; className?: string; tag?: "section" | "div" | "header"; noWrap?: boolean }) {
  const Tag = tag;
  return (
    <Tag
      id={style.anchor || undefined}
      data-block-id={block.id}
      data-block-type={block.type}
      data-tone={style.theme}
      data-align={style.align}
      data-reveal={style.animation !== "none" ? style.animation : undefined}
      className={cn("sec", PAD[style.paddingY] || "sec-lg", style.hideOnMobile && "max-md:hidden", style.hideOnDesktop && "md:hidden", style.customClass, className)}
      style={sectionStyle(style)}
    >
      <SectionBackground style={style} />
      {noWrap ? children : <div className={cn("wrap", WRAP[style.container] || "wrap-default", style.align === "center" && "text-center", style.align === "end" && "text-end")}>{children}</div>}
    </Tag>
  );
}

export function useT(ctx: RenderContext) {
  return makeT(ctx.locale);
}

export function gridCols(columns: string | number) {
  const n = Number(columns) || 3;
  return { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[n as 2 | 3 | 4] || "sm:grid-cols-2 lg:grid-cols-3";
}
