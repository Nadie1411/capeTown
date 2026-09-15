"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale, SiteSettings } from "@/lib/types";
import { localePath, lt, switchLocalePath, t } from "@/lib/i18n";
import { cn, telHref, waHref } from "@/lib/utils";
import { Menu, Phone, X, Globe, MessageCircle, Mail, Clock } from "lucide-react";
import { SocialLinks } from "./social-icons";

export function SiteHeader({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";
  const h = settings.header;
  const transparent = h.style === "transparent" && !scrolled;
  const dark = h.style === "dark";
  const phone = settings.contact.phones[0]?.number;
  const logo = dark || transparent ? settings.brand.logoWhiteUrl || settings.brand.logoUrl : settings.brand.logoUrl;
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const showLang = h.showLangSwitch && settings.locales.enabled.length > 1;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => {
    const p = localePath(locale, href);
    return p === pathname || (href !== "/" && pathname.startsWith(p + "/"));
  };

  return (
    <div className={cn("z-50 w-full", h.style === "transparent" ? "fixed inset-x-0 top-0" : h.sticky && "sticky top-0", transparent && "text-white")}>
      {h.showTopBar && h.style !== "transparent" ? (
        <div className="hidden bg-[var(--c-primary-dark)] text-[.9em] text-white md:block">
          <div className="wrap wrap-default flex items-center justify-between gap-4 py-1.5">
            <div className="flex items-center gap-5">
              {phone ? <a href={telHref(phone)} className="inline-flex items-center gap-1.5 font-medium hover:underline"><Phone size={16} /><span dir="ltr">{phone}</span></a> : null}
              {settings.contact.email ? <a href={`mailto:${settings.contact.email}`} className="inline-flex items-center gap-1.5 hover:underline"><Mail size={16} /><span dir="ltr">{settings.contact.email}</span></a> : null}
              {lt(settings.contact.hours, locale) ? <span className="inline-flex items-center gap-1.5 opacity-90"><Clock size={16} />{lt(settings.contact.hours, locale)}</span> : null}
            </div>
            <div className="flex items-center gap-4">
              {lt(h.topBarText, locale) ? <span className="text-[var(--c-accent)]">{lt(h.topBarText, locale)}</span> : null}
              <SocialLinks social={settings.contact.social} className="gap-1" itemClassName="!h-8 !w-8 !bg-white/10 !text-white [&_svg]:h-4 [&_svg]:w-4" />
            </div>
          </div>
        </div>
      ) : null}

      <header className={cn("transition-colors", transparent ? "bg-transparent" : dark ? "header-dark" : "header-solid")}>
        <div className="wrap wrap-default flex items-center justify-between gap-4 py-2.5">
          <a href={localePath(locale, "/")} className="flex items-center gap-3" aria-label={lt(settings.brand.name, locale)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={lt(settings.brand.name, locale)} style={{ "--logo-h": `${h.logoHeight || 60}px` } as any} className="h-12 w-auto md:h-[var(--logo-h)]" />
            {h.showBrandName ? <span className="hidden max-w-[14rem] text-[.95em] font-extrabold leading-tight xl:block">{lt(settings.brand.shortName, locale)}</span> : null}
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="main">
            {h.nav.map((item, i) => (
              <a key={i} href={localePath(locale, item.href)} target={item.newTab ? "_blank" : undefined} className="nav-link text-[1.02em]" aria-current={isActive(item.href) ? "page" : undefined}>
                {lt(item.label, locale)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {h.showPhone && phone ? (
              <a href={telHref(phone)} className={cn("hidden items-center gap-2 rounded-[var(--btn-radius)] border px-3 py-2 font-medium md:inline-flex", dark || transparent ? "border-white/40 text-white" : "border-[var(--c-primary)]/20 text-[var(--c-primary)]")}>
                <Phone size={20} className="text-[var(--c-accent)]" />
                <span dir="ltr">{phone}</span>
              </a>
            ) : null}
            {h.showCta ? (
              <a href={localePath(locale, h.ctaHref || "/contact")} className={cn("btn btn-sm hidden md:inline-flex", dark || transparent ? "btn-secondary" : "btn-primary", settings.brand.buttonStyle === "pill" && "btn-pill")}>
                {lt(h.ctaLabel, locale)}
              </a>
            ) : null}
            {showLang ? (
              <a href={switchLocalePath(pathname, otherLocale)} className={cn("inline-flex items-center gap-1.5 rounded-[var(--btn-radius)] px-2.5 py-2 text-[.95em] font-medium", dark || transparent ? "hover:bg-white/10" : "hover:bg-black/5")} lang={otherLocale} dir={otherLocale === "ar" ? "rtl" : "ltr"} aria-label={t(locale, "language")}>
                <Globe size={20} /> {t(locale, "language")}
              </a>
            ) : null}
            <button className={cn("rounded-[var(--btn-radius)] p-2.5 lg:hidden", dark || transparent ? "hover:bg-white/10" : "hover:bg-black/5")} onClick={() => setOpen(true)} aria-label={t(locale, "menu")} aria-expanded={open}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <div className={cn("fixed inset-0 z-[60] lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div className={cn("absolute inset-0 bg-black/50 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <div className={cn("absolute inset-y-0 end-0 flex w-[min(22rem,88vw)] flex-col bg-white text-[var(--c-text)] shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "rtl:-translate-x-full ltr:translate-x-full")}>
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.brand.logoUrl} alt="" className="h-12 w-auto" />
            <button className="rounded-lg p-2 hover:bg-black/5" onClick={() => setOpen(false)} aria-label={t(locale, "close")}><X size={28} /></button>
          </div>
          <nav className="flex flex-col p-3" aria-label="mobile">
            {h.nav.map((item, i) => (
              <a key={i} href={localePath(locale, item.href)} className={cn("rounded-xl px-4 py-3.5 text-[1.1em] font-medium", isActive(item.href) ? "bg-[var(--c-primary)]/10 text-[var(--c-primary)]" : "hover:bg-black/5")}>
                {lt(item.label, locale)}
              </a>
            ))}
            {showLang ? (
              <a href={switchLocalePath(pathname, otherLocale)} className="mt-1 inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-[1.05em] font-medium hover:bg-black/5" lang={otherLocale}>
                <Globe size={20} /> {t(locale, "language")}
              </a>
            ) : null}
          </nav>
          <div className="mt-auto grid gap-2 border-t border-black/10 p-4">
            {phone ? <a href={telHref(phone)} className="btn btn-primary btn-lg"><Phone size={22} /><span dir="ltr">{phone}</span></a> : null}
            {settings.contact.whatsapp ? <a href={waHref(settings.contact.whatsapp, lt(settings.contact.whatsappMessage, locale))} target="_blank" rel="noopener" className="btn btn-whatsapp btn-lg"><MessageCircle size={22} />{t(locale, "whatsapp")}</a> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
