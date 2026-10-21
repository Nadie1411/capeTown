import { prisma } from "@/lib/db";
import { mapMedia } from "@/lib/content";
import { handle, ok } from "@/lib/api";

export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const q = url.searchParams.get("q")?.trim();
  const rows = await prisma.media.findMany({
    where: { ...(kind && kind !== "any" ? { kind } : {}), ...(q ? { filename: { contains: q } } : {}) },
    orderBy: { createdAt: "desc" },
    take: 400,
  });
  return ok({ media: rows.map(mapMedia) });
});

// Uploads go through ./upload (in pieces) — one big multipart request hits proxy body limits and Next's 10 MB proxy buffer.
