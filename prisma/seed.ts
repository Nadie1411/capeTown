/* Seeds the database with the first admin user, site settings, services, projects and pages.
   Safe to re-run: it only fills tables that are empty. Use `--reset` to wipe and reseed content. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS } from "../src/lib/settings-defaults";
import { createBlock } from "../src/blocks/registry";
import { L } from "../src/lib/utils";

const prisma = new PrismaClient();
const reset = process.argv.includes("--reset");

const services = [
  { slug: "construction", icon: "HardHat", cover: "/photos/service-construction.jpg", title: L("أعمال البناء", "Construction works"), summary: L("تنفيذ الهيكل الإنشائي كاملاً من الأساسات حتى السقف الأخير بأعلى معايير الجودة والسلامة.", "Complete structural execution from foundations to the last slab, to the highest quality and safety standards."), body: L("<p>ننفّذ جميع أعمال البناء للمباني السكنية والفلل والعمارات والمباني التجارية والحكومية: الأساسات، الأعمدة، الأسقف، الجدران، وأعمال الطابوق، وفق المخططات المعتمدة ومواصفات بلدية الكويت.</p><ul><li>فريق هندسي مشرف على الموقع طوال فترة التنفيذ</li><li>مواد بناء معتمدة وفحوصات دورية للخرسانة</li><li>جدول زمني واضح ومتابعة أسبوعية مع العميل</li></ul>", "<p>We execute all construction works for residential buildings, villas, apartment blocks, commercial and government buildings: foundations, columns, slabs, walls and blockwork, according to approved drawings and Kuwait Municipality specifications.</p><ul><li>Site engineers supervising throughout execution</li><li>Certified materials and periodic concrete testing</li><li>Clear schedule with weekly client updates</li></ul>") },
  { slug: "excavation", icon: "Shovel", cover: "/photos/service-excavation.jpg", title: L("أعمال الحفر", "Excavation"), summary: L("حفر وتسوية ونقل الأتربة وتجهيز الموقع للأساسات بمعدات حديثة.", "Excavation, levelling, soil removal and site preparation with modern equipment."), body: L("<p>نجهّز الموقع للبناء: حفر الأساسات والسراديب، تسوية الأرض، نقل الأتربة، دك التربة، وأعمال الدعم والتخفيض تحت إشراف هندسي.</p>", "<p>We prepare the site for construction: foundation and basement excavation, levelling, soil removal, compaction and shoring works under engineering supervision.</p>") },
  { slug: "finishing", icon: "PaintRoller", cover: "/photos/service-finishing.jpg", title: L("أعمال التشطيب", "Finishing works"), summary: L("تشطيب كامل: بلاط، رخام، جبس، دهانات، أبواب، وتمديدات — حتى تسليم المفتاح.", "Complete finishing: tiles, marble, gypsum, paint, doors and installations — up to key handover."), body: L("<p>نقدّم تشطيباً متكاملاً بجودة عالية ومواد مختارة بعناية: الأرضيات والرخام، الأسقف الجبسية، الدهانات، الأبواب والنوافذ، الأعمال الصحية والكهربائية والتكييف.</p>", "<p>We deliver complete high-quality finishing with carefully selected materials: flooring and marble, gypsum ceilings, paint, doors and windows, plumbing, electrical and HVAC works.</p>") },
  { slug: "general-contracting", icon: "Briefcase", cover: "/photos/service-contracting.jpg", title: L("المقاولات العامة", "General contracting"), summary: L("إدارة المشروع بالكامل من جهة واحدة: التخطيط، التوريد، التنفيذ، والتسليم.", "Full project management from one partner: planning, procurement, execution and handover."), body: L("<p>نتولى المشروع من البداية إلى النهاية: إعداد الجداول، التعاقد مع الموردين، إدارة الفرق، ضبط الجودة، والتسليم النهائي مع الضمان.</p>", "<p>We manage the project end to end: scheduling, supplier contracting, crew management, quality control and final handover with warranty.</p>") },
  { slug: "drawings-design", icon: "DraftingCompass", cover: "/photos/service-drawings.jpg", title: L("المخططات والتصاميم", "Drawings & design"), summary: L("مخططات معمارية وإنشائية وتصاميم داخلية وواجهات ثلاثية الأبعاد.", "Architectural and structural drawings, interior design and 3D façade visualisation."), body: L("<p>يُعدّ مكتبنا الهندسي المخططات المعمارية والإنشائية والكهربائية والصحية، مع تصاميم ثلاثية الأبعاد للواجهات والديكور الداخلي لتشاهد مشروعك قبل البدء.</p>", "<p>Our engineering office prepares architectural, structural, electrical and plumbing drawings, with 3D visuals of façades and interiors so you see your project before it starts.</p>") },
  { slug: "engineering-office", icon: "PencilRuler", cover: "/photos/service-engineering-office.jpg", title: L("المكتب الهندسي", "Engineering office"), summary: L("إشراف هندسي، دراسات، حساب كميات، واستشارات فنية.", "Engineering supervision, studies, quantity surveying and technical consulting."), body: L("<p>مهندسون معتمدون يقدمون الإشراف على التنفيذ، دراسات الجدوى، حساب الكميات والتكاليف، والاستشارات الفنية لأي مرحلة من مراحل مشروعك.</p>", "<p>Certified engineers providing execution supervision, feasibility studies, quantity and cost estimation, and technical consulting for any stage of your project.</p>") },
  { slug: "permits", icon: "FileCheck", cover: "/photos/service-permits.jpg", title: L("المعاملات والتراخيص", "Permits & paperwork"), summary: L("إنهاء جميع معاملات البناء: البلدية، وزارة الكهرباء، الإطفاء، وشهادات الإنجاز.", "We finish all construction paperwork: Municipality, MEW, Fire Department and completion certificates."), body: L("<p>نتابع نيابةً عنك جميع المعاملات المتعلقة بالبناء: رخصة البناء من البلدية، اعتماد المخططات، توصيل الكهرباء والماء، موافقات الإطفاء، حتى شهادة الإنجاز — دون أن تحتاج لمراجعة أي جهة.</p>", "<p>We handle all construction paperwork on your behalf: building permits from the Municipality, drawing approvals, electricity and water connection, Fire Department approvals, up to the completion certificate — without you visiting any authority.</p>") },
  { slug: "maintenance", icon: "Wrench", cover: "/photos/service-maintenance.jpg", title: L("الصيانة والترميم", "Maintenance & renovation"), summary: L("ترميم المباني القديمة، معالجة التشققات، وتجديد الواجهات والتشطيبات.", "Renovation of older buildings, crack treatment, façade and finishing refurbishment."), body: L("<p>نعيد الحياة للمباني القائمة: ترميم إنشائي، عزل الأسطح، معالجة الرطوبة والتشققات، وتجديد الواجهات والتشطيبات الداخلية.</p>", "<p>We bring existing buildings back to life: structural repair, roof insulation, damp and crack treatment, and façade and interior renovation.</p>") },
];

const projects = [
  { slug: "villa-jahra", category: "villa", cover: "/photos/project-villa-jahra.jpg", title: L("فيلا سكنية — الجهراء", "Private villa — Jahra"), location: L("الجهراء، الكويت", "Jahra, Kuwait"), year: "2024", client: "", summary: L("فيلا مكوّنة من دورين وسرداب بمساحة 600 م² — بناء وتشطيب كامل حتى تسليم المفتاح.", "Two-storey villa with basement, 600 m² — full construction and finishing to key handover."), body: L("<p>تم تنفيذ المشروع خلال 14 شهراً شاملاً الحفر والهيكل الإنشائي والتشطيب الداخلي والخارجي، مع تصميم واجهة عصرية بالحجر الطبيعي.</p>", "<p>Delivered in 14 months including excavation, structure, and interior/exterior finishing, with a modern natural-stone façade.</p>") },
  { slug: "building-farwaniya", category: "building", cover: "/photos/project-building-farwaniya.jpg", title: L("عمارة استثمارية — الفروانية", "Investment building — Farwaniya"), location: L("الفروانية، الكويت", "Farwaniya, Kuwait"), year: "2023", client: "", summary: L("عمارة سكنية استثمارية من 6 أدوار و24 شقة — بناء وتشطيب ومعاملات.", "6-storey investment building with 24 apartments — construction, finishing and permits."), body: L("<p>تولّينا المشروع من رخصة البناء حتى شهادة الإنجاز، مع نظام تكييف مركزي ومصعدين وواجهة زجاجية.</p>", "<p>We handled the project from the building permit to the completion certificate, including central HVAC, two lifts and a glass façade.</p>") },
  { slug: "commercial-hawally", category: "commercial", cover: "/photos/project-commercial-hawally.jpg", title: L("مبنى تجاري — حولي", "Commercial building — Hawally"), location: L("حولي، الكويت", "Hawally, Kuwait"), year: "2023", client: "", summary: L("مجمع تجاري بمحلات ومكاتب على 4 أدوار مع مواقف سيارات.", "Commercial complex with shops and offices on 4 floors plus parking."), body: L("<p>هيكل إنشائي بخرسانة مسلحة، واجهات ألمنيوم وزجاج، وتشطيبات تجارية عالية التحمل.</p>", "<p>Reinforced concrete structure, aluminium and glass façades and heavy-duty commercial finishing.</p>") },
  { slug: "government-building", category: "government", cover: "/photos/project-government.jpg", title: L("مبنى حكومي — العاصمة", "Government building — Capital"), location: L("مدينة الكويت", "Kuwait City"), year: "2022", client: "", summary: L("تنفيذ وتشطيب مبنى إداري حكومي وفق مواصفات الجهات الرسمية.", "Execution and finishing of a government administrative building to official specifications."), body: L("<p>مشروع بمناقصة حكومية تم تسليمه في موعده مع الالتزام الكامل بمواصفات السلامة والإطفاء.</p>", "<p>A government tender project delivered on schedule with full compliance to safety and fire specifications.</p>") },
  { slug: "residential-sabah-al-ahmad", category: "residential", cover: "/photos/project-house-sabah.jpg", title: L("بيت سكني — صباح الأحمد", "Family house — Sabah Al-Ahmad"), location: L("مدينة صباح الأحمد", "Sabah Al-Ahmad City"), year: "2024", client: "", summary: L("بيت من 3 أدوار بمساحة 400 م² — من المخططات إلى التسليم.", "3-storey house, 400 m² — from drawings to handover."), body: L("<p>أعدّ مكتبنا الهندسي المخططات وأنهى المعاملات، ثم نفّذنا البناء والتشطيب بالكامل.</p>", "<p>Our engineering office prepared the drawings and permits, then we executed the full construction and finishing.</p>") },
  { slug: "villa-renovation-salmiya", category: "villa", cover: "/photos/project-villa-salmiya.jpg", title: L("ترميم وتجديد فيلا — السالمية", "Villa renovation — Salmiya"), location: L("السالمية، الكويت", "Salmiya, Kuwait"), year: "2025", client: "", summary: L("تجديد كامل لفيلا قديمة: ترميم إنشائي، واجهة جديدة، وتشطيب عصري.", "Complete renovation of an older villa: structural repair, new façade and modern finishing."), body: L("<p>معالجة التشققات والرطوبة، عزل السطح، وتجديد الواجهة والتشطيبات الداخلية خلال 6 أشهر.</p>", "<p>Crack and damp treatment, roof insulation, and renewed façade and interiors within 6 months.</p>") },
];

function photoBg(url: string, opacity = 75) {
  return { type: "image", color: "#233283", gradientFrom: "#233283", gradientTo: "#0f172a", gradientAngle: 135, mediaUrl: url, posterUrl: "", overlayColor: "#0b1244", overlayOpacity: opacity, overlayStyle: "solid", parallax: false, pattern: "grid" } as any;
}

function homeBlocks() {
  return [
    createBlock("hero", { label: "Hero" }),
    createBlock("services", { style: { anchor: "services" } }),
    createBlock("about", { style: { anchor: "about" } }),
    createBlock("buildingTypes", { style: { background: { type: "color", color: "#f4f6fb" } as any } }),
    createBlock("features", { style: { anchor: "why-us" } }),
    createBlock("stats"),
    createBlock("projects", { style: { anchor: "projects" } }),
    createBlock("steps", { style: { background: { type: "color", color: "#f4f6fb" } as any } }),
    createBlock("testimonials"),
    createBlock("faq", { style: { background: { type: "color", color: "#f4f6fb" } as any } }),
    createBlock("cta"),
    createBlock("contact", { style: { anchor: "contact" }, content: { showMap: true } }),
  ];
}

const pages = [
  { slug: "home", isHome: true, title: L("الرئيسية", "Home"), blocks: homeBlocks, seo: { title: L("كيب تاون للتجارة العامة والمقاولات — مقاولات وبناء في الكويت", "Cape Town General Trading & Contracting — Construction in Kuwait"), description: L("", ""), ogImageUrl: "", noIndex: false } },
  {
    slug: "about",
    title: L("من نحن", "About us"),
    blocks: () => [
      createBlock("pageHeader", { content: { title: L("من نحن", "About us"), subtitle: L("شركة كويتية للتجارة العامة والمقاولات — خبرة، دقة، والتزام.", "A Kuwaiti general trading & contracting company — experience, precision and commitment.") }, style: { background: photoBg("/photos/kuwait-skyline.jpg", 78) } }),
      createBlock("about", { content: { eyebrow: L("قصتنا", "Our story") } }),
      createBlock("stats"),
      createBlock("features", { content: { eyebrow: L("قيمنا", "Our values") } }),
      createBlock("steps", { style: { background: { type: "color", color: "#f4f6fb" } as any } }),
      createBlock("team", { content: { items: [] } }),
      createBlock("cta"),
    ],
  },
  {
    slug: "services",
    title: L("خدماتنا", "Our services"),
    blocks: () => [
      createBlock("pageHeader", { content: { title: L("خدماتنا", "Our services"), subtitle: L("كل ما يحتاجه مشروعك من الحفر حتى التسليم — من جهة واحدة.", "Everything your project needs, from excavation to handover — from one partner.") }, style: { background: photoBg("/photos/engineer-inspection.jpg", 76) } }),
      createBlock("services", { content: { eyebrow: L("", ""), title: L("", ""), subtitle: L("", ""), source: "all", limit: 24, columns: "3", cardStyle: "image", showButton: false }, style: { background: { type: "none" } as any } }),
      createBlock("buildingTypes", { style: { background: { type: "color", color: "#f4f6fb" } as any } }),
      createBlock("faq"),
      createBlock("cta"),
    ],
  },
  {
    slug: "projects",
    title: L("أعمالنا", "Our projects"),
    blocks: () => [
      createBlock("pageHeader", { content: { title: L("أعمالنا السابقة", "Our previous work"), subtitle: L("نماذج من المشاريع التي نفّذناها في مختلف مناطق الكويت.", "A selection of projects we delivered across Kuwait.") }, style: { background: photoBg("/photos/hero-construction-site.jpg", 76) } }),
      createBlock("projects", { content: { eyebrow: L("", ""), title: L("", ""), subtitle: L("", ""), source: "all", limit: 60, showButton: false } }),
      createBlock("testimonials", { style: { background: { type: "color", color: "#f4f6fb" } as any } }),
      createBlock("cta"),
    ],
  },
  {
    slug: "contact",
    title: L("تواصل معنا", "Contact us"),
    blocks: () => [
      createBlock("pageHeader", { content: { title: L("تواصل معنا", "Contact us"), subtitle: L("اتصل بنا، راسلنا على واتساب، أو زرنا في مكتبنا.", "Call us, message us on WhatsApp, or visit our office.") }, style: { background: photoBg("/photos/kuwait-skyline-sunset.jpg", 78) } }),
      createBlock("contact", { content: { eyebrow: L("", ""), title: L("", ""), showMap: false } }),
      createBlock("map", { content: { height: 460 } }),
    ],
  },
];

async function main() {
  if (reset) {
    await prisma.$transaction([prisma.page.deleteMany(), prisma.service.deleteMany(), prisma.project.deleteMany(), prisma.media.deleteMany(), prisma.setting.deleteMany()]);
    console.log("• content reset");
  }

  if ((await prisma.user.count()) === 0) {
    const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    await prisma.user.create({ data: { email, name: "Admin", passwordHash: await bcrypt.hash(password, 10) } });
    console.log(`• admin user created: ${email}`);
  }

  if (!(await prisma.setting.findUnique({ where: { id: "site" } }))) {
    const s = { ...DEFAULT_SETTINGS, seo: { ...DEFAULT_SETTINGS.seo, siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "" } };
    await prisma.setting.create({ data: { id: "site", data: JSON.stringify(s) } });
    console.log("• settings created");
  }

  if ((await prisma.service.count()) === 0) {
    let i = 0;
    for (const s of services) {
      await prisma.service.create({ data: { slug: s.slug, titleAr: s.title.ar, titleEn: s.title.en, summaryAr: s.summary.ar, summaryEn: s.summary.en, bodyAr: s.body.ar, bodyEn: s.body.en, icon: s.icon, coverUrl: s.cover, order: i++ } });
    }
    console.log(`• ${services.length} services created`);
  }

  if ((await prisma.project.count()) === 0) {
    let i = 0;
    for (const p of projects) {
      await prisma.project.create({ data: { slug: p.slug, titleAr: p.title.ar, titleEn: p.title.en, category: p.category, locationAr: p.location.ar, locationEn: p.location.en, year: p.year, client: p.client, summaryAr: p.summary.ar, summaryEn: p.summary.en, bodyAr: p.body.ar, bodyEn: p.body.en, coverUrl: p.cover, order: i++ } });
    }
    console.log(`• ${projects.length} projects created`);
  }

  if ((await prisma.page.count()) === 0) {
    for (const p of pages) {
      await prisma.page.create({ data: { slug: p.slug, isHome: !!p.isHome, titleAr: p.title.ar, titleEn: p.title.en, blocks: JSON.stringify(p.blocks()), seo: JSON.stringify(p.seo || {}) } });
    }
    console.log(`• ${pages.length} pages created`);
  }

  if ((await prisma.media.count()) === 0) {
    const photosDir = path.join(process.cwd(), "public", "photos");
    const files = fs.existsSync(photosDir) ? fs.readdirSync(photosDir).filter((f) => f.endsWith(".jpg")) : [];
    for (const f of files) {
      const stat = fs.statSync(path.join(photosDir, f));
      await prisma.media.create({ data: { kind: "image", filename: f, url: `/photos/${f}`, thumbUrl: `/photos/${f}`, mime: "image/jpeg", size: stat.size } });
    }
    const drawings = ["hero", "about", "generic", ...Array.from({ length: 6 }, (_, i) => `project-${i + 1}`), ...Array.from({ length: 8 }, (_, i) => `service-${i + 1}`)];
    for (const f of drawings) {
      await prisma.media.create({ data: { kind: "image", filename: `drawing-${f}.svg`, url: `/placeholders/${f}.svg`, thumbUrl: `/placeholders/${f}.svg`, mime: "image/svg+xml", size: 0, width: 1600, height: 1000 } });
    }
    console.log(`• ${files.length} photos + ${drawings.length} drawings registered in the media library`);
  }
  console.log("✓ seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
