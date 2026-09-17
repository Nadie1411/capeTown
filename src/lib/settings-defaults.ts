import type { SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: {
      ar: "شركة كيب تاون للتجارة العامة والمقاولات",
      en: "Cape Town General Trading & Contracting Co. W.L.L",
    },
    shortName: { ar: "كيب تاون للمقاولات", en: "Cape Town Contracting" },
    tagline: {
      ar: "دقة في التنفيذ، سرعة في الإنجاز، وخبرة تمتد لسنوات",
      en: "Precision, speed, and years of proven experience",
    },
    logoUrl: "/brand/logo.svg",
    logoWhiteUrl: "/brand/logo-white.svg",
    logoMarkUrl: "/brand/mark.svg",
    faviconUrl: "/brand/mark.svg",
    ogImageUrl: "/brand/og.png",
    primaryColor: "#233283",
    primaryDark: "#17205c",
    secondaryColor: "#0f172a",
    accentColor: "#d4a12a",
    textColor: "#111a33",
    mutedColor: "#5b6577",
    bgColor: "#ffffff",
    surfaceColor: "#f4f6f9",
    fontEn: "Plus Jakarta Sans",
    fontAr: "IBM Plex Sans Arabic",
    fontDisplay: "",
    fontMono: "",
    fontScale: 1,
    headingWeight: 700,
    radius: "md",
    buttonStyle: "rounded",
  },
  contact: {
    phones: [
      { label: { ar: "الإدارة", en: "Management" }, number: "+965 0000 0000" },
      { label: { ar: "المكتب الهندسي", en: "Engineering office" }, number: "+965 0000 0001" },
    ],
    whatsapp: "+965 0000 0000",
    whatsappMessage: {
      ar: "السلام عليكم، أرغب بالاستفسار عن خدماتكم",
      en: "Hello, I would like to ask about your services",
    },
    email: "info@capetown-kw.com",
    address: {
      ar: "الكويت — حولي، شارع بيروت، برج التجارية، الدور 5",
      en: "Kuwait — Hawally, Beirut St., Al-Tijaria Tower, 5th floor",
    },
    mapEmbedUrl: "https://www.google.com/maps?q=Hawally,+Kuwait&z=13&output=embed",
    mapLink: "https://maps.google.com/?q=Hawally,+Kuwait",
    hours: { ar: "الأحد – الخميس: 8:00 ص – 5:00 م", en: "Sun – Thu: 8:00 AM – 5:00 PM" },
    social: { instagram: "", twitter: "", facebook: "", linkedin: "", tiktok: "", snapchat: "", youtube: "" },
    licenseNo: "",
  },
  header: {
    style: "light",
    sticky: true,
    showTopBar: false,
    topBarText: { ar: "نخدم جميع مناطق الكويت — استشارة مجانية", en: "Serving all areas of Kuwait — free consultation" },
    showPhone: true,
    showLangSwitch: true,
    showCta: true,
    ctaLabel: { ar: "اطلب عرض سعر", en: "Get a quote" },
    ctaHref: "/contact",
    logoHeight: 60,
    showBrandName: false,
    nav: [
      { label: { ar: "الرئيسية", en: "Home" }, href: "/" },
      { label: { ar: "من نحن", en: "About" }, href: "/about" },
      { label: { ar: "خدماتنا", en: "Services" }, href: "/services" },
      { label: { ar: "أعمالنا", en: "Projects" }, href: "/projects" },
      { label: { ar: "تواصل معنا", en: "Contact" }, href: "/contact" },
    ],
  },
  footer: {
    style: "dark",
    about: {
      ar: "شركة كويتية متخصصة في أعمال البناء والمقاولات العامة، من الحفر حتى التسليم، للمباني السكنية والفلل والعمارات والمباني التجارية والحكومية.",
      en: "A Kuwaiti company specialised in construction and general contracting — from excavation to handover — for residential buildings, villas, commercial and government projects.",
    },
    showLogo: true,
    showQuickLinks: true,
    showServices: true,
    showContact: true,
    showHours: true,
    showSocial: true,
    showMap: false,
    quickLinksTitle: { ar: "روابط سريعة", en: "Quick links" },
    servicesTitle: { ar: "خدماتنا", en: "Our services" },
    contactTitle: { ar: "تواصل معنا", en: "Contact us" },
    copyright: { ar: "جميع الحقوق محفوظة © {year} شركة كيب تاون للتجارة العامة والمقاولات", en: "© {year} Cape Town General Trading & Contracting Co. All rights reserved." },
    bottomLinks: [],
  },
  floating: { whatsapp: true, call: false, backToTop: true, mobileBar: false, position: "end" },
  locales: { enabled: ["ar", "en"] },
  seo: {
    title: { ar: "كيب تاون للتجارة العامة والمقاولات — الكويت", en: "Cape Town General Trading & Contracting — Kuwait" },
    description: {
      ar: "شركة مقاولات كويتية: أعمال البناء، الحفر، التشطيب، المخططات، المكتب الهندسي والمعاملات — فلل، عمارات، مباني تجارية وحكومية.",
      en: "Kuwaiti contracting company: construction, excavation, finishing, drawings, engineering office and permits — villas, buildings, commercial and government projects.",
    },
    keywords: { ar: "مقاولات الكويت, بناء فلل, تشطيب, حفر, مكتب هندسي", en: "Kuwait contracting, villa construction, finishing, excavation, engineering office" },
    siteUrl: "",
  },
  forms: {
    services: true,
    successMessage: { ar: "شكراً لك! تم استلام رسالتك وسنتواصل معك في أقرب وقت.", en: "Thank you! We received your message and will contact you shortly." },
  },
  projectCategories: [
    { key: "residential", label: { ar: "مبنى سكني", en: "Residential" }, icon: "House" },
    { key: "villa", label: { ar: "فيلا", en: "Villa" }, icon: "Home" },
    { key: "building", label: { ar: "عمارة", en: "Apartment building" }, icon: "Building2" },
    { key: "commercial", label: { ar: "مبنى تجاري", en: "Commercial" }, icon: "Store" },
    { key: "government", label: { ar: "مبنى حكومي", en: "Government" }, icon: "Landmark" },
    { key: "other", label: { ar: "أخرى", en: "Other" }, icon: "Layers" },
  ],
  advanced: { headCode: "", bodyCode: "" },
};

/** Deep-merge stored settings over the defaults so new keys always exist */
export function mergeSettings(stored: any): SiteSettings {
  return deepMerge(DEFAULT_SETTINGS, stored || {}) as SiteSettings;
}

export function deepMerge<T>(base: T, patch: any): T {
  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : base) as T;
  }
  if (base && typeof base === "object") {
    const out: any = { ...(base as any) };
    if (patch && typeof patch === "object") {
      for (const k of Object.keys(patch)) {
        const bv = (base as any)[k];
        const pv = patch[k];
        if (pv === undefined) continue;
        if (bv && typeof bv === "object" && !Array.isArray(bv) && pv && typeof pv === "object" && !Array.isArray(pv)) {
          out[k] = deepMerge(bv, pv);
        } else {
          out[k] = pv;
        }
      }
    }
    return out;
  }
  return (patch === undefined ? base : patch) as T;
}
