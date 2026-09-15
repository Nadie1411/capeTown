import { prisma } from "@/lib/db";
import { mapLead } from "@/lib/content";
import { handle, ok } from "@/lib/api";

export const GET = handle(async () => {
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return ok({ leads: rows.map(mapLead), unread: rows.filter((r) => !r.read).length });
});
