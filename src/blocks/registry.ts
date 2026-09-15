import type { Block, BlockStyle, BlockType, LinkItem, LText } from "@/lib/types";
import { L, uid } from "@/lib/utils";
import type { BlockDefinition, Field } from "./schema";

/* ------------------------------ helpers ------------------------------ */

const link = (ar: string, en: string, href: string, style: LinkItem["style"] = "primary", icon = ""): LinkItem => ({
  label: L(ar, en),
  href,
  style,
  icon,
  newTab: false,
});

const sectionHeadingFields = (): Field[] => [
  { key: "eyebrow", type: "ltext", label: L("عنوان صغير (فوق العنوان)", "Eyebrow (small title)"), width: "full" },
  { key: "title", type: "ltext", label: L("العنوان", "Title") },
  { key: "subtitle", type: "ltextarea", label: L("نص تعريفي", "Intro text") },
];

const linkFields: Field[] = [{ key: "buttons", type: "list", label: L("الأزرار", "Buttons"), itemFields: [{ key: "_", type: "link", label: L("زر", "Button") }], newItem: () => link("زر جديد", "New button", "/contact", "primary") }];

const columnsField = (def = 3): Field => ({
  key: "columns",
  type: "select",
  label: L("عدد الأعمدة", "Columns"),
  width: "half",
  options: [2, 3, 4].map((n) => ({ value: String(n), label: L(`${n} أعمدة`, `${n} columns`) })),
});

/* ------------------------------ definitions ------------------------------ */

