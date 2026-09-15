import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRenderContext, getServiceBySlug } from "@/lib/content";
import { isLocale, localePath, lt, t } from "@/lib/i18n";
import { stripHtml, telHref, waHref } from "@/lib/utils";
import { Icon } from "@/blocks/render/shared";
import { GalleryGrid } from "@/blocks/render/client/lightbox";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const s = await getServiceBySlug(slug);
  if (!s) return {};
  return { title: lt(s.title, locale), description: lt(s.summary, locale) || stripHtml(lt(s.body, locale)).slice(0, 160), openGraph: s.coverUrl ? { images: [s.coverUrl] } : undefined };
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const [service, ctx] = await Promise.all([getServiceBySlug(slug), getRenderContext()]);
  if (!service) notFound();
  const { settings, services } = ctx;
  const title = lt(service.title, locale);
  const phone = settings.contact.phones[0]?.number;
  const gallery = service.gallery.map((g) => ({ url: g.url, caption: lt(g.caption, locale) }));

  return (
    <>
      <header className="sec sec-lg text-white" data-tone="dark" style={{ background: `linear-gradient(135deg, var(--c-primary), var(--c-secondary))` }}>
        {service.coverUrl ? <div className="sec-bg opacity-25" style={{ backgroundImage: `url("${service.coverUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }} /> : null}
        <div className="wrap wrap-default">
          <nav className="mb-3 text-[.95em] text-white/75" aria-label="breadcrumb">
            <a href={localePath(locale, "/")} className="hover:underline">{t(locale, "home")}</a><span className="mx-2">/</span>
            <a href={localePath(locale, "/services")} className="hover:underline">{t(locale, "ourServices")}</a><span className="mx-2">/</span>
            <span>{title}</span>
          </nav>
          <div className="flex items-center gap-4">
            <span className="icon-bubble !h-16 !w-16 !bg-white/15 !text-white"><Icon name={service.icon} size={34} /></span>
            <h1 className="text-[clamp(1.9rem,1.3rem+2.4vw,3.2rem)] font-black">{title}</h1>
          </div>
          {lt(service.summary, locale) ? <p className="mt-4 max-w-3xl text-[1.1em] text-white/85">{lt(service.summary, locale)}</p> : null}
        </div>
      </header>

      <section className="sec sec-lg" data-tone="light">
        <div className="wrap wrap-default grid gap-12 lg:grid-cols-3">
          <article className="lg:col-span-2">
            {service.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={service.coverUrl} alt={title} className="mb-8 aspect-[16/9] w-full rounded-[var(--radius)] object-cover shadow-lg" />
            ) : null}
            <div className="rich text-[1.08em]" dangerouslySetInnerHTML={{ __html: lt(service.body, locale) }} />
            {gallery.length ? (
              <div className="mt-10">
                <h2 className="mb-4 text-2xl text-[var(--heading)]">{t(locale, "gallery")}</h2>
                <GalleryGrid items={gallery} columns="3" aspect="video" lightbox />
              </div>
            ) : null}
          </article>
          <aside className="space-y-6">
            <div className="card p-6" style={{ background: "var(--c-primary)", color: "#fff", borderColor: "transparent" }}>
              <h3 className="text-xl font-extrabold">{t(locale, "needHelp")}</h3>
              <p className="mt-2 text-white/80">{t(locale, "needHelpText")}</p>
              <div className="mt-5 grid gap-2">
                {phone ? <a href={telHref(phone)} className="btn btn-call btn-lg"><Phone size={22} /><span dir="ltr">{phone}</span></a> : null}
                {settings.contact.whatsapp ? <a href={waHref(settings.contact.whatsapp, `${lt(settings.contact.whatsappMessage, locale)} — ${title}`)} target="_blank" rel="noopener" className="btn btn-whatsapp btn-lg"><MessageCircle size={22} />{t(locale, "whatsapp")}</a> : null}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="mb-3 text-lg font-extrabold text-[var(--heading)]">{t(locale, "otherServices")}</h3>
              <ul className="grid gap-1">
                {services.filter((s) => s.id !== service.id).map((s) => (
                  <li key={s.id}>
                    <a href={localePath(locale, `/services/${s.slug}`)} className="flex items-center gap-3 rounded-lg px-2 py-2 font-semibold hover:bg-[var(--c-surface)]">
                      <span className="text-[var(--c-primary)]"><Icon name={s.icon} size={22} /></span>{lt(s.title, locale)}
                      <ArrowUpRight size={16} className="ms-auto opacity-40 rtl:-scale-x-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
