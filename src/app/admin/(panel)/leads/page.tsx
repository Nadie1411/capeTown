import { prisma } from "@/lib/db";
import { mapLead } from "@/lib/content";
import { LeadsPage } from "./leads-page";

export const dynamic = "force-dynamic";

export default async function Leads() {
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return <LeadsPage initial={rows.map(mapLead)} />;
}
