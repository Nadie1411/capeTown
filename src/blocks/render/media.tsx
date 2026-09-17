import { asset } from "@/lib/base";
import { lt, t } from "@/lib/i18n";
import { cn, youtubeId } from "@/lib/utils";
import { Section, SectionHeading, type BlockProps } from "./shared";
import { GalleryGrid } from "./client/lightbox";

export function GalleryBlock({ block, content, style, ctx }: BlockProps) {
  const items = (content.items || []).filter((i: any) => i.url).map((i: any) => ({ url: i.url, caption: lt(i.caption, ctx.locale) }));
  return (
    <Section block={block} style={style}>
      <SectionHeading content={content} ctx={ctx} />
      {items.length ? <GalleryGrid items={items} columns={String(content.columns || "3")} aspect={content.aspect || "video"} lightbox={content.lightbox !== false} /> : <p className="text-center text-[var(--fg-muted)]">{ctx.locale === "ar" ? "أضف صوراً من لوحة التحكم" : "Add images from the admin panel"}</p>}
    </Section>
  );
}

export function VideoBlock({ block, content, style, ctx }: BlockProps) {
  const yt = content.source === "youtube" ? youtubeId(content.youtubeUrl) : null;
  return (
    <Section block={block} style={style} noWrap={content.maxWidth === "full"}>
      {content.maxWidth !== "full" ? <SectionHeading content={content} ctx={ctx} /> : null}
      <div className={cn("overflow-hidden bg-black", content.maxWidth !== "full" && "rounded-[var(--radius)] shadow-2xl", "aspect-video")}>
        {yt ? (
          <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0${content.autoplay ? "&autoplay=1&mute=1" : ""}${content.loop ? `&loop=1&playlist=${yt}` : ""}`} title={lt(content.title, ctx.locale) || "video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
        ) : content.url ? (
          <video className="h-full w-full" src={asset(content.url)} poster={content.posterUrl ? asset(content.posterUrl) : undefined} controls={content.controls !== false} autoPlay={!!content.autoplay} muted={!!content.autoplay} loop={!!content.loop} playsInline preload="metadata">
            {t(ctx.locale, "videoNotSupported")}
          </video>
        ) : (
          <div className="flex h-full items-center justify-center text-white/60">{ctx.locale === "ar" ? "اختر فيديو من لوحة التحكم" : "Choose a video in the admin panel"}</div>
        )}
      </div>
    </Section>
  );
}
