import type { Block } from "@/lib/types";
import type { RenderContext } from "./shared";
import { HeroBlock, PageHeaderBlock } from "./hero";
import { AboutBlock, BuildingTypesBlock, CtaBlock, FaqBlock, FeaturesBlock, HtmlBlock, ImageBlock, MarqueeBlock, PartnersBlock, RichTextBlock, SpacerBlock, StatsBlock, StepsBlock, TeamBlock, TestimonialsBlock } from "./content";
import { ProjectsBlock, ServicesBlock } from "./lists";
import { GalleryBlock, VideoBlock } from "./media";
import { ContactBlock, MapBlock } from "./contact";
import { CapabilitiesBlock, HeroEditorialBlock, PortfolioBlock, PrinciplesBlock, ServicesIndexBlock, StartProjectBlock, StoryBlock } from "./editorial";

const RENDERERS: Record<Block["type"], (p: any) => React.ReactNode> = {
  heroEditorial: HeroEditorialBlock,
  servicesIndex: ServicesIndexBlock,
  story: StoryBlock,
  capabilities: CapabilitiesBlock,
  portfolio: PortfolioBlock,
  principles: PrinciplesBlock,
  startProject: StartProjectBlock,
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

export function BlockRenderer({ block, ctx, index }: { block: Block; ctx: RenderContext; index?: number }) {
  const R = RENDERERS[block.type];
  if (!R) return null;
  return <R block={block} content={block.content} style={block.style} ctx={ctx} index={index} />;
}

export function PageRenderer({ blocks, ctx }: { blocks: Block[]; ctx: RenderContext }) {
  const visible = blocks.filter((b) => b.enabled || ctx.preview);
  let n = 0;
  return (
    <>
      {visible.map((b, i) => {
        const index = b.style.numbered ? ++n : undefined;
        return (
          <div key={b.id} className={!b.enabled ? "opacity-40" : undefined} data-block-wrap={b.id}>
            {i === 1 ? <span id="after-hero" /> : null}
            <BlockRenderer block={b} ctx={ctx} index={index} />
          </div>
        );
      })}
    </>
  );
}

export type { RenderContext };