export const BLOCKS: Record<BlockType, BlockDefinition> = {
  hero: {
    type: "hero",
    name: L("الواجهة الرئيسية (Hero)", "Hero banner"),
    description: L("القسم الأول الكبير مع صورة أو فيديو خلفية وعنوان وأزرار", "The large opening section with a background image/video, headline and buttons"),
    icon: "Sparkles",
    category: "hero",
    fields: [
      {
        key: "layout",
        type: "select",
        label: L("التخطيط", "Layout"),
        width: "half",
        options: [
          { value: "center", label: L("نص في المنتصف", "Centered text") },
          { value: "start", label: L("نص على الجانب", "Text at the side") },
          { value: "split", label: L("نص + صورة جانبية", "Text + side image") },
        ],
      },
      {
        key: "height",
        type: "select",
        label: L("الارتفاع", "Height"),
        width: "half",
        options: [
          { value: "sm", label: L("قصير", "Short") },
          { value: "md", label: L("متوسط", "Medium") },
          { value: "lg", label: L("كبير", "Large") },
          { value: "full", label: L("ملء الشاشة", "Full screen") },
        ],
      },
      { key: "eyebrow", type: "ltext", label: L("عنوان صغير", "Eyebrow") },
      { key: "title", type: "ltextarea", label: L("العنوان الرئيسي", "Headline") },
      { key: "subtitle", type: "ltextarea", label: L("النص التعريفي", "Sub-headline") },
      ...linkFields,
      { key: "sideMedia", type: "media", accept: "any", label: L("الصورة/الفيديو الجانبي", "Side image / video"), showIf: (v) => v.layout === "split" },
      {
        key: "badges",
        type: "list",
        label: L("نقاط الثقة (تحت الأزرار)", "Trust points (under buttons)"),
        itemFields: [
          { key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" },
          { key: "text", type: "ltext", label: L("النص", "Text") },
        ],
        newItem: () => ({ icon: "CircleCheck", text: L("نقطة جديدة", "New point") }),
      },
      { key: "showScrollHint", type: "boolean", label: L("إظهار سهم التمرير للأسفل", "Show scroll-down hint"), width: "half" },
      { key: "showLogo", type: "boolean", label: L("إظهار الشعار فوق العنوان", "Show logo above headline"), width: "half" },
    ],
    defaults: () => ({
      layout: "start",
      height: "lg",
      eyebrow: L("", ""),
      title: L("نبني لكم بدقة وسرعة وخبرة تمتد لسنوات", "We build with precision, speed and years of experience"),
      subtitle: L(
        "من الحفر إلى التسليم — ننفّذ المباني السكنية والفلل والعمارات والمباني التجارية والحكومية، مع مكتب هندسي متكامل وإنهاء جميع المعاملات.",
        "From excavation to handover — residential buildings, villas, apartment blocks, commercial and government projects, with a full engineering office and permit handling."
      ),
      buttons: [link("اتصل بنا الآن", "Call us now", "tel:", "primary", "Phone"), link("تعرف على خدماتنا", "Our services", "/services", "outline", "")],
      sideMedia: "",
      badges: [
        { icon: "ShieldCheck", text: L("شركة مرخصة في الكويت", "Licensed in Kuwait") },
        { icon: "Timer", text: L("التزام بالمواعيد", "On-time delivery") },
        { icon: "Award", text: L("خبرة تزيد عن 20 سنة", "20+ years of experience") },
      ],
      showScrollHint: false,
      showLogo: false,
    }),
    defaultStyle: {
      theme: "dark",
      paddingY: "xl",
      background: { type: "image", color: "#17205c", gradientFrom: "#233283", gradientTo: "#0f172a", gradientAngle: 135, mediaUrl: "/photos/hero-construction-site.jpg", posterUrl: "", overlayColor: "#0b1244", overlayOpacity: 80, overlayStyle: "fade-start", parallax: false, pattern: "grid" },
    },
  },

  pageHeader: {
    type: "pageHeader",
    name: L("رأس الصفحة", "Page header"),
    description: L("عنوان صفحة داخلية مع خلفية ومسار التنقل", "Inner-page title with background and breadcrumb"),
    icon: "Heading1",
    category: "hero",
    fields: [
      { key: "title", type: "ltext", label: L("العنوان", "Title") },
      { key: "subtitle", type: "ltextarea", label: L("النص التعريفي", "Intro text") },
      { key: "showBreadcrumb", type: "boolean", label: L("إظهار مسار التنقل", "Show breadcrumb"), width: "half" },
    ],
    defaults: () => ({ title: L("عنوان الصفحة", "Page title"), subtitle: L("", ""), showBreadcrumb: true }),
    defaultStyle: {
      theme: "dark",
      paddingY: "lg",
      align: "center",
      background: { type: "gradient", color: "#233283", gradientFrom: "#233283", gradientTo: "#0f172a", gradientAngle: 135, mediaUrl: "", posterUrl: "", overlayColor: "#0b1244", overlayOpacity: 60, overlayStyle: "solid", parallax: false, pattern: "grid" },
    },
  },

  about: {
    type: "about",
    name: L("من نحن (صورة + نص)", "About (image + text)"),
    description: L("قسم تعريفي بصورة أو فيديو بجانب النص مع نقاط وأزرار", "Intro section with an image/video next to text, bullet points and buttons"),
    icon: "PanelsTopLeft",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      { key: "body", type: "lrichtext", label: L("النص التفصيلي", "Body text") },
      {
        key: "bullets",
        type: "list",
        label: L("النقاط", "Bullet points"),
        itemFields: [
          { key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" },
          { key: "text", type: "ltext", label: L("النص", "Text") },
        ],
        newItem: () => ({ icon: "CircleCheck", text: L("نقطة جديدة", "New point") }),
      },
      ...linkFields,
      { key: "media", type: "media", accept: "any", label: L("الصورة أو الفيديو", "Image or video") },
      { key: "mediaPoster", type: "media", accept: "image", label: L("صورة الغلاف للفيديو", "Video poster image"), showIf: (v) => /\.(mp4|webm|mov)$/i.test(v.media || "") },
      {
        key: "mediaPosition",
        type: "select",
        label: L("موضع الصورة", "Image position"),
        width: "half",
        options: [
          { value: "start", label: L("البداية (يمين بالعربية)", "Start (right in Arabic)") },
          { value: "end", label: L("النهاية (يسار بالعربية)", "End (left in Arabic)") },
        ],
      },
      {
        key: "mediaStyle",
        type: "select",
        label: L("شكل الصورة", "Image style"),
        width: "half",
        options: [
          { value: "rounded", label: L("زوايا دائرية", "Rounded") },
          { value: "framed", label: L("إطار ملوّن", "Colored frame") },
          { value: "plain", label: L("بدون تنسيق", "Plain") },
        ],
      },
      {
        key: "badge",
        type: "group",
        label: L("شارة الخبرة (على الصورة)", "Experience badge (on image)"),
        fields: [
          { key: "show", type: "boolean", label: L("إظهار", "Show"), width: "half" },
          { key: "value", type: "text", label: L("الرقم", "Number"), width: "half" },
          { key: "label", type: "ltext", label: L("النص", "Label") },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: L("من نحن", "About us"),
      title: L("شريككم الموثوق في البناء والمقاولات في الكويت", "Your trusted construction & contracting partner in Kuwait"),
      subtitle: L("", ""),
      body: L(
        "<p>شركة كيب تاون للتجارة العامة والمقاولات شركة كويتية تنفّذ جميع أعمال البناء والمقاولات، بدءاً من الحفر ووضع الأساسات، مروراً بالهيكل الإنشائي والتشطيب، وحتى التسليم النهائي.</p><p>نمتلك مكتباً هندسياً متكاملاً يُعدّ المخططات ويتابع المعاملات والتراخيص، ليحصل عميلنا على مشروع كامل من جهة واحدة.</p>",
        "<p>Cape Town General Trading & Contracting is a Kuwaiti company delivering complete construction works — from excavation and foundations, through structure and finishing, to final handover.</p><p>Our in-house engineering office prepares drawings and handles permits and paperwork, so clients get a complete project from a single partner.</p>"
      ),
      bullets: [
        { icon: "CircleCheck", text: L("دقة في التنفيذ ومطابقة للمواصفات", "Precise execution to specification") },
        { icon: "CircleCheck", text: L("سرعة في الإنجاز والتزام بالمواعيد", "Fast delivery and on-time commitment") },
        { icon: "CircleCheck", text: L("خبرة طويلة في السوق الكويتي", "Long experience in the Kuwaiti market") },
        { icon: "CircleCheck", text: L("فريق هندسي وفني متكامل", "Complete engineering & technical team") },
      ],
      buttons: [link("تواصل معنا", "Contact us", "/contact", "primary", "")],
      media: "/photos/about-engineers-site.jpg",
      mediaPoster: "",
      mediaPosition: "start",
      mediaStyle: "rounded",
      badge: { show: false, value: "20+", label: L("سنة من الخبرة", "Years of experience") },
    }),
  },

  services: {
    type: "services",
    name: L("الخدمات", "Services"),
    description: L("شبكة بطاقات الخدمات من قسم الخدمات في لوحة التحكم", "Grid of service cards pulled from the Services section of the admin"),
    icon: "Hammer",
    category: "lists",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "source",
        type: "select",
        label: L("الخدمات المعروضة", "Which services"),
        width: "half",
        options: [
          { value: "all", label: L("كل الخدمات", "All services") },
          { value: "featured", label: L("المميزة فقط", "Featured only") },
          { value: "selected", label: L("اختيار يدوي", "Manual selection") },
        ],
      },
      { key: "limit", type: "number", label: L("الحد الأقصى للعدد", "Maximum count"), width: "half", min: 1, max: 24 },
      { key: "selected", type: "services", label: L("اختر الخدمات", "Choose services"), showIf: (v) => v.source === "selected" },
      columnsField(),
      {
        key: "cardStyle",
        type: "select",
        label: L("شكل البطاقة", "Card style"),
        width: "half",
        options: [
          { value: "image", label: L("صورة + عنوان", "Image + title") },
          { value: "icon", label: L("أيقونة + نص", "Icon + text") },
          { value: "overlay", label: L("صورة بنص فوقها", "Image with text overlay") },
          { value: "list", label: L("قائمة بسيطة", "Simple list") },
        ],
      },
      { key: "showDescription", type: "boolean", label: L("إظهار الوصف المختصر", "Show short description"), width: "half" },
      { key: "showButton", type: "boolean", label: L("إظهار زر 'كل الخدمات'", "Show 'All services' button"), width: "half" },
      { key: "buttonLabel", type: "ltext", label: L("نص الزر", "Button text"), showIf: (v) => v.showButton },
    ],
    defaults: () => ({
      eyebrow: L("خدماتنا", "Our services"),
      title: L("كل ما يحتاجه مشروعك من جهة واحدة", "Everything your project needs, from one partner"),
      subtitle: L("أعمال البناء والحفر والتشطيب والمقاولات، إضافة إلى المخططات والمكتب الهندسي وإنهاء المعاملات.", "Construction, excavation, finishing and contracting, plus drawings, engineering office and permit handling."),
      source: "all",
      limit: 8,
      selected: [],
      columns: "4",
      cardStyle: "image",
      showDescription: true,
      showButton: true,
      buttonLabel: L("جميع الخدمات", "All services"),
    }),
    defaultStyle: { background: { type: "color", color: "#f4f6fb", gradientFrom: "", gradientTo: "", gradientAngle: 135, mediaUrl: "", posterUrl: "", overlayColor: "", overlayOpacity: 0, overlayStyle: "solid", parallax: false, pattern: "grid" } },
  },

  projects: {
    type: "projects",
    name: L("أعمالنا السابقة", "Projects / portfolio"),
    description: L("معرض المشاريع من قسم المشاريع مع فلاتر حسب نوع المبنى", "Project gallery from the Projects section with building-type filters"),
    icon: "Building2",
    category: "lists",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "source",
        type: "select",
        label: L("المشاريع المعروضة", "Which projects"),
        width: "half",
        options: [
          { value: "all", label: L("كل المشاريع", "All projects") },
          { value: "featured", label: L("المميزة فقط", "Featured only") },
          { value: "category", label: L("نوع معين", "One category") },
          { value: "selected", label: L("اختيار يدوي", "Manual selection") },
        ],
      },
      { key: "limit", type: "number", label: L("الحد الأقصى للعدد", "Maximum count"), width: "half", min: 1, max: 60 },
      { key: "category", type: "category", label: L("النوع", "Category"), showIf: (v) => v.source === "category" },
      { key: "selected", type: "projects", label: L("اختر المشاريع", "Choose projects"), showIf: (v) => v.source === "selected" },
      columnsField(),
      {
        key: "cardStyle",
        type: "select",
        label: L("شكل البطاقة", "Card style"),
        width: "half",
        options: [
          { value: "overlay", label: L("صورة بنص فوقها", "Image with text overlay") },
          { value: "card", label: L("بطاقة بيضاء", "White card") },
        ],
      },
      { key: "showFilters", type: "boolean", label: L("إظهار فلاتر النوع", "Show category filters"), width: "half" },
      { key: "showMeta", type: "boolean", label: L("إظهار الموقع والسنة", "Show location & year"), width: "half" },
      { key: "showButton", type: "boolean", label: L("إظهار زر 'كل الأعمال'", "Show 'All projects' button"), width: "half" },
      { key: "buttonLabel", type: "ltext", label: L("نص الزر", "Button text"), showIf: (v) => v.showButton },
    ],
    defaults: () => ({
      eyebrow: L("أعمالنا السابقة", "Our previous work"),
      title: L("مشاريع نفخر بها", "Projects we are proud of"),
      subtitle: L("نماذج من الفلل والعمارات والمباني التجارية والحكومية التي نفّذناها.", "A selection of villas, buildings, commercial and government projects we delivered."),
      source: "featured",
      limit: 6,
      category: "",
      selected: [],
      columns: "3",
      cardStyle: "overlay",
      showFilters: true,
      showMeta: true,
      showButton: true,
      buttonLabel: L("جميع الأعمال", "All projects"),
    }),
  },

  buildingTypes: {
    type: "buildingTypes",
    name: L("أنواع المباني", "Building types"),
    description: L("شريط أيقونات لأنواع المباني التي تنفّذها الشركة", "Icon strip listing the building types you deliver"),
    icon: "LayoutGrid",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "items",
        type: "list",
        label: L("الأنواع", "Types"),
        itemFields: [
          { key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" },
          { key: "title", type: "ltext", label: L("الاسم", "Name") },
          { key: "text", type: "ltext", label: L("وصف قصير", "Short description") },
          { key: "href", type: "url", label: L("رابط (اختياري)", "Link (optional)") },
        ],
        newItem: () => ({ icon: "Building2", title: L("نوع جديد", "New type"), text: L("", ""), href: "" }),
      },
      {
        key: "layout",
        type: "select",
        label: L("الشكل", "Style"),
        width: "half",
        options: [
          { value: "tiles", label: L("مربعات", "Tiles") },
          { value: "pills", label: L("شرائط", "Pills") },
        ],
      },
    ],
    defaults: () => ({
      eyebrow: L("نخدم جميع أنواع المباني", "We serve every building type"),
      title: L("سكني، تجاري، أو حكومي — ننفّذه بنفس الدقة", "Residential, commercial or government — same precision"),
      subtitle: L("", ""),
      items: [
        { icon: "House", title: L("مبنى سكني", "Residential building"), text: L("بيوت وأدوار سكنية", "Houses & residential floors"), href: "/projects" },
        { icon: "Home", title: L("فيلا", "Villa"), text: L("فلل خاصة بتصاميم عصرية", "Private villas, modern designs"), href: "/projects" },
        { icon: "Building2", title: L("عمارة", "Apartment building"), text: L("عمارات استثمارية وسكنية", "Investment & residential blocks"), href: "/projects" },
        { icon: "Store", title: L("مبنى تجاري", "Commercial"), text: L("محلات ومجمعات ومكاتب", "Shops, complexes & offices"), href: "/projects" },
        { icon: "Landmark", title: L("مبنى حكومي", "Government"), text: L("مشاريع ومناقصات حكومية", "Government projects & tenders"), href: "/projects" },
      ],
      layout: "tiles",
    }),
  },

  features: {
    type: "features",
    name: L("لماذا تختارنا / المميزات", "Why choose us / features"),
    description: L("بطاقات بأيقونات تشرح ما يميّز الشركة", "Icon cards explaining what sets you apart"),
    icon: "BadgeCheck",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "items",
        type: "list",
        label: L("المميزات", "Features"),
        itemFields: [
          { key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" },
          { key: "title", type: "ltext", label: L("العنوان", "Title") },
          { key: "text", type: "ltextarea", label: L("الوصف", "Description") },
        ],
        newItem: () => ({ icon: "Star", title: L("ميزة جديدة", "New feature"), text: L("", "") }),
      },
      columnsField(),
      {
        key: "cardStyle",
        type: "select",
        label: L("شكل البطاقة", "Card style"),
        width: "half",
        options: [
          { value: "card", label: L("بطاقة", "Card") },
          { value: "plain", label: L("بدون إطار", "Plain") },
          { value: "numbered", label: L("مرقّمة", "Numbered") },
          { value: "side", label: L("أيقونة جانبية", "Side icon") },
        ],
      },
      { key: "iconStyle", type: "select", label: L("شكل الأيقونة", "Icon style"), width: "half", options: [{ value: "filled", label: L("خلفية ملونة", "Filled") }, { value: "outline", label: L("إطار", "Outline") }, { value: "plain", label: L("بدون خلفية", "Plain") }] },
    ],
    defaults: () => ({
      eyebrow: L("لماذا تختارنا؟", "Why choose us?"),
      title: L("ما يميّزنا عن غيرنا من الشركات", "What sets us apart"),
      subtitle: L("", ""),
      items: [
        { icon: "Target", title: L("دقة في التنفيذ", "Precision"), text: L("نلتزم بالمخططات والمواصفات حرفياً، ونراجع كل مرحلة قبل الانتقال للتي تليها.", "We follow drawings and specifications to the letter and review every stage before moving on.") },
        { icon: "Zap", title: L("سرعة في الإنجاز", "Speed of execution"), text: L("جداول زمنية واضحة وفرق عمل متعددة تضمن تسليم مشروعك في موعده.", "Clear schedules and multiple crews ensure your project is delivered on time.") },
        { icon: "Award", title: L("خبرة طويلة", "Long experience"), text: L("سنوات من العمل في السوق الكويتي أكسبتنا معرفة دقيقة بالمواد والجهات والإجراءات.", "Years in the Kuwaiti market gave us deep knowledge of materials, authorities and procedures.") },
        { icon: "DraftingCompass", title: L("مكتب هندسي متكامل", "Complete engineering office"), text: L("نُعدّ المخططات ونتابع الاعتمادات والتراخيص بأنفسنا.", "We prepare drawings and follow up approvals and permits ourselves.") },
        { icon: "ShieldCheck", title: L("التزام وضمان", "Commitment & warranty"), text: L("عقود واضحة وضمان على الأعمال المنفذة.", "Clear contracts and a warranty on executed works.") },
        { icon: "Handshake", title: L("تعامل مباشر", "Direct relationship"), text: L("تتعامل مع فريقنا مباشرة دون وسطاء، وبأسعار واضحة من البداية.", "You deal with our team directly, with transparent pricing from day one.") },
      ],
      columns: "3",
      cardStyle: "card",
      iconStyle: "filled",
    }),
  },

  stats: {
    type: "stats",
    name: L("أرقام وإحصائيات", "Statistics / counters"),
    description: L("أرقام متحركة مثل سنوات الخبرة وعدد المشاريع", "Animated numbers such as years of experience and project count"),
    icon: "TrendingUp",
    category: "content",
    fields: [
      {
        key: "items",
        type: "list",
        label: L("الأرقام", "Numbers"),
        itemFields: [
          { key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" },
          { key: "value", type: "number", label: L("الرقم", "Number"), width: "half", min: 0 },
          { key: "suffix", type: "text", label: L("لاحقة (مثل +)", "Suffix (e.g. +)"), width: "half" },
          { key: "label", type: "ltext", label: L("الوصف", "Label") },
        ],
        newItem: () => ({ icon: "Award", value: 100, suffix: "+", label: L("وصف", "Label") }),
      },
      columnsField(4),
      { key: "animate", type: "boolean", label: L("عدّ متحرك عند الظهور", "Animate counting"), width: "half" },
      { key: "layout", type: "select", label: L("الشكل", "Style"), width: "half", options: [{ value: "plain", label: L("أرقام فقط", "Numbers only") }, { value: "cards", label: L("بطاقات", "Cards") }, { value: "divided", label: L("مقسّمة بخطوط", "Divided") }] },
    ],
    defaults: () => ({
      items: [
        { icon: "", value: 20, suffix: "+", label: L("سنة خبرة", "Years of experience") },
        { icon: "", value: 150, suffix: "+", label: L("مشروع منجز", "Completed projects") },
        { icon: "", value: 300, suffix: "+", label: L("عميل راضٍ", "Happy clients") },
        { icon: "", value: 100, suffix: "%", label: L("التزام بالمواعيد", "On-time delivery") },
      ],
      columns: "4",
      animate: true,
      layout: "divided",
    }),
    defaultStyle: {
      theme: "dark",
      paddingY: "md",
      background: { type: "gradient", color: "#233283", gradientFrom: "#233283", gradientTo: "#17205c", gradientAngle: 90, mediaUrl: "", posterUrl: "", overlayColor: "", overlayOpacity: 0, overlayStyle: "solid", parallax: false, pattern: "grid" },
    },
  },

  steps: {
    type: "steps",
    name: L("كيف نعمل (خطوات)", "How we work (steps)"),
    description: L("خطوات مرقّمة من الاستشارة حتى التسليم", "Numbered steps from consultation to handover"),
    icon: "ListOrdered",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "items",
        type: "list",
        label: L("الخطوات", "Steps"),
        itemFields: [
          { key: "icon", type: "icon", label: L("الأيقونة", "Icon"), width: "half" },
          { key: "title", type: "ltext", label: L("العنوان", "Title") },
          { key: "text", type: "ltextarea", label: L("الوصف", "Description") },
        ],
        newItem: () => ({ icon: "CircleCheck", title: L("خطوة", "Step"), text: L("", "") }),
      },
      { key: "layout", type: "select", label: L("الشكل", "Layout"), width: "half", options: [{ value: "horizontal", label: L("أفقي", "Horizontal") }, { value: "vertical", label: L("عمودي (خط زمني)", "Vertical timeline") }] },
    ],
    defaults: () => ({
      eyebrow: L("كيف نعمل", "How we work"),
      title: L("أربع خطوات واضحة من الفكرة إلى التسليم", "Four clear steps from idea to handover"),
      subtitle: L("", ""),
      items: [
        { icon: "MessageCircle", title: L("استشارة ومعاينة", "Consultation & site visit"), text: L("نستمع لاحتياجك ونعاين الموقع ونقدّم عرض سعر واضح.", "We listen, visit the site and give a clear quotation.") },
        { icon: "DraftingCompass", title: L("المخططات والتراخيص", "Drawings & permits"), text: L("يُعدّ مكتبنا الهندسي المخططات وينهي المعاملات والاعتمادات.", "Our engineering office prepares drawings and finishes approvals.") },
        { icon: "HardHat", title: L("التنفيذ", "Execution"), text: L("حفر، هيكل، تشطيب — بإشراف هندسي مستمر وجدول زمني معلن.", "Excavation, structure, finishing — with continuous supervision and a published schedule.") },
        { icon: "KeyRound", title: L("التسليم والضمان", "Handover & warranty"), text: L("نسلّم المشروع جاهزاً مع ضمان على الأعمال المنفذة.", "We hand over a ready project with a warranty on the works.") },
      ],
      layout: "horizontal",
    }),
  },

  cta: {
    type: "cta",
    name: L("دعوة للتواصل (CTA)", "Call to action"),
    description: L("شريط بارز فيه رقم الهاتف وأزرار التواصل", "Prominent strip with phone number and contact buttons"),
    icon: "PhoneCall",
    category: "conversion",
    fields: [
      { key: "title", type: "ltext", label: L("العنوان", "Title") },
      { key: "text", type: "ltextarea", label: L("النص", "Text") },
      ...linkFields,
      { key: "showPhone", type: "boolean", label: L("إظهار رقم الهاتف بخط كبير", "Show phone number in large type"), width: "half" },
      { key: "layout", type: "select", label: L("التخطيط", "Layout"), width: "half", options: [{ value: "center", label: L("في المنتصف", "Centered") }, { value: "split", label: L("نص وأزرار متقابلة", "Text and buttons side by side") }] },
    ],
    defaults: () => ({
      title: L("جاهزون لبدء مشروعك؟", "Ready to start your project?"),
      text: L("اتصل بنا أو راسلنا على واتساب، وسيتواصل معك مهندس من فريقنا خلال ساعات العمل.", "Call or message us on WhatsApp and one of our engineers will get back to you during working hours."),
      buttons: [link("اتصل الآن", "Call now", "tel:", "primary", "Phone"), link("واتساب", "WhatsApp", "whatsapp:", "whatsapp", "MessageCircle")],
      showPhone: true,
      layout: "split",
    }),
    defaultStyle: {
      theme: "dark",
      paddingY: "lg",
      background: { type: "image", color: "#233283", gradientFrom: "", gradientTo: "", gradientAngle: 135, mediaUrl: "/photos/kuwait-skyline-sunset.jpg", posterUrl: "", overlayColor: "#0b1244", overlayOpacity: 82, overlayStyle: "solid", parallax: false, pattern: "grid" },
    },
  },

  gallery: {
    type: "gallery",
    name: L("معرض صور وفيديو", "Photo & video gallery"),
    description: L("شبكة صور أو فيديوهات مع تكبير عند النقر", "Grid of images or videos with lightbox"),
    icon: "Images",
    category: "media",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "items",
        type: "list",
        label: L("العناصر", "Items"),
        itemFields: [
          { key: "url", type: "media", accept: "any", label: L("الصورة / الفيديو", "Image / video") },
          { key: "caption", type: "ltext", label: L("تعليق", "Caption") },
        ],
        newItem: () => ({ url: "", caption: L("", "") }),
      },
      columnsField(3),
      { key: "aspect", type: "select", label: L("نسبة الأبعاد", "Aspect ratio"), width: "half", options: [{ value: "square", label: L("مربع", "Square") }, { value: "video", label: L("عريض 16:9", "Wide 16:9") }, { value: "portrait", label: L("طولي", "Portrait") }] },
      { key: "lightbox", type: "boolean", label: L("تكبير عند النقر", "Open in lightbox"), width: "half" },
    ],
    defaults: () => ({ eyebrow: L("", ""), title: L("من موقع العمل", "From the site"), subtitle: L("", ""), items: [], columns: "3", aspect: "video", lightbox: true }),
  },

  video: {
    type: "video",
    name: L("فيديو", "Video"),
    description: L("فيديو مرفوع أو من يوتيوب مع عنوان", "Uploaded or YouTube video with a title"),
    icon: "Video",
    category: "media",
    fields: [
      ...sectionHeadingFields(),
      { key: "source", type: "select", label: L("المصدر", "Source"), width: "half", options: [{ value: "upload", label: L("ملف مرفوع", "Uploaded file") }, { value: "youtube", label: L("يوتيوب", "YouTube") }] },
      { key: "url", type: "media", accept: "video", label: L("ملف الفيديو", "Video file"), showIf: (v) => v.source === "upload" },
      { key: "youtubeUrl", type: "url", label: L("رابط يوتيوب", "YouTube link"), showIf: (v) => v.source === "youtube" },
      { key: "posterUrl", type: "media", accept: "image", label: L("صورة الغلاف", "Poster image"), showIf: (v) => v.source === "upload" },
      { key: "autoplay", type: "boolean", label: L("تشغيل تلقائي (صامت)", "Autoplay (muted)"), width: "half" },
      { key: "loop", type: "boolean", label: L("تكرار", "Loop"), width: "half" },
      { key: "controls", type: "boolean", label: L("أزرار التحكم", "Show controls"), width: "half" },
      { key: "maxWidth", type: "select", label: L("العرض", "Width"), width: "half", options: [{ value: "content", label: L("عادي", "Normal") }, { value: "full", label: L("كامل", "Full width") }] },
    ],
    defaults: () => ({ eyebrow: L("", ""), title: L("شاهد أعمالنا", "Watch our work"), subtitle: L("", ""), source: "upload", url: "", youtubeUrl: "", posterUrl: "", autoplay: false, loop: false, controls: true, maxWidth: "content" }),
  },

  richText: {
    type: "richText",
    name: L("نص حر", "Rich text"),
    description: L("فقرات نصية منسّقة مع عنوان", "Formatted paragraphs with a heading"),
    icon: "Type",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      { key: "body", type: "lrichtext", label: L("المحتوى", "Content") },
      { key: "maxWidth", type: "select", label: L("عرض النص", "Text width"), width: "half", options: [{ value: "narrow", label: L("ضيّق (سهل القراءة)", "Narrow (easy to read)") }, { value: "wide", label: L("عريض", "Wide") }] },
      { key: "twoColumns", type: "boolean", label: L("عمودان", "Two columns"), width: "half" },
    ],
    defaults: () => ({ eyebrow: L("", ""), title: L("عنوان", "Heading"), subtitle: L("", ""), body: L("<p>اكتب النص هنا…</p>", "<p>Write your text here…</p>"), maxWidth: "narrow", twoColumns: false }),
  },

  testimonials: {
    type: "testimonials",
    name: L("آراء العملاء", "Testimonials"),
    description: L("اقتباسات من عملاء سابقين", "Quotes from previous clients"),
    icon: "Quote",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "items",
        type: "list",
        label: L("الآراء", "Testimonials"),
        itemFields: [
          { key: "name", type: "ltext", label: L("الاسم", "Name") },
          { key: "role", type: "ltext", label: L("الصفة / المشروع", "Role / project") },
          { key: "quote", type: "ltextarea", label: L("الرأي", "Quote") },
          { key: "rating", type: "number", label: L("التقييم (1-5)", "Rating (1-5)"), min: 1, max: 5, width: "half" },
          { key: "avatarUrl", type: "media", accept: "image", label: L("صورة (اختياري)", "Photo (optional)") },
        ],
        newItem: () => ({ name: L("اسم العميل", "Client name"), role: L("", ""), quote: L("", ""), rating: 5, avatarUrl: "" }),
      },
      columnsField(3),
    ],
    defaults: () => ({
      eyebrow: L("آراء عملائنا", "Client testimonials"),
      title: L("ثقة عملائنا هي أهم إنجازاتنا", "Our clients' trust is our biggest achievement"),
      subtitle: L("", ""),
      items: [
        { name: L("أبو محمد", "Abu Mohammed"), role: L("فيلا سكنية — الجهراء", "Villa — Jahra"), quote: L("التزموا بالموعد والمواصفات، والتشطيب كان أفضل مما توقعت.", "They kept the schedule and specs, and the finishing was better than I expected."), rating: 5, avatarUrl: "" },
        { name: L("شركة الخليج", "Gulf Co."), role: L("مبنى تجاري — حولي", "Commercial building — Hawally"), quote: L("مكتبهم الهندسي أنهى لنا كل المعاملات دون أي تأخير.", "Their engineering office finished all the paperwork without any delay."), rating: 5, avatarUrl: "" },
        { name: L("أم عبدالله", "Um Abdullah"), role: L("عمارة سكنية — الفروانية", "Apartment building — Farwaniya"), quote: L("تعامل راقٍ وأسعار واضحة من البداية للنهاية.", "Professional treatment and transparent prices from start to finish."), rating: 5, avatarUrl: "" },
      ],
      columns: "3",
    }),
  },

  partners: {
    type: "partners",
    name: L("شركاء وعملاء (شعارات)", "Partners & clients (logos)"),
    description: L("شريط شعارات متحرك", "Scrolling logo strip"),
    icon: "Handshake",
    category: "content",
    fields: [
      { key: "title", type: "ltext", label: L("العنوان", "Title") },
      {
        key: "items",
        type: "list",
        label: L("الشعارات", "Logos"),
        itemFields: [
          { key: "logoUrl", type: "media", accept: "image", label: L("الشعار", "Logo") },
          { key: "name", type: "text", label: L("الاسم", "Name"), width: "half" },
          { key: "href", type: "url", label: L("رابط", "Link"), width: "half" },
        ],
        newItem: () => ({ logoUrl: "", name: "", href: "" }),
      },
      { key: "marquee", type: "boolean", label: L("حركة مستمرة", "Continuous scrolling"), width: "half" },
      { key: "grayscale", type: "boolean", label: L("رمادي حتى التمرير", "Grayscale until hover"), width: "half" },
    ],
    defaults: () => ({ title: L("عملاء وثقوا بنا", "Clients who trusted us"), items: [], marquee: true, grayscale: true }),
    defaultStyle: { paddingY: "md" },
  },

  faq: {
    type: "faq",
    name: L("الأسئلة الشائعة", "FAQ"),
    description: L("أسئلة وأجوبة قابلة للطي", "Collapsible questions and answers"),
    icon: "CircleHelp",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "items",
        type: "list",
        label: L("الأسئلة", "Questions"),
        itemFields: [
          { key: "q", type: "ltext", label: L("السؤال", "Question") },
          { key: "a", type: "ltextarea", label: L("الجواب", "Answer") },
        ],
        newItem: () => ({ q: L("سؤال جديد؟", "New question?"), a: L("", "") }),
      },
    ],
    defaults: () => ({
      eyebrow: L("الأسئلة الشائعة", "FAQ"),
      title: L("أسئلة يكثر سؤالها", "Frequently asked questions"),
      subtitle: L("", ""),
      items: [
        { q: L("هل تنهون معاملات البلدية والتراخيص؟", "Do you handle municipality permits and paperwork?"), a: L("نعم، مكتبنا الهندسي يُعدّ المخططات ويتابع جميع المعاملات والاعتمادات نيابةً عنك.", "Yes. Our engineering office prepares the drawings and follows up all permits and approvals on your behalf.") },
        { q: L("كم تستغرق مدة بناء فيلا؟", "How long does a villa take to build?"), a: L("تختلف حسب المساحة والتشطيب، وعادةً بين 10 و 16 شهراً، ونحدد الجدول الزمني في العقد.", "It depends on size and finishing, usually 10–16 months. The schedule is fixed in the contract.") },
        { q: L("هل تقدمون ضماناً على الأعمال؟", "Do you offer a warranty?"), a: L("نعم، جميع أعمالنا مشمولة بضمان مكتوب حسب نوع العمل.", "Yes, all our works are covered by a written warranty depending on the type of work.") },
      ],
    }),
  },

  contact: {
    type: "contact",
    name: L("نموذج التواصل", "Contact form"),
    description: L("نموذج + بيانات الاتصال + خريطة", "Form + contact details + map"),
    icon: "Mail",
    category: "conversion",
    fields: [
      ...sectionHeadingFields(),
      { key: "showForm", type: "boolean", label: L("إظهار النموذج", "Show form"), width: "half" },
      { key: "showInfo", type: "boolean", label: L("إظهار بيانات الاتصال", "Show contact details"), width: "half" },
      { key: "showMap", type: "boolean", label: L("إظهار الخريطة", "Show map"), width: "half" },
      { key: "showServiceSelect", type: "boolean", label: L("حقل اختيار الخدمة", "Service select field"), width: "half" },
      { key: "showEmailField", type: "boolean", label: L("حقل البريد الإلكتروني", "Email field"), width: "half" },
      {
        key: "formMode",
        type: "select",
        label: L("طريقة الإرسال", "Submission mode"),
        width: "half",
        options: [
          { value: "save", label: L("حفظ في لوحة التحكم", "Save to admin inbox") },
          { value: "whatsapp", label: L("فتح واتساب برسالة جاهزة", "Open WhatsApp with the message") },
          { value: "both", label: L("الاثنان معاً", "Both") },
        ],
      },
      { key: "formTitle", type: "ltext", label: L("عنوان النموذج", "Form title") },
      { key: "buttonLabel", type: "ltext", label: L("نص زر الإرسال", "Submit button text") },
    ],
    defaults: () => ({
      eyebrow: L("تواصل معنا", "Contact us"),
      title: L("نسعد بخدمتك — اتصل أو أرسل رسالة", "We'd love to help — call or send a message"),
      subtitle: L("", ""),
      showForm: true,
      showInfo: true,
      showMap: true,
      showServiceSelect: true,
      showEmailField: true,
      formMode: "both",
      formTitle: L("أرسل لنا رسالة", "Send us a message"),
      buttonLabel: L("إرسال", "Send"),
    }),
  },

  map: {
    type: "map",
    name: L("خريطة", "Map"),
    description: L("خريطة جوجل لموقع الشركة", "Google map of your location"),
    icon: "MapPin",
    category: "conversion",
    fields: [
      { key: "embedUrl", type: "url", label: L("رابط التضمين (فارغ = من الإعدادات)", "Embed URL (empty = from settings)") },
      { key: "height", type: "number", label: L("الارتفاع (بكسل)", "Height (px)"), min: 200, max: 900, width: "half" },
    ],
    defaults: () => ({ embedUrl: "", height: 420 }),
    defaultStyle: { paddingY: "none", container: "full" },
  },

  marquee: {
    type: "marquee",
    name: L("شريط متحرك", "Ticker strip"),
    description: L("كلمات تتحرك أفقياً بين الأقسام", "Words scrolling horizontally between sections"),
    icon: "MoveHorizontal",
    category: "layout",
    fields: [
      {
        key: "items",
        type: "list",
        label: L("العناصر", "Items"),
        itemFields: [{ key: "text", type: "ltext", label: L("النص", "Text") }],
        newItem: () => ({ text: L("عنصر", "Item") }),
      },
      { key: "speed", type: "number", label: L("السرعة (ثواني للدورة)", "Speed (seconds per loop)"), min: 5, max: 120, width: "half" },
      { key: "separator", type: "text", label: L("الفاصل", "Separator"), width: "half" },
    ],
    defaults: () => ({
      items: [
        { text: L("أعمال البناء", "Construction") },
        { text: L("الحفر", "Excavation") },
        { text: L("التشطيب", "Finishing") },
        { text: L("المقاولات العامة", "General contracting") },
        { text: L("المخططات", "Drawings") },
        { text: L("المكتب الهندسي", "Engineering office") },
        { text: L("المعاملات والتراخيص", "Permits & paperwork") },
      ],
      speed: 35,
      separator: "✦",
    }),
    defaultStyle: { paddingY: "sm", container: "full", theme: "dark", background: { type: "color", color: "#d4a12a", gradientFrom: "", gradientTo: "", gradientAngle: 0, mediaUrl: "", posterUrl: "", overlayColor: "", overlayOpacity: 0, overlayStyle: "solid", parallax: false, pattern: "grid" } },
  },

  image: {
    type: "image",
    name: L("صورة", "Image"),
    description: L("صورة واحدة مع تعليق", "A single image with a caption"),
    icon: "Image",
    category: "media",
    fields: [
      { key: "url", type: "media", accept: "image", label: L("الصورة", "Image") },
      { key: "alt", type: "ltext", label: L("وصف بديل", "Alt text") },
      { key: "caption", type: "ltext", label: L("تعليق", "Caption") },
      { key: "href", type: "url", label: L("رابط عند النقر", "Link on click") },
      { key: "width", type: "select", label: L("العرض", "Width"), width: "half", options: [{ value: "content", label: L("عادي", "Normal") }, { value: "full", label: L("كامل الشاشة", "Full bleed") }] },
      { key: "rounded", type: "boolean", label: L("زوايا دائرية", "Rounded corners"), width: "half" },
    ],
    defaults: () => ({ url: "", alt: L("", ""), caption: L("", ""), href: "", width: "content", rounded: true }),
  },

  spacer: {
    type: "spacer",
    name: L("مسافة / فاصل", "Spacer / divider"),
    description: L("مسافة فارغة أو خط فاصل بين الأقسام", "Empty space or a divider line between sections"),
    icon: "SeparatorHorizontal",
    category: "layout",
    fields: [
      { key: "height", type: "number", label: L("الارتفاع (بكسل)", "Height (px)"), min: 0, max: 400, width: "half" },
      { key: "line", type: "boolean", label: L("خط فاصل", "Divider line"), width: "half" },
    ],
    defaults: () => ({ height: 40, line: false }),
    defaultStyle: { paddingY: "none" },
  },

  team: {
    type: "team",
    name: L("فريق العمل", "Team"),
    description: L("أعضاء الفريق مع الصور والصفات", "Team members with photos and roles"),
    icon: "Users",
    category: "content",
    fields: [
      ...sectionHeadingFields(),
      {
        key: "items",
        type: "list",
        label: L("الأعضاء", "Members"),
        itemFields: [
          { key: "photoUrl", type: "media", accept: "image", label: L("الصورة", "Photo") },
          { key: "name", type: "ltext", label: L("الاسم", "Name") },
          { key: "role", type: "ltext", label: L("الصفة", "Role") },
          { key: "phone", type: "text", label: L("الهاتف", "Phone"), width: "half" },
          { key: "email", type: "text", label: L("البريد", "Email"), width: "half" },
        ],
        newItem: () => ({ photoUrl: "", name: L("الاسم", "Name"), role: L("الصفة", "Role"), phone: "", email: "" }),
      },
      columnsField(4),
    ],
    defaults: () => ({ eyebrow: L("فريقنا", "Our team"), title: L("خبرات هندسية وفنية تعمل لخدمتك", "Engineering and technical expertise at your service"), subtitle: L("", ""), items: [], columns: "4" }),
  },

  html: {
    type: "html",
    name: L("كود HTML مخصص", "Custom HTML"),
    description: L("للمستخدم المتقدم: أدخل كود HTML خاص", "Advanced: insert your own HTML code"),
    icon: "Code",
    category: "layout",
    fields: [{ key: "code", type: "code", label: L("الكود", "Code") }],
    defaults: () => ({ code: "<div style=\"text-align:center\">HTML</div>" }),
  },
};

