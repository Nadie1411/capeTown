"use client";
import { asset } from "@/lib/base";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale, SiteSettings } from "@/lib/types";
import { localePath, lt, switchLocalePath, t } from "@/lib/i18n";
import { cn, telHref, waHref } from "@/lib/utils";
import { Phone, X, Mail, Clock, Menu, Globe } from "lucide-react";
import { SocialLinks, SOCIAL_ICONS } from "./social-icons";

export function SiteHeader({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";
  const h = settings.header;
  const transparent = h.style === "transparent" && !scrolled && !open;
  const dark = h.style === "dark";
  const onDark = dark || transparent;
  const phone = settings.contact.phones[0]?.number;
  const logo = onDark ? settings.brand.logoWhiteUrl || settings.brand.logoUrl : settings.brand.logoUrl;
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const showLang = h.showLangSwitch && settings.locales.enabled.length > 1;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => {
    const p = localePath(locale, href);
    return p === pathname || (href !== "/" && pathname.startsWith(p + "/"));
  };

  return (
    <div className={cn("z-50 w-full", h.style === "transparent" ? "fixed inset-x-0 top-0" : h.sticky && "sticky top-0", transparent && "text-white")}>
      {h.showTopBar && h.style !== "transparent" ? (
        <div className={cn("hidden border-b text-[.85rem] md:block", dark ? "border-white/10 bg-[var(--c-primary-dark)] text-white" : "border-[var(--line)] bg-[var(--c-surface)] text-[var(--c-muted)]")}>
          <div className="wrap wrap-default flex items-center justify-between gap-6 py-2">
            <div className="flex items-center gap-6">
              {phone ? <a href={telHref(phone)} className="inline-flex items-center gap-2 hover:text-[var(--c-primary)]"><Phone size={13} /><span dir="ltr">{phone}</span></a> : null}
              {settings.contact.email ? <a href={`mailto:${settings.contact.email}`} className="inline-flex items-center gap-2 hover:text-[var(--c-primary)]"><Mail size={13} /><span dir="ltr">{settings.contact.email}</span></a> : null}
              {lt(settings.contact.hours, locale) ? <span className="inline-flex items-center gap-2"><Clock size={13} />{lt(settings.contact.hours, locale)}</span> : null}
            </div>
            {lt(h.topBarText, locale) ? <span className="text-[var(--c-accent)]">{lt(h.topBarText, locale)}</span> : null}
          </div>
        </div>
      ) : null}

      <header className={cn("transition-colors duration-300", transparent ? "bg-transparent" : dark ? "header-dark" : "header-solid")}>
        <div className="wrap wrap-default flex items-center justify-between gap-6 py-3">
          <a href={localePath(locale, "/")} className="flex items-center gap-3" aria-label={lt(settings.brand.name, locale)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(logo)} alt={lt(settings.brand.name, locale)} style={{ "--logo-h": `${h.logoHeight || 56}px` } as any} className="h-11 w-auto md:h-[var(--logo-h)]" />
            {h.showBrandName ? <span className="hidden max-w-[12rem] text-[.92rem] font-semibold leading-tight xl:block">{lt(settings.brand.shortName, locale)}</span> : null}
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="main">
            {h.nav.map((item, i) => (
              <a key={i} href={localePath(locale, item.href)} target={item.newTab ? "_blank" : undefined} className="nav-link text-[.97em]" aria-current={isActive(item.href) ? "page" : undefined}>
                {lt(item.label, locale)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {h.showPhone && phone ? (
              <a href={telHref(phone)} className="hidden items-center gap-2 text-[.95em] font-semibold hover:text-[var(--c-primary)] md:inline-flex">
                <Phone size={16} className="text-[var(--c-accent)]" />
                <span dir="ltr">{phone}</span>
              </a>
            ) : null}
            {h.showCta ? (
              <a href={localePath(locale, h.ctaHref || "/contact")} className={cn("btn btn-sm hidden md:inline-flex", onDark ? "btn-primary" : "btn-primary", settings.brand.buttonStyle === "pill" && "btn-pill", settings.brand.buttonStyle === "square" && "btn-square")}>
                {lt(h.ctaLabel, locale)}
              </a>
            ) : null}
            {showLang ? (
              <a href={switchLocalePath(pathname, otherLocale)} className="inline-flex items-center gap-1.5 text-[.95em] font-semibold hover:text-[var(--c-primary)]" lang={otherLocale} dir={otherLocale === "ar" ? "rtl" : "ltr"} aria-label={t(locale, "language")}>
                <Globe size={17} className="opacity-70" /> {t(locale, "language")}
              </a>
            ) : null}
            <button className="-me-2 inline-flex h-11 w-11 items-center justify-center rounded-lg lg:hidden" onClick={() => setOpen(true)} aria-label={t(locale, "menu")} aria-expanded={open}>
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* full-screen menu (mobile & tablet) */}
      <div className={cn("fixed inset-0 z-[60] flex flex-col bg-[var(--c-text)] text-white transition-[opacity,visibility] duration-300 lg:hidden", open ? "visible opacity-100" : "invisible opacity-0")} aria-hidden={!open} role="dialog" aria-modal="true">
        <div className="wrap wrap-default relative flex items-center justify-between py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(settings.brand.logoWhiteUrl || settings.brand.logoUrl)} alt="" className="h-11 w-auto" />
          <button className="-me-2 inline-flex h-11 w-11 items-center justify-center rounded-lg" onClick={() => setOpen(false)} aria-label={t(locale, "close")}><X size={26} /></button>
        </div>
        <nav className="wrap wrap-default relative mt-6 flex-1 overflow-y-auto" aria-label="mobile">
          <ol className="border-t border-white/15">
            {h.nav.map((item, i) => (
              <li key={i} className="border-b border-white/15">
                <a href={localePath(locale, item.href)} className={cn("flex items-center justify-between py-4 text-[1.6rem] font-semibold", isActive(item.href) ? "text-[var(--c-accent)]" : "")}>
                  {lt(item.label, locale)}
                  <span className="arrow text-white/40">→</span>
                </a>
              </li>
            ))}
            {showLang ? (
              <li className="border-b border-white/15">
                <a href={switchLocalePath(pathname, otherLocale)} className="flex items-center gap-3 py-4 text-[1.2rem] font-semibold" lang={otherLocale}>
                  <Globe size={20} className="opacity-60" /> {t(locale, "language")}
                </a>
              </li>
            ) : null}
          </ol>
        </nav>
        <div className="wrap wrap-default relative grid gap-3 pb-8 pt-4 sm:grid-cols-2">
          {phone ? <a href={telHref(phone)} className="btn btn-lg !bg-white !text-[var(--c-text)]"><Phone size={20} /><span dir="ltr">{phone}</span></a> : null}
          {settings.contact.whatsapp ? <a href={waHref(settings.contact.whatsapp, lt(settings.contact.whatsappMessage, locale))} target="_blank" rel="noopener" className="btn btn-whatsapp btn-lg [&_svg]:h-5 [&_svg]:w-5">{SOCIAL_ICONS.whatsapp.icon}{t(locale, "whatsapp")}</a> : null}
          <div className="sm:col-span-2 flex items-center justify-between pt-2">
            <span className="text-sm text-white/50">{lt(settings.brand.shortName, locale)}</span>
            <SocialLinks social={settings.contact.social} className="gap-1" itemClassName="!h-9 !w-9 !border-white/20 !text-white [&_svg]:h-4 [&_svg]:w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
