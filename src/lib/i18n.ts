import type { Locale, LText } from "./types";

export const DEFAULT_LOCALE: Locale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) === "en" ? "en" : "ar";

export function isLocale(v: string | undefined): v is Locale {
  return v === "ar" || v === "en";
}

export function dirOf(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Pick the right language from a bilingual value, falling back to the other language */
export function lt(v: LText | string | undefined | null, locale: Locale): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  const primary = v[locale];
  if (primary && primary.trim()) return primary;
  return v[locale === "ar" ? "en" : "ar"] || "";
}

/** Build a localized path. The default locale has no prefix (e.g. "/services"), the other gets "/en/services". */
export function localePath(locale: Locale, path: string) {
  let p = path || "/";
  if (!p.startsWith("/")) return p; // external / mailto / tel / anchors stay untouched
  if (p.startsWith("/en/") || p === "/en") p = p.slice(3) || "/";
  if (p.startsWith("/ar/") || p === "/ar") p = p.slice(3) || "/";
  if (locale === DEFAULT_LOCALE) return p;
  return `/${locale}${p === "/" ? "" : p}`;
}

/** Swap the locale of the current pathname */
export function switchLocalePath(pathname: string, to: Locale) {
  return localePath(to, pathname);
}

/* ---------------- Site UI strings (not editable content) ---------------- */
const dict = {
  ar: {
    home: "الرئيسية",
    readMore: "اقرأ المزيد",
    viewAll: "عرض الكل",
    viewAllServices: "جميع الخدمات",
    viewAllProjects: "جميع الأعمال",
    callNow: "اتصل الآن",
    whatsapp: "واتساب",
    contactUs: "تواصل معنا",
    getQuote: "اطلب عرض سعر",
    ourServices: "خدماتنا",
    ourProjects: "أعمالنا",
    all: "الكل",
    name: "الاسم",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    service: "الخدمة المطلوبة",
    chooseService: "اختر الخدمة",
    message: "رسالتك",
    send: "إرسال",
    sending: "جاري الإرسال...",
    sendWhatsapp: "إرسال عبر واتساب",
    required: "هذا الحقل مطلوب",
    address: "العنوان",
    hours: "ساعات العمل",
    followUs: "تابعنا",
    backToTop: "العودة للأعلى",
    menu: "القائمة",
    close: "إغلاق",
    language: "English",
    category: "النوع",
    location: "الموقع",
    year: "السنة",
    client: "العميل",
    gallery: "معرض الصور",
    otherServices: "خدمات أخرى",
    relatedProjects: "أعمال مشابهة",
    needHelp: "هل تحتاج مساعدة؟",
    needHelpText: "فريقنا جاهز للرد على استفساراتك وتقديم استشارة مجانية.",
    notFound: "الصفحة غير موجودة",
    notFoundText: "عذراً، الصفحة التي تبحث عنها غير متوفرة.",
    backHome: "العودة للرئيسية",
    projectsCount: "مشروع",
    openMap: "افتح الخريطة",
    scroll: "اكتشف المزيد",
    licenseNo: "رقم الترخيص",
    designedBy: "تصميم وتطوير",
    error: "حدث خطأ، حاول مرة أخرى",
    videoNotSupported: "المتصفح لا يدعم تشغيل الفيديو",
    yearsExp: "سنة خبرة",
    skipToContent: "الانتقال إلى المحتوى",
  },
  en: {
    home: "Home",
    readMore: "Read more",
    viewAll: "View all",
    viewAllServices: "All services",
    viewAllProjects: "All projects",
    callNow: "Call now",
    whatsapp: "WhatsApp",
    contactUs: "Contact us",
    getQuote: "Get a quote",
    ourServices: "Our services",
    ourProjects: "Our projects",
    all: "All",
    name: "Name",
    phone: "Phone number",
    email: "Email",
    service: "Service needed",
    chooseService: "Choose a service",
    message: "Your message",
    send: "Send",
    sending: "Sending...",
    sendWhatsapp: "Send via WhatsApp",
    required: "This field is required",
    address: "Address",
    hours: "Working hours",
    followUs: "Follow us",
    backToTop: "Back to top",
    menu: "Menu",
    close: "Close",
    language: "العربية",
    category: "Type",
    location: "Location",
    year: "Year",
    client: "Client",
    gallery: "Gallery",
    otherServices: "Other services",
    relatedProjects: "Related projects",
    needHelp: "Need help?",
    needHelpText: "Our team is ready to answer your questions and offer a free consultation.",
    notFound: "Page not found",
    notFoundText: "Sorry, the page you are looking for is not available.",
    backHome: "Back to home",
    projectsCount: "projects",
    openMap: "Open map",
    scroll: "Discover more",
    licenseNo: "License no.",
    designedBy: "Designed & developed by",
    error: "Something went wrong, please try again",
    videoNotSupported: "Your browser does not support video",
    yearsExp: "years of experience",
    skipToContent: "Skip to content",
  },
} as const;

export type UiKey = keyof typeof dict.ar;

export function t(locale: Locale, key: UiKey): string {
  return (dict[locale] as any)[key] ?? (dict.en as any)[key] ?? key;
}

export function makeT(locale: Locale) {
  return (key: UiKey) => t(locale, key);
}