export const BLOCK_ORDER: BlockType[] = ["hero", "pageHeader", "about", "services", "projects", "buildingTypes", "features", "stats", "steps", "cta", "testimonials", "partners", "faq", "team", "gallery", "video", "image", "richText", "contact", "map", "marquee", "spacer", "html"];

export const BLOCK_CATEGORIES: { key: BlockDefinition["category"]; label: LText }[] = [
  { key: "hero", label: L("الواجهة", "Headers") },
  { key: "content", label: L("المحتوى", "Content") },
  { key: "lists", label: L("الخدمات والمشاريع", "Services & projects") },
  { key: "conversion", label: L("التواصل", "Contact") },
  { key: "media", label: L("الوسائط", "Media") },
  { key: "layout", label: L("التخطيط", "Layout") },
];

/* ------------------------------ style ------------------------------ */

export const DEFAULT_STYLE: BlockStyle = {
  anchor: "",
  theme: "light",
  background: { type: "none", color: "#ffffff", gradientFrom: "#233283", gradientTo: "#0f172a", gradientAngle: 135, mediaUrl: "", posterUrl: "", overlayColor: "#0b1244", overlayOpacity: 60, overlayStyle: "solid", parallax: false, pattern: "grid" },
  textColor: "",
  headingColor: "",
  accentColor: "",
  paddingY: "lg",
  container: "default",
  align: "start",
  radius: "inherit",
  animation: "fade-up",
  hideOnMobile: false,
  hideOnDesktop: false,
  customClass: "",
};

