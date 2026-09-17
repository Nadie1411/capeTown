import type { Field } from "@/blocks/schema";
import type { LText, SiteSettings } from "@/lib/types";
import { L } from "@/lib/utils";
import { ARABIC_FONTS, DISPLAY_FONTS, LATIN_FONTS, MONO_FONTS } from "@/lib/theme";

export interface SettingsTab {
  key: keyof SiteSettings;
  label: LText;
  description: LText;
  icon: string;
  fields: Field[];
}

const social = ["instagram", "twitter", "facebook", "linkedin", "tiktok", "snapchat", "youtube"] as const;

export const SETTINGS_TABS: SettingsTab[] = [
  {
    key: "brand",
    label: L("الهوية والألوان", "Brand & colors"),
    description: L("الاسم، الشعار، الألوان، الخطوط وشكل الأزرار — تنعكس على كل الموقع فوراً", "Name, logo, colors, fonts and button shape — applied across the whole site"),
    icon: "Paintbrush",
    fields: [
      { key: "name", type: "ltext", label: L("اسم الشركة الكامل", "Full company name") },
      { key: "shortName", type: "ltext", label: L("الاسم المختصر", "Short name") },
      { key: "tagline", type: "ltext", label: L("الشعار النصي", "Tagline") },
      { key: "logoUrl", type: "media", accept: "image", label: L("الشعار (على خلفية فاتحة)", "Logo (on light background)") },
      { key: "logoWhiteUrl", type: "media", accept: "image", label: L("الشعار الأبيض (على خلفية داكنة)", "White logo (on dark background)") },
      { key: "logoMarkUrl", type: "media", accept: "image", label: L("الرمز المختصر (للأيقونات و QR)", "Logo mark (icons & QR)") },
      { key: "ogImageUrl", type: "media", accept: "image", label: L("صورة المشاركة الافتراضية", "Default share image") },
      { key: "primaryColor", type: "color", label: L("اللون الأساسي", "Primary color"), width: "half" },
      { key: "primaryDark", type: "color", label: L("الأساسي الداكن (عند التمرير)", "Primary dark (hover)"), width: "half" },
      { key: "accentColor", type: "color", label: L("اللون المميز (ذهبي)", "Accent color (gold)"), width: "half" },
      { key: "secondaryColor", type: "color", label: L("اللون الثانوي (التذييل الداكن)", "Secondary (dark footer)"), width: "half" },
      { key: "textColor", type: "color", label: L("لون النص", "Text color"), width: "half" },
      { key: "mutedColor", type: "color", label: L("لون النص الخافت", "Muted text color"), width: "half" },
      { key: "bgColor", type: "color", label: L("خلفية الصفحة", "Page background"), width: "half" },
      { key: "surfaceColor", type: "color", label: L("خلفية الأقسام الفاتحة", "Light section background"), width: "half" },
      { key: "fontEn", type: "select", label: L("الخط الإنجليزي", "English font"), width: "half", options: LATIN_FONTS.map((f) => ({ value: f, label: L(f, f) })) },
      { key: "fontAr", type: "select", label: L("الخط العربي", "Arabic font"), width: "half", options: ARABIC_FONTS.map((f) => ({ value: f, label: L(f, f) })) },
      { key: "fontDisplay", type: "select", label: L("خط العناوين الكبيرة (إنجليزي)", "Display font for large headlines (English)"), width: "half", options: DISPLAY_FONTS.map((f) => ({ value: f, label: f ? L(f, f) : L("نفس خط النص", "Same as body font") })) },
      { key: "fontMono", type: "select", label: L("خط الأرقام والتسميات", "Mono font for numbers & labels"), width: "half", options: MONO_FONTS.map((f) => ({ value: f, label: f ? L(f, f) : L("نفس خط النص", "Same as body font") })) },
      { key: "fontScale", type: "select", label: L("حجم الخط", "Text size"), width: "half", options: [{ value: "0.95", label: L("صغير", "Small") }, { value: "1", label: L("عادي", "Normal") }, { value: "1.1", label: L("كبير (مريح لكبار السن)", "Large (easier for older readers)") }, { value: "1.2", label: L("كبير جداً", "Extra large") }] },
      { key: "headingWeight", type: "select", label: L("سُمك العناوين", "Heading weight"), width: "half", options: [{ value: "600", label: L("متوسط", "Semi-bold") }, { value: "700", label: L("عريض", "Bold") }, { value: "800", label: L("عريض جداً", "Extra bold") }] },
      { key: "radius", type: "select", label: L("استدارة الزوايا", "Corner rounding"), width: "half", options: [{ value: "none", label: L("بدون", "None") }, { value: "sm", label: L("خفيفة", "Small") }, { value: "md", label: L("متوسطة", "Medium") }, { value: "lg", label: L("كبيرة", "Large") }, { value: "xl", label: L("كبيرة جداً", "Extra large") }] },
      { key: "buttonStyle", type: "select", label: L("شكل الأزرار", "Button shape"), width: "half", options: [{ value: "rounded", label: L("زوايا دائرية", "Rounded") }, { value: "pill", label: L("كبسولة", "Pill") }, { value: "square", label: L("مربع", "Square") }] },
      { key: "faviconUrl", type: "media", accept: "image", label: L("أيقونة المتصفح (favicon)", "Browser icon (favicon)") },
    ],
  },
  {
    key: "contact",
    label: L("بيانات التواصل", "Contact details"),
    description: L("الأرقام والبريد والعنوان والخريطة — تُستخدم في الرأس والتذييل والأزرار ونموذج التواصل", "Phones, email, address and map — used in the header, footer, buttons and contact form"),
    icon: "Phone",
    fields: [
      {
        key: "phones",
        type: "list",
        label: L("أرقام الهاتف", "Phone numbers"),
        itemFields: [
          { key: "label", type: "ltext", label: L("الوصف (مثل: الإدارة)", "Label (e.g. Management)") },
          { key: "number", type: "text", label: L("الرقم (بصيغة دولية +965…)", "Number (international format +965…)") },
        ],
        newItem: () => ({ label: L("", ""), number: "+965 " }),
        help: L("الرقم الأول هو المستخدم في أزرار 'اتصل الآن'", "The first number is used by the 'Call now' buttons"),
      },
      { key: "whatsapp", type: "text", label: L("رقم واتساب", "WhatsApp number"), width: "half" },
      { key: "email", type: "text", label: L("البريد الإلكتروني", "Email"), width: "half" },
      { key: "whatsappMessage", type: "ltextarea", label: L("الرسالة الجاهزة عند فتح واتساب", "Pre-filled WhatsApp message") },
      { key: "address", type: "ltextarea", label: L("العنوان", "Address") },
      { key: "hours", type: "ltext", label: L("ساعات العمل", "Working hours") },
      { key: "mapEmbedUrl", type: "url", label: L("رابط تضمين خرائط جوجل", "Google Maps embed URL"), help: L("من خرائط جوجل: مشاركة ← تضمين خريطة ← انسخ رابط src", "In Google Maps: Share → Embed a map → copy the src link") },
      { key: "mapLink", type: "url", label: L("رابط فتح الخريطة", "Open-in-maps link") },
      { key: "licenseNo", type: "text", label: L("رقم الترخيص التجاري (اختياري)", "Commercial license no. (optional)"), width: "half" },
      {
        key: "social",
        type: "group",
        label: L("حسابات التواصل الاجتماعي", "Social media accounts"),
        fields: social.map((s) => ({ key: s, type: "url" as const, label: L(s.charAt(0).toUpperCase() + s.slice(1), s.charAt(0).toUpperCase() + s.slice(1)), width: "half" as const, placeholder: "https://" })),
      },
    ],
  },
  {
    key: "header",
    label: L("الرأس والقائمة", "Header & menu"),
    description: L("شكل الرأس، الشعار، القائمة العلوية والأزرار", "Header style, logo, navigation links and buttons"),
    icon: "PanelsTopLeft",
    fields: [
      { key: "style", type: "select", label: L("شكل الرأس", "Header style"), width: "half", options: [{ value: "light", label: L("أبيض", "White") }, { value: "dark", label: L("داكن (اللون الأساسي)", "Dark (primary color)") }, { value: "transparent", label: L("شفاف فوق الواجهة (للصفحات التي تبدأ بقسم داكن)", "Transparent over hero (pages must start with a dark section)") }] },
      { key: "logoHeight", type: "number", label: L("ارتفاع الشعار (بكسل)", "Logo height (px)"), width: "half", min: 32, max: 120 },
      { key: "sticky", type: "boolean", label: L("رأس ثابت عند التمرير", "Sticky header"), width: "half" },
      { key: "showBrandName", type: "boolean", label: L("إظهار اسم الشركة بجانب الشعار", "Show company name next to logo"), width: "half" },
      { key: "showPhone", type: "boolean", label: L("إظهار رقم الهاتف", "Show phone number"), width: "half" },
      { key: "showLangSwitch", type: "boolean", label: L("زر تبديل اللغة", "Language switch button"), width: "half" },
      { key: "showCta", type: "boolean", label: L("زر رئيسي (CTA)", "Main button (CTA)"), width: "half" },
      { key: "ctaLabel", type: "ltext", label: L("نص الزر", "Button text"), showIf: (v) => v.showCta },
      { key: "ctaHref", type: "text", label: L("رابط الزر", "Button link"), showIf: (v) => v.showCta, placeholder: "/contact" },
      { key: "showTopBar", type: "boolean", label: L("شريط علوي (هاتف، بريد، ساعات)", "Top bar (phone, email, hours)"), width: "half" },
      { key: "topBarText", type: "ltext", label: L("نص الشريط العلوي", "Top bar text"), showIf: (v) => v.showTopBar },
      {
        key: "nav",
        type: "list",
        label: L("روابط القائمة", "Menu links"),
        itemFields: [
          { key: "label", type: "ltext", label: L("النص", "Text") },
          { key: "href", type: "text", label: L("الرابط (مثل /services أو #contact)", "Link (e.g. /services or #contact)") },
          { key: "newTab", type: "boolean", label: L("فتح في تبويب جديد", "Open in new tab") },
        ],
        newItem: () => ({ label: L("رابط", "Link"), href: "/", newTab: false }),
      },
    ],
  },
  {
    key: "footer",
    label: L("التذييل", "Footer"),
    description: L("محتوى أسفل الموقع", "Content at the bottom of every page"),
    icon: "LayoutList",
    fields: [
      { key: "style", type: "select", label: L("اللون", "Color"), width: "half", options: [{ value: "dark", label: L("داكن", "Dark") }, { value: "primary", label: L("اللون الأساسي", "Primary color") }, { value: "light", label: L("فاتح", "Light") }] },
      { key: "about", type: "ltextarea", label: L("نبذة قصيرة عن الشركة", "Short about text") },
      { key: "showLogo", type: "boolean", label: L("الشعار", "Logo"), width: "half" },
      { key: "showQuickLinks", type: "boolean", label: L("روابط سريعة", "Quick links"), width: "half" },
      { key: "showServices", type: "boolean", label: L("قائمة الخدمات", "Services list"), width: "half" },
      { key: "showContact", type: "boolean", label: L("بيانات التواصل", "Contact details"), width: "half" },
      { key: "showHours", type: "boolean", label: L("ساعات العمل", "Working hours"), width: "half" },
      { key: "showSocial", type: "boolean", label: L("أيقونات التواصل الاجتماعي", "Social icons"), width: "half" },
      { key: "showMap", type: "boolean", label: L("خريطة", "Map"), width: "half" },
      { key: "quickLinksTitle", type: "ltext", label: L("عنوان الروابط السريعة", "Quick links title") },
      { key: "servicesTitle", type: "ltext", label: L("عنوان الخدمات", "Services title") },
      { key: "contactTitle", type: "ltext", label: L("عنوان التواصل", "Contact title") },
      { key: "copyright", type: "ltext", label: L("نص الحقوق ({year} = السنة الحالية)", "Copyright text ({year} = current year)") },
      {
        key: "bottomLinks",
        type: "list",
        label: L("روابط أسفل التذييل", "Bottom links"),
        itemFields: [
          { key: "label", type: "ltext", label: L("النص", "Text") },
          { key: "href", type: "text", label: L("الرابط", "Link") },
        ],
        newItem: () => ({ label: L("سياسة الخصوصية", "Privacy policy"), href: "/privacy" }),
      },
    ],
  },
  {
    key: "floating",
    label: L("الأزرار العائمة", "Floating buttons"),
    description: L("زر واتساب والاتصال وشريط الجوال", "WhatsApp / call bubbles and the mobile bar"),
    icon: "MessageCircle",
    fields: [
      { key: "whatsapp", type: "boolean", label: L("زر واتساب عائم", "Floating WhatsApp bubble"), width: "half" },
      { key: "call", type: "boolean", label: L("زر اتصال عائم", "Floating call bubble"), width: "half" },
      { key: "backToTop", type: "boolean", label: L("زر العودة للأعلى", "Back-to-top button"), width: "half" },
      { key: "mobileBar", type: "boolean", label: L("شريط سفلي على الجوال (اتصال + واتساب)", "Bottom bar on mobile (call + WhatsApp)"), width: "half", help: L("عند تفعيله تختفي الأزرار العائمة على الجوال لتجنب التكرار", "When enabled, the bubbles are hidden on mobile to avoid duplicates") },
      { key: "position", type: "select", label: L("جهة الأزرار", "Bubble side"), width: "half", options: [{ value: "end", label: L("النهاية (يمين بالإنجليزية)", "End (right in English)") }, { value: "start", label: L("البداية", "Start") }] },
    ],
  },
  {
    key: "seo",
    label: L("SEO والروابط", "SEO & site URL"),
    description: L("عنوان الموقع ووصفه في نتائج البحث ورابط الموقع العام", "Site title/description for search engines and the public URL"),
    icon: "Globe",
    fields: [
      { key: "siteUrl", type: "url", label: L("رابط الموقع العام (مثال: https://capetown-kw.com)", "Public site URL (e.g. https://capetown-kw.com)"), help: L("يُستخدم في رمز QR وخريطة الموقع", "Used by the QR code and the sitemap") },
      { key: "title", type: "ltext", label: L("عنوان الموقع", "Site title") },
      { key: "description", type: "ltextarea", label: L("وصف الموقع", "Site description") },
      { key: "keywords", type: "ltext", label: L("كلمات مفتاحية (مفصولة بفواصل)", "Keywords (comma separated)") },
    ],
  },
  {
    key: "forms",
    label: L("نموذج التواصل", "Contact form"),
    description: L("إعدادات النموذج ورسالة النجاح", "Form options and success message"),
    icon: "Mail",
    fields: [
      { key: "services", type: "boolean", label: L("إظهار قائمة اختيار الخدمة", "Show service dropdown"), width: "half" },
      { key: "successMessage", type: "ltextarea", label: L("رسالة النجاح بعد الإرسال", "Success message after sending") },
    ],
  },
  {
    key: "projectCategories",
    label: L("أنواع المشاريع", "Project types"),
    description: L("التصنيفات المستخدمة لفلترة المشاريع", "Categories used to filter projects"),
    icon: "Building2",
    fields: [],
  },
  {
    key: "advanced",
    label: L("متقدم", "Advanced"),
    description: L("أكواد تتبع (Google Analytics / Meta Pixel) وغيرها", "Tracking codes (Google Analytics / Meta Pixel) and more"),
    icon: "Code",
    fields: [
      { key: "headCode", type: "code", label: L("كود في بداية الصفحة (مثل Google Analytics)", "Code at the top of the page (e.g. Google Analytics)") },
      { key: "bodyCode", type: "code", label: L("كود في نهاية الصفحة", "Code at the end of the page") },
    ],
  },
];

export const CATEGORY_FIELDS: Field[] = [
  { key: "key", type: "text", label: L("المعرّف (إنجليزي بدون مسافات)", "Key (English, no spaces)"), width: "half" },
  { key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" },
  { key: "label", type: "ltext", label: L("الاسم", "Name") },
];
