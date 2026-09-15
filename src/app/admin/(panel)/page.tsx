import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { mapLead } from "@/lib/content";
import { Dashboard } from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [pages, services, projects, media, leads, unread, recent, settings] = await Promise.all([
    prisma.page.count(),
    prisma.service.count(),
    prisma.project.count(),
    prisma.media.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { read: false } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    getSettings(),
  ]);
  const session = await getSession();
  const me = session ? await prisma.user.findUnique({ where: { id: session.sub } }) : null;
  const usingDefaultPassword = me ? await bcrypt.compare(process.env.ADMIN_PASSWORD || "ChangeMe123!", me.passwordHash) : false;
  const checklist = {
    phone: !/0000 0000/.test(settings.contact.phones[0]?.number || ""),
    logo: !!settings.brand.logoUrl,
    siteUrl: !!settings.seo.siteUrl && !settings.seo.siteUrl.includes("localhost"),
    password: !usingDefaultPassword,
  };
  return <Dashboard counts={{ pages, services, projects, media, leads, unread }} recent={recent.map(mapLead)} checklist={checklist} />;
}