export const STYLE_FIELDS: Field[] = [
  {
    key: "theme",
    type: "select",
    label: L("لون النص الافتراضي", "Default text tone"),
    width: "half",
    options: [
      { value: "light", label: L("نص داكن (خلفية فاتحة)", "Dark text (light background)") },
      { value: "dark", label: L("نص أبيض (خلفية داكنة)", "White text (dark background)") },
    ],
  },
  {
    key: "paddingY",
    type: "select",
    label: L("المسافة العمودية", "Vertical spacing"),
    width: "half",
    options: [
      { value: "none", label: L("بدون", "None") },
      { value: "sm", label: L("صغيرة", "Small") },
      { value: "md", label: L("متوسطة", "Medium") },
      { value: "lg", label: L("كبيرة", "Large") },
      { value: "xl", label: L("كبيرة جداً", "Extra large") },
    ],
  },
  {
    key: "background",
    type: "group",
    label: L("الخلفية", "Background"),
    fields: [
      {
        key: "type",
        type: "select",
        label: L("نوع الخلفية", "Background type"),
        options: [
          { value: "none", label: L("بدون (لون الموقع)", "None (site color)") },
          { value: "color", label: L("لون", "Solid color") },
          { value: "gradient", label: L("تدرج لوني", "Gradient") },
          { value: "image", label: L("صورة", "Image") },
          { value: "video", label: L("فيديو", "Video") },
          { value: "pattern", label: L("نقش هندسي", "Pattern") },
        ],
      },
      { key: "color", type: "color", label: L("اللون", "Color"), width: "half", showIf: (v) => ["color", "pattern"].includes(v.type) },
      { key: "gradientFrom", type: "color", label: L("من لون", "From color"), width: "half", showIf: (v) => v.type === "gradient" },
      { key: "gradientTo", type: "color", label: L("إلى لون", "To color"), width: "half", showIf: (v) => v.type === "gradient" },
      { key: "gradientAngle", type: "number", label: L("زاوية التدرج", "Gradient angle"), width: "half", min: 0, max: 360, showIf: (v) => v.type === "gradient" },
      { key: "pattern", type: "select", label: L("النقش", "Pattern"), width: "half", showIf: (v) => v.type === "pattern", options: [{ value: "grid", label: L("شبكة", "Grid") }, { value: "dots", label: L("نقاط", "Dots") }, { value: "diagonal", label: L("خطوط مائلة", "Diagonal lines") }] },
      { key: "mediaUrl", type: "media", accept: "image", label: L("صورة الخلفية", "Background image"), showIf: (v) => v.type === "image" },
      { key: "mediaUrl", type: "media", accept: "video", label: L("فيديو الخلفية", "Background video"), showIf: (v) => v.type === "video" },
      { key: "posterUrl", type: "media", accept: "image", label: L("صورة بديلة قبل تشغيل الفيديو", "Poster image before video plays"), showIf: (v) => v.type === "video" },
      { key: "parallax", type: "boolean", label: L("تأثير ثبات الخلفية (Parallax)", "Fixed background (parallax)"), width: "half", showIf: (v) => v.type === "image" },
      { key: "overlayColor", type: "color", label: L("لون الطبقة فوق الصورة", "Overlay color"), width: "half", showIf: (v) => ["image", "video"].includes(v.type) },
      { key: "overlayOpacity", type: "number", label: L("شفافية الطبقة (%)", "Overlay opacity (%)"), width: "half", min: 0, max: 100, showIf: (v) => ["image", "video"].includes(v.type) },
      {
        key: "overlayStyle",
        type: "select",
        label: L("شكل الطبقة", "Overlay style"),
        width: "half",
        showIf: (v) => ["image", "video"].includes(v.type),
        options: [
          { value: "solid", label: L("موحّدة", "Solid") },
          { value: "fade-start", label: L("داكنة عند النص وتتلاشى", "Dark at the text side, fading out") },
          { value: "fade-bottom", label: L("داكنة في الأسفل", "Dark at the bottom") },
          { value: "fade-top", label: L("داكنة في الأعلى", "Dark at the top") },
        ],
      },
    ],
  },
  { key: "headingColor", type: "color", label: L("لون العناوين (اختياري)", "Heading color (optional)"), width: "half" },
  { key: "textColor", type: "color", label: L("لون النص (اختياري)", "Text color (optional)"), width: "half" },
  { key: "accentColor", type: "color", label: L("اللون المميز للقسم (اختياري)", "Section accent color (optional)"), width: "half" },
  {
    key: "align",
    type: "select",
    label: L("محاذاة العناوين", "Heading alignment"),
    width: "half",
    options: [
      { value: "start", label: L("البداية", "Start") },
      { value: "center", label: L("المنتصف", "Center") },
      { value: "end", label: L("النهاية", "End") },
    ],
  },
  {
    key: "container",
    type: "select",
    label: L("عرض المحتوى", "Content width"),
    width: "half",
    options: [
      { value: "narrow", label: L("ضيّق", "Narrow") },
      { value: "default", label: L("عادي", "Default") },
      { value: "wide", label: L("عريض", "Wide") },
      { value: "full", label: L("كامل الشاشة", "Full width") },
    ],
  },
  {
    key: "animation",
    type: "select",
    label: L("حركة الظهور", "Entrance animation"),
    width: "half",
    options: [
      { value: "none", label: L("بدون", "None") },
      { value: "fade", label: L("تلاشي", "Fade") },
      { value: "fade-up", label: L("تلاشي للأعلى", "Fade up") },
    ],
  },
  { key: "anchor", type: "text", label: L("معرّف الرابط (مثل services)", "Anchor id (e.g. services)"), width: "half", placeholder: "services" },
  { key: "hideOnMobile", type: "boolean", label: L("إخفاء على الجوال", "Hide on mobile"), width: "half" },
  { key: "hideOnDesktop", type: "boolean", label: L("إخفاء على الكمبيوتر", "Hide on desktop"), width: "half" },
  { key: "customClass", type: "text", label: L("CSS class إضافي (متقدم)", "Extra CSS class (advanced)"), width: "half" },
];

