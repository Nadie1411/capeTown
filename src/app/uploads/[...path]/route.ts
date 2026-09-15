import { NextRequest } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { EXT_MIME, resolveUploadPath } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Serves uploaded files with Range support (needed for video seeking / Safari playback). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const rel = parts.map(decodeURIComponent).join("/");
  const file = resolveUploadPath(rel);
  if (!file) return new Response("Not found", { status: 404 });
  let stat: fs.Stats;
  try {
    stat = await fsp.stat(file);
    if (!stat.isFile()) throw new Error();
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const mime = EXT_MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  const headers: Record<string, string> = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Last-Modified": stat.mtime.toUTCString(),
  };
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? Math.min(parseInt(m[2], 10), stat.size - 1) : Math.min(start + 4 * 1024 * 1024, stat.size - 1);
      if (start <= end && start < stat.size) {
        const stream = fs.createReadStream(file, { start, end });
        return new Response(stream as any, {
          status: 206,
          headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": String(end - start + 1) },
        });
      }
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
    }
  }
  const stream = fs.createReadStream(file);
  return new Response(stream as any, { status: 200, headers: { ...headers, "Content-Length": String(stat.size) } });
}
