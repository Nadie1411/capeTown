/* ------------------------------------------------------------------ */
/*  Shared types for the site, the admin panel, and the page builder   */
/* ------------------------------------------------------------------ */

export type Locale = "ar" | "en";
export const LOCALES: Locale[] = ["ar", "en"];

/** Bilingual text */
export type LText = { ar: string; en: string };

export type LinkStyle = "primary" | "secondary" | "outline" | "ghost" | "whatsapp" | "call";
export interface LinkItem {
  label: LText;
  href: string;
  style: LinkStyle;
  icon?: string;
  newTab?: boolean;
}

export type BlockType =
  | "heroEditorial"
  | "servicesIndex"
  | "story"
  | "capabilities"
  | "portfolio"
  | "principles"
  | "startProject"
  | "hero"
  | "pageHeader"
  | "about"
  | "services"
  | "projects"
  | "buildingTypes"
  | "features"
  | "stats"
  | "steps"
  | "cta"
  | "gallery"
  | "video"
  | "richText"
  | "testimonials"
  | "partners"
  | "faq"
  | "contact"
  | "map"
  | "marquee"
  | "image"
  | "spacer"
  | "team"
  | "html";

export type BgType = "none" | "color" | "gradient" | "image" | "video" | "pattern";

export interface BlockBackground {
  type: BgType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  mediaUrl: string;
  mobileVideoUrl: string;
  videoOnMobile: boolean;
  posterUrl: string;
  overlayColor: string;
  overlayOpacity: number; // 0..100
  overlayStyle: "solid" | "fade-start" | "fade-bottom" | "fade-top";
  parallax: boolean;
  pattern: "grid" | "dots" | "diagonal";
}

export interface BlockStyle {
  anchor: string;
  sideLabel: LText;
  numbered: boolean;
  showGrid: boolean;
  hairline: boolean;
  theme: "light" | "dark";
  background: BlockBackground;
  textColor: string;
  headingColor: string;
  accentColor: string;
  paddingY: "none" | "sm" | "md" | "lg" | "xl";
  container: "narrow" | "default" | "wide" | "full";
  align: "start" | "center" | "end";
  radius: "inherit" | "none" | "md" | "xl";
  animation: "none" | "fade" | "fade-up";
  hideOnMobile: boolean;
  hideOnDesktop: boolean;
  customClass: string;
}

export interface Block {
  id: string;
  type: BlockType;
  enabled: boolean;
  label: string;
  content: Record<string, any>;
  style: BlockStyle;
}

export interface PageSeo {
  title: LText;
  description: LText;
  ogImageUrl: string;
  noIndex: boolean;
}

export interface PageData {
  id: string;
  slug: string;
  title: LText;
  isHome: boolean;
  published: boolean;
  blocks: Block[];
  seo: PageSeo;
  updatedAt?: string;
}

export interface ServiceData {
  id: string;
  slug: string;
  title: LText;
  summary: LText;
  body: LText;
  icon: string;
  coverUrl: string;
  gallery: MediaRef[];
  order: number;
  featured: boolean;
  published: boolean;
}

export interface ProjectData {
  id: string;
  slug: string;
  title: LText;
  category: string;
  location: LText;
  year: string;
  client: string;
  summary: LText;
  body: LText;
  coverUrl: string;
  gallery: MediaRef[];
  order: number;
  featured: boolean;
  published: boolean;
}

export interface MediaRef {
  url: string;
  kind: "image" | "video";
  posterUrl?: string;
  caption?: LText;
}

export interface MediaData {
  id: string;
  kind: "image" | "video" | "file";
  filename: string;
  url: string;
  thumbUrl: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: LText;
  createdAt: string;
}

export interface LeadData {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  locale: string;
  read: boolean;
  createdAt: string;
}

/* ------------------------------ Settings ------------------------------ */

export interface NavItem {
  label: LText;
  href: string;
  newTab?: boolean;
}

export interface SocialLinks {
  instagram: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  tiktok: string;
  snapchat: string;
  youtube: string;
}

export interface ProjectCategory {
  key: string;
  label: LText;
  icon: string;
}

export interface SiteSettings {
  brand: {
    name: LText;
    shortName: LText;
    tagline: LText;
    logoUrl: string;
    logoWhiteUrl: string;
    logoMarkUrl: string;
    faviconUrl: string;
    ogImageUrl: string;
    primaryColor: string;
    primaryDark: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    mutedColor: string;
    bgColor: string;
    surfaceColor: string;
    fontEn: string;
    fontAr: string;
    fontDisplay: string;
    fontMono: string;
    fontScale: number;
    headingWeight: number;
    radius: "none" | "sm" | "md" | "lg" | "xl";
    buttonStyle: "rounded" | "pill" | "square";
  };
  contact: {
    phones: { label: LText; number: string }[];
    whatsapp: string;
    whatsappMessage: LText;
    email: string;
    address: LText;
    mapEmbedUrl: string;
    mapLink: string;
    hours: LText;
    social: SocialLinks;
    licenseNo: string;
  };
  header: {
    style: "light" | "dark" | "transparent";
    sticky: boolean;
    showTopBar: boolean;
    topBarText: LText;
    showPhone: boolean;
    showLangSwitch: boolean;
    showCta: boolean;
    ctaLabel: LText;
    ctaHref: string;
    logoHeight: number;
    showBrandName: boolean;
    nav: NavItem[];
  };
  footer: {
    style: "dark" | "light" | "primary";
    about: LText;
    showLogo: boolean;
    showQuickLinks: boolean;
    showServices: boolean;
    showContact: boolean;
    showHours: boolean;
    showSocial: boolean;
    showMap: boolean;
    quickLinksTitle: LText;
    servicesTitle: LText;
    contactTitle: LText;
    copyright: LText;
    bottomLinks: NavItem[];
  };
  floating: {
    whatsapp: boolean;
    call: boolean;
    backToTop: boolean;
    mobileBar: boolean;
    position: "start" | "end";
  };
  locales: {
    enabled: Locale[];
  };
  seo: {
    title: LText;
    description: LText;
    keywords: LText;
    siteUrl: string;
  };
  forms: {
    services: boolean;
    successMessage: LText;
  };
  projectCategories: ProjectCategory[];
  advanced: {
    headCode: string;
    bodyCode: string;
  };
}
