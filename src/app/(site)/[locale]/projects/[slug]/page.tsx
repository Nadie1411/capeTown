import { asset } from "@/lib/base";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getRenderContext } from "@/lib/content";
import { isLocale, localePath, lt, t } from "@/lib/i18n";
import { stripHtml, telHref, waHref } from "@/lib/utils";
import { GalleryGrid } from "@/blocks/render/client/lightbox";
import { ProjectsGrid } from "@/blocks/render/client/projects-grid";
import { Calendar, MapPin, MessageCircle, Phone, Tag, User } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  return { title: lt(p.title, locale), description: lt(p.summary, locale) || stripHtml(lt(p.body, locale)).slice(0, 160), openGraph: p.coverUrl ? { images: [p.coverUrl] } : undefined };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const [project, ctx] = await Promise.all([getProjectBySlug(slug), getRenderContext()]);
  if (!project) notFound();
  const { settings, projects } = ctx;
  const title = lt(project.title, locale);
  const cat = settings.projectCategories.find((c) => c.key === project.category);
  const phone = settings.contact.phones[0]?.number;
  const media = [project.coverUrl ? { url: project.coverUrl, caption: title } : null, ...project.gallery.map((g) => ({ url: g.url, caption: lt(g.caption, locale) }))].filter(Boolean) as { url: string; caption: string }[];
  const related = projects.filter((p) => p.id !== project.id && p.category === project.category).slice(0, 3);
  const meta = [
    cat ? { icon: Tag, label: t(locale, "category"), value: lt(cat.label, locale) } : null,
    lt(project.location, locale) ? { icon: MapPin, label: t(locale, "location"), value: lt(project.location, locale) } : null,
    project.year ? { icon: Calendar, label: t(locale, "year"), value: project.year } : null,
    project.client ? { icon: User, label: t(locale, "client"), value: project.client } : null,
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <>
      <header className="sec relative flex min-h-[55vh] items-end text-white" data-tone="dark" style={{ background: "var(--c-secondary)" }}>
        {project.coverUrl ? <div className="sec-bg" style={{ backgroundImage: `url("${asset(project.coverUrl)}")`, backgroundSize: "cover", backgroundPosition: "center" }} /> : null}
        <div className="sec-overlay bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="wrap wrap-default py-12">
          <nav className="mono mb-4 text-white/70" aria-label="breadcrumb">
            <a href={localePath(locale, "/")} className="hover:underline">{t(locale, "home")}</a><span className="mx-2">/</span>
            <a href={localePath(locale, "/projects")} className="hover:underline">{t(locale, "ourProjects")}</a><span className="mx-2">/</span>
            <span>{title}</span>
          </nav>
          {cat ? <div className="mb-3"><span className="tag tag-light">{lt(cat.label, locale)}</span></div> : null}
          <h1 className="display display-xl drop-shadow">{title}</h1>
          {lt(project.summary, locale) ? <p className="mt-3 max-w-3xl text-[1.1em] text-white/85">{lt(project.summary, locale)}</p> : null}
        </div>
      </header>

      <section className="sec sec-lg" data-tone="light">
        <div className="wrap wrap-default grid gap-12 lg:grid-cols-3">
          <article className="lg:col-span-2">
            {lt(project.body, locale) ? <div className="rich mb-10 text-[1.08em]" dangerouslySetInnerHTML={{ __html: lt(project.body, locale) }} /> : null}
            {media.length ? (
              <>
                <h2 className="mb-4 text-2xl text-[var(--heading)]">{t(locale, "gallery")}</h2>
                <GalleryGrid items={media} columns="2" aspect="video" lightbox />
              </>
            ) : null}
          </article>
          <aside className="space-y-6">
            {meta.length ? (
              <ul className="card divide-y divide-[var(--card-border)]">
                {meta.map((m, i) => (
                  <li key={i} className="flex items-center gap-4 p-4">
                    <span className="icon-bubble !h-11 !w-11"><m.icon size={20} /></span>
                    <span><span className="block text-sm text-[var(--fg-muted)]">{m.label}</span><span className="font-extrabold text-[var(--heading)]">{m.value}</span></span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="card p-6" style={{ background: "var(--c-primary)", color: "#fff", borderColor: "transparent" }}>
              <h3 className="text-xl font-extrabold">{t(locale, "needHelp")}</h3>
              <p className="mt-2 text-white/80">{t(locale, "needHelpText")}</p>
              <div className="mt-5 grid gap-2">
                {phone ? <a href={telHref(phone)} className="btn btn-call btn-lg"><Phone size={22} /><span dir="ltr">{phone}</span></a> : null}
                {settings.contact.whatsapp ? <a href={waHref(settings.contact.whatsapp, lt(settings.contact.whatsappMessage, locale))} target="_blank" rel="noopener" className="btn btn-whatsapp btn-lg"><MessageCircle size={22} />{t(locale, "whatsapp")}</a> : null}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="sec sec-lg" data-tone="light" style={{ background: "var(--c-surface)" }}>
          <div className="wrap wrap-default">
            <h2 className="sec-title mb-8">{t(locale, "relatedProjects")}</h2>
            <ProjectsGrid projects={related} categories={settings.projectCategories} locale={locale} columns="3" cardStyle="overlay" showFilters={false} showMeta stacked />
          </div>
        </section>
      ) : null}
    </>
  );
}
