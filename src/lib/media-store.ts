import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { mapMedia } from "@/lib/content";
import { MIME_EXT, MIME_KIND, UploadError, ensureDir, uploadDir } from "@/lib/media";
import { slugify } from "@/lib/utils";

/** Files a finished upload (already on disk at `tempPath`) into the media library: optimises images, makes the thumbnail, records the row. */
export async function saveMedia({ filename, mime, tempPath }: { filename: string; mime: string; tempPath: string }) {
  const kind = MIME_KIND[mime];
  if (!kind) throw new UploadError(`Unsupported file type: ${mime}`);
  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(uploadDir(), sub);
  await ensureDir(dir);
  const ext = path.extname(filename).toLowerCase() || MIME_EXT[mime] || "";
  const base = slugify(path.basename(filename, path.extname(filename))).slice(0, 60) || "file";
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const name = `${stamp}-${base}${ext}`;
  const target = path.join(dir, name);
  let size = (await fs.stat(tempPath)).size;
  let width: number | null = null;
  let height: number | null = null;
  let thumbUrl = "";

  if (kind === "image" && mime !== "image/svg+xml" && mime !== "image/gif") {
    let buffer = await fs.readFile(tempPath);
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
    await fs.writeFile(target, buffer);
    await fs.unlink(tempPath);
    size = buffer.length;
  } else {
    // never store scripts inside uploaded SVGs
    if (mime === "image/svg+xml" && /<script|onload=|onerror=/i.test(await fs.readFile(tempPath, "utf8"))) throw new UploadError("SVG contains scripts");
    // videos and PDFs are never loaded into memory: the assembled file just moves into place
    await fs.rename(tempPath, target);
  }
  const row = await prisma.media.create({
    data: { kind, filename, url: `/uploads/${sub}/${name}`, thumbUrl, mime, size, width, height },
  });
  return mapMedia(row);
}
