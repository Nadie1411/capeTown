import { lt, t } from "@/lib/i18n";
import { cn, telHref, waHref } from "@/lib/utils";
import { Section, SectionHeading, type BlockProps } from "./shared";
import { ContactForm } from "./client/contact-form";
import { SocialLinks } from "@/components/site/social-icons";
import { Clock, Mail, MapPin, MessageCircle, Phone, ExternalLink } from "lucide-react";

export function ContactInfo({ ctx, compact = false }: { ctx: BlockProps["ctx"]; compact?: boolean }) {
  const { settings, locale } = ctx;
  const c = settings.contact;
  const rows: { icon: any; label: string; value: React.ReactNode; href?: string }[] = [];
  c.phones.forEach((p) => rows.push({ icon: Phone, label: lt(p.label, locale) || t(locale, "phone"), value: <span dir="ltr">{p.number}</span>, href: telHref(p.number) }));
  if (c.whatsapp) rows.push({ icon: MessageCircle, label: t(locale, "whatsapp"), value: <span dir="ltr">{c.whatsapp}</span>, href: waHref(c.whatsapp, lt(c.whatsappMessage, locale)) });
  if (c.email) rows.push({ icon: Mail, label: t(locale, "email"), value: <span dir="ltr">{c.email}</span>, href: `mailto:${c.email}` });
  if (lt(c.address, locale)) rows.push({ icon: MapPin, label: t(locale, "address"), value: lt(c.address, locale), href: c.mapLink || undefined });
  if (lt(c.hours, locale)) rows.push({ icon: Clock, label: t(locale, "hours"), value: lt(c.hours, locale) });
  return (
    <ul className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2 lg:grid-cols-1")}>
      {rows.map((r, i) => {
        const Inner = (
          <>
            <span className="icon-bubble !h-12 !w-12 flex-none"><r.icon size={22} /></span>
            <span className="min-w-0">
              <span className="block text-sm text-[var(--fg-muted)]">{r.label}</span>
              <span className="block break-words text-[1.05em] font-semibold text-[var(--heading)]">{r.value}</span>
            </span>
          </>
        );
        return (
          <li key={i}>
            {r.href ? (
              <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="card card-hover flex items-center gap-4 p-4 text-start">{Inner}</a>
            ) : (
              <div className="card flex items-center gap-4 p-4 text-start">{Inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ContactBlock({ block, content, style, ctx }: BlockProps) {
  const { settings, locale, services } = ctx;
  const showForm = content.showForm !== false;
  const showInfo = content.showInfo !== false;
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      <div className={cn("grid gap-10", showForm && showInfo && "lg:grid-cols-5")}>
        {showForm ? (
          <div className={cn("card p-6 sm:p-8 text-start", showInfo && "lg:col-span-3")}>
            {lt(content.formTitle, locale) ? <h3 className="mb-6 text-2xl text-[var(--heading)]">{lt(content.formTitle, locale)}</h3> : null}
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
        ) : null}
        {showInfo ? (
          <div className={cn(showForm && "lg:col-span-2")}>
            <ContactInfo ctx={ctx} />
            {settings.footer.showSocial ? <div className="mt-6"><SocialLinks social={settings.contact.social} className="justify-start" /></div> : null}
          </div>
        ) : null}
      </div>
      {content.showMap && settings.contact.mapEmbedUrl ? (
        <div className="mt-10 overflow-hidden rounded-[var(--radius)] border border-[var(--card-border)]">
          <iframe src={settings.contact.mapEmbedUrl} className="h-[380px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="map" allowFullScreen />
          {settings.contact.mapLink ? (
            <a href={settings.contact.mapLink} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 bg-[var(--card-bg)] py-3 font-bold text-[var(--c-primary)] hover:underline">
              <ExternalLink size={18} /> {t(locale, "openMap")}
            </a>
          ) : null}
        </div>
      ) : null}
    </Section>
  );
}

export function MapBlock({ block, content, style, ctx }: BlockProps) {
  const url = content.embedUrl || ctx.settings.contact.mapEmbedUrl;
  if (!url) return null;
  return (
    <Section block={block} style={style} noWrap={style.container === "full"}>
      <iframe src={url} className={cn("w-full", style.container !== "full" && "rounded-[var(--radius)]")} style={{ height: Number(content.height) || 420 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="map" allowFullScreen />
    </Section>
  );
}
