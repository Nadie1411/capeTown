import type { Locale, ServiceData, SiteSettings } from "@/lib/types";
import { localePath, lt, t } from "@/lib/i18n";
import { cn, telHref, waHref } from "@/lib/utils";
import { SocialLinks } from "./social-icons";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function SiteFooter({ settings, locale, services }: { settings: SiteSettings; locale: Locale; services: ServiceData[] }) {
  const f = settings.footer;
  const c = settings.contact;
  const dark = f.style !== "light";
  const logo = dark ? settings.brand.logoWhiteUrl || settings.brand.logoUrl : settings.brand.logoUrl;
  const year = String(new Date().getFullYear());
  const copyright = lt(f.copyright, locale).replace("{year}", year);
  const cols = [f.showQuickLinks, f.showServices, f.showContact].filter(Boolean).length + 1;
  return (
    <footer
      className={cn("sec mt-auto", dark ? "text-white" : "text-[var(--c-text)]")}
      data-tone={dark ? "dark" : "light"}
      style={{ background: f.style === "primary" ? "var(--c-primary)" : f.style === "dark" ? "var(--c-secondary)" : "var(--c-surface)" }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[var(--c-primary)] via-[var(--c-accent)] to-[var(--c-primary)]" aria-hidden="true" />
      <div className="wrap wrap-default py-14">
        <div className={cn("grid gap-10", cols >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
          <div>
            {f.showLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={lt(settings.brand.name, locale)} className="mb-4 h-20 w-auto" />
            ) : null}
            <div className="text-lg font-semibold">{lt(settings.brand.name, locale)}</div>
            <p className="mt-3 max-w-sm text-[.98em] leading-relaxed opacity-80">{lt(f.about, locale)}</p>
            {f.showSocial ? <SocialLinks social={c.social} className="mt-5" /> : null}
          </div>

          {f.showQuickLinks ? (
            <div>
              <h3 className="mb-4 text-lg font-semibold">{lt(f.quickLinksTitle, locale)}</h3>
              <ul className="grid gap-2.5">
                {settings.header.nav.map((n, i) => (
                  <li key={i}><a href={localePath(locale, n.href)} className="opacity-85 hover:opacity-100 hover:underline">{lt(n.label, locale)}</a></li>
                ))}
              </ul>
            </div>
          ) : null}

          {f.showServices ? (
            <div>
              <h3 className="mb-4 text-lg font-semibold">{lt(f.servicesTitle, locale)}</h3>
              <ul className="grid gap-2.5">
                {services.slice(0, 8).map((s) => (
                  <li key={s.id}><a href={localePath(locale, `/services/${s.slug}`)} className="opacity-85 hover:opacity-100 hover:underline">{lt(s.title, locale)}</a></li>
                ))}
              </ul>
            </div>
          ) : null}

          {f.showContact ? (
            <div>
              <h3 className="mb-4 text-lg font-semibold">{lt(f.contactTitle, locale)}</h3>
              <ul className="grid gap-3 text-[.98em]">
                {c.phones.map((p, i) => (
                  <li key={i}><a href={telHref(p.number)} className="inline-flex items-start gap-2 hover:underline"><Phone size={20} className="mt-1 flex-none text-[var(--c-accent)]" /><span><span className="block text-xs opacity-70">{lt(p.label, locale)}</span><span dir="ltr" className="font-medium">{p.number}</span></span></a></li>
                ))}
                {c.whatsapp ? <li><a href={waHref(c.whatsapp, lt(c.whatsappMessage, locale))} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:underline"><MessageCircle size={20} className="flex-none text-[var(--c-accent)]" /><span dir="ltr" className="font-medium">{c.whatsapp}</span></a></li> : null}
                {c.email ? <li><a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 hover:underline"><Mail size={20} className="flex-none text-[var(--c-accent)]" /><span dir="ltr">{c.email}</span></a></li> : null}
                {lt(c.address, locale) ? <li><a href={c.mapLink || "#"} target="_blank" rel="noopener" className="inline-flex items-start gap-2 hover:underline"><MapPin size={20} className="mt-1 flex-none text-[var(--c-accent)]" /><span>{lt(c.address, locale)}</span></a></li> : null}
                {f.showHours && lt(c.hours, locale) ? <li className="inline-flex items-start gap-2"><Clock size={20} className="mt-1 flex-none text-[var(--c-accent)]" /><span>{lt(c.hours, locale)}</span></li> : null}
              </ul>
            </div>
          ) : null}
        </div>

        {f.showMap && c.mapEmbedUrl ? (
          <div className="mt-10 overflow-hidden rounded-[var(--radius)] border border-white/10">
            <iframe src={c.mapEmbedUrl} className="h-64 w-full" loading="lazy" title="map" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/10">
        <div className="wrap wrap-default flex flex-col items-center justify-between gap-3 py-4 text-[.9em] opacity-80 md:flex-row">
          <div>{copyright}{c.licenseNo ? ` — ${t(locale, "licenseNo")}: ${c.licenseNo}` : ""}</div>
          <div className="flex flex-wrap gap-4">
            {f.bottomLinks.map((n, i) => (
              <a key={i} href={localePath(locale, n.href)} className="hover:underline">{lt(n.label, locale)}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
