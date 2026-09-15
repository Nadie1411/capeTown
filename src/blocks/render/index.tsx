import type { Block } from "@/lib/types";
import type { RenderContext } from "./shared";
import { HeroBlock, PageHeaderBlock } from "./hero";
import { AboutBlock, BuildingTypesBlock, CtaBlock, FaqBlock, FeaturesBlock, HtmlBlock, ImageBlock, MarqueeBlock, PartnersBlock, RichTextBlock, SpacerBlock, StatsBlock, StepsBlock, TeamBlock, TestimonialsBlock } from "./content";
import { ProjectsBlock, ServicesBlock } from "./lists";
import { GalleryBlock, VideoBlock } from "./media";
import { ContactBlock, MapBlock } from "./contact";

const RENDERERS: Record<Block["type"], (p: any) => React.ReactNode> = {
  hero: HeroBlock,
  pageHeader: PageHeaderBlock,
  about: AboutBlock,
  services: ServicesBlock,
  projects: ProjectsBlock,
  buildingTypes: BuildingTypesBlock,
  features: FeaturesBlock,
  stats: StatsBlock,
  steps: StepsBlock,
  cta: CtaBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  richText: RichTextBlock,
  testimonials: TestimonialsBlock,
  partners: PartnersBlock,
  faq: FaqBlock,
  contact: ContactBlock,
  map: MapBlock,
  marquee: MarqueeBlock,
  image: ImageBlock,
  spacer: SpacerBlock,
  team: TeamBlock,
  html: HtmlBlock,
};

export function BlockRenderer({ block, ctx }: { block: Block; ctx: RenderContext }) {
  const R = RENDERERS[block.type];
  if (!R) return null;
  return <R block={block} content={block.content} style={block.style} ctx={ctx} />;
}

export function PageRenderer({ blocks, ctx }: { blocks: Block[]; ctx: RenderContext }) {
  const visible = blocks.filter((b) => b.enabled || ctx.preview);
  return (
    <>
      {visible.map((b, i) => (
        <div key={b.id} className={!b.enabled ? "opacity-40" : undefined} data-block-wrap={b.id}>
          {i === 1 ? <span id="after-hero" /> : null}
          <BlockRenderer block={b} ctx={ctx} />
        </div>
      ))}
    </>
  );
}

export type { RenderContext };