/* ------------------------------ factories ------------------------------ */

export function createBlock(type: BlockType, overrides: { content?: Record<string, any>; style?: Partial<BlockStyle>; label?: string; enabled?: boolean } = {}): Block {
  const def = BLOCKS[type];
  const style: BlockStyle = {
    ...DEFAULT_STYLE,
    ...(def.defaultStyle || {}),
    ...(overrides.style || {}),
    background: { ...DEFAULT_STYLE.background, ...(def.defaultStyle?.background || {}), ...(overrides.style?.background || {}) },
  };
  return {
    id: uid("b"),
    type,
    enabled: overrides.enabled ?? true,
    label: overrides.label ?? "",
    content: { ...def.defaults(), ...(overrides.content || {}) },
    style,
  };
}

/** Fill missing keys with defaults (so blocks saved by older versions keep working) */
export function normalizeBlock(raw: any): Block | null {
  if (!raw || !BLOCKS[raw.type as BlockType]) return null;
  const def = BLOCKS[raw.type as BlockType];
  const defaults = def.defaults();
  return {
    id: raw.id || uid("b"),
    type: raw.type,
    enabled: raw.enabled !== false,
    label: raw.label || "",
    content: { ...defaults, ...(raw.content || {}) },
    style: {
      ...DEFAULT_STYLE,
      ...(def.defaultStyle || {}),
      ...(raw.style || {}),
      background: { ...DEFAULT_STYLE.background, ...(def.defaultStyle?.background || {}), ...(raw.style?.background || {}) },
    },
  };
}

export function normalizeBlocks(raw: any): Block[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeBlock).filter(Boolean) as Block[];
}
