import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { mapMedia } from "@/lib/content";
import { handle, ok, bad } from "@/lib/api";
import { MAX_UPLOAD_BYTES, MIME_KIND, ensureDir, uploadDir } from "@/lib/media";
import { slugify } from "@/lib/utils";

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

export const POST = handle(async (req) => {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return bad("No files");
  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(uploadDir(), sub);
  await ensureDir(dir);
  const created = [];
  for (const file of files) {
    const mime = file.type || "application/octet-stream";
    const kind = MIME_KIND[mime];
    if (!kind) return bad(`Unsupported file type: ${mime}`);
    if (file.size > MAX_UPLOAD_BYTES) return bad(`File too large: ${file.name}`);
    const ext = path.extname(file.name).toLowerCase() || { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg", "image/avif": ".avif", "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov", "application/pdf": ".pdf" }[mime] || "";
    const base = slugify(path.basename(file.name, path.extname(file.name))).slice(0, 60) || "file";
    const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const name = `${stamp}-${base}${ext}`;
    const target = path.join(dir, name);
    let buffer = Buffer.from(await file.arrayBuffer());
    let width: number | null = null;
    let height: number | null = null;
    let thumbUrl = "";

    if (kind === "image" && mime !== "image/svg+xml" && mime !== "image/gif") {
      try {
        let img = sharp(buffer, { failOn: "none" }).rotate();
        const meta = await img.metadata();
        width = meta.width || null;
        height = meta.height || null;
        if (width && width > 2400) {
          img = img.resize({ width: 2400, withoutEnlargement: true });
          buffer = Buffer.from(await img.toBuffer());
          const m2 = await sharp(buffer).metadata();
          width = m2.width || width;
          height = m2.height || height;
        }
        const thumbName = `${stamp}-${base}-thumb.webp`;
        await sharp(buffer).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(dir, thumbName));
        thumbUrl = `/uploads/${sub}/${thumbName}`;
      } catch (e) {
        console.warn("sharp failed", e);
      }
    } else if (mime === "image/svg+xml") {
      // never store scripts inside uploaded SVGs
      const text = buffer.toString("utf8");
      if (/<script|onload=|onerror=/i.test(text)) return bad("SVG contains scripts");
    }
    await fs.writeFile(target, buffer);
    const row = await prisma.media.create({
      data: { kind, filename: file.name, url: `/uploads/${sub}/${name}`, thumbUrl, mime, size: buffer.length, width, height },
    });
    created.push(mapMedia(row));
  }
  return ok({ media: created });
});
