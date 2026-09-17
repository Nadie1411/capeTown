import { asset } from "@/lib/base";
import type { Locale, ServiceData, SiteSettings } from "@/lib/types";
import { localePath, lt, t } from "@/lib/i18n";
import { cn, telHref, waHref } from "@/lib/utils";
import { SocialLinks } from "./social-icons";

export function SiteFooter({ settings, locale, services }: { settings: SiteSettings; locale: Locale; services: ServiceData[] }) {
  const f = settings.footer;
  const c = settings.contact;
  const dark = f.style !== "light";
  const logo = dark ? settings.brand.logoWhiteUrl || settings.brand.logoUrl : settings.brand.logoUrl;
  const year = String(new Date().getFullYear());
  const copyright = lt(f.copyright, locale).replace("{year}", year);
  return (
    <footer
      className={cn("sec relative mt-auto overflow-hidden", dark ? "text-white" : "text-[var(--c-text)]")}
      data-tone={dark ? "dark" : "light"}
      style={{ background: f.style === "primary" ? "var(--c-primary)" : f.style === "dark" ? "var(--c-text)" : "var(--c-surface)" }}
    >
      <div className="wrap wrap-default relative pt-14 lg:pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            {f.showLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(logo)} alt={lt(settings.brand.name, locale)} className="mb-5 h-16 w-auto" />
            ) : null}
            <div className="font-medium">{lt(settings.brand.name, locale)}</div>
            <p className="mt-3 max-w-sm text-[.95em] leading-relaxed opacity-75">{lt(f.about, locale)}</p>
            {f.showSocial ? <SocialLinks social={c.social} className="mt-6" itemClassName="!h-10 !w-10" /> : null}
          </div>
          {f.showQuickLinks ? (
            <div className="lg:col-span-2">
              <div className="mb-5 text-[.8rem] font-semibold uppercase tracking-wider opacity-60 rtl:tracking-normal">{lt(f.quickLinksTitle, locale)}</div>
              <ul className="grid gap-2.5">
                {settings.header.nav.map((n, i) => (
                  <li key={i}><a href={localePath(locale, n.href)} className="hover:opacity-70">{lt(n.label, locale)}</a></li>
                ))}
              </ul>
            </div>
          ) : null}
          {f.showServices ? (
            <div className="lg:col-span-3">
              <div className="mb-5 text-[.8rem] font-semibold uppercase tracking-wider opacity-60 rtl:tracking-normal">{lt(f.servicesTitle, locale)}</div>
              <ul className="grid gap-2.5">
                {services.slice(0, 8).map((s) => (
                  <li key={s.id}><a href={localePath(locale, `/services/${s.slug}`)} className="hover:opacity-70">{lt(s.title, locale)}</a></li>
                ))}
              </ul>
            </div>
          ) : null}
          {f.showContact ? (
            <div className="lg:col-span-3">
              <div className="mb-5 text-[.8rem] font-semibold uppercase tracking-wider opacity-60 rtl:tracking-normal">{lt(f.contactTitle, locale)}</div>
              <ul className="grid gap-4 text-[.98em]">
                {c.phones.map((p, i) => (
                  <li key={i}><div className="text-xs opacity-60">{lt(p.label, locale)}</div><a href={telHref(p.number)} className="mt-0.5 block text-lg font-semibold hover:opacity-70" dir="ltr">{p.number}</a></li>
                ))}
                {c.whatsapp ? <li><div className="text-xs opacity-60">{t(locale, "whatsapp")}</div><a href={waHref(c.whatsapp, lt(c.whatsappMessage, locale))} target="_blank" rel="noopener" className="mt-0.5 block hover:opacity-70" dir="ltr">{c.whatsapp}</a></li> : null}
                {c.email ? <li><div className="text-xs opacity-60">{t(locale, "email")}</div><a href={`mailto:${c.email}`} className="mt-0.5 block hover:opacity-70" dir="ltr">{c.email}</a></li> : null}
                {lt(c.address, locale) ? <li><div className="text-xs opacity-60">{t(locale, "address")}</div><a href={c.mapLink || "#"} target="_blank" rel="noopener" className="mt-0.5 block hover:opacity-70">{lt(c.address, locale)}</a></li> : null}
                {f.showHours && lt(c.hours, locale) ? <li><div className="text-xs opacity-60">{t(locale, "hours")}</div><div className="mt-0.5">{lt(c.hours, locale)}</div></li> : null}
              </ul>
            </div>
          ) : null}
        </div>
        {f.showMap && c.mapEmbedUrl ? (
          <div className="mt-12 overflow-hidden border border-[var(--line-cur)]">
            <iframe src={c.mapEmbedUrl} className="h-64 w-full" loading="lazy" title="map" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        ) : null}
        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--line-cur)] py-5 text-[.85rem] opacity-70 md:flex-row md:items-center md:justify-between">
          <div>{copyright}{c.licenseNo ? ` — ${t(locale, "licenseNo")}: ${c.licenseNo}` : ""}</div>
          <div className="flex flex-wrap gap-5">
            {f.bottomLinks.map((n, i) => (
              <a key={i} href={localePath(locale, n.href)} className="hover:opacity-70">{lt(n.label, locale)}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
