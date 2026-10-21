import path from "node:path";
import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { handle, ok, bad } from "@/lib/api";
import { UploadError, describeUpload, ensureDir, tempDir } from "@/lib/media";
import { saveMedia } from "@/lib/media-store";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

const STALE_MS = 6 * 60 * 60 * 1000; // an unfinished upload untouched for this long is thrown away

/** The browser and the server disagree about how much has arrived: tell the browser where to carry on from. */
const outOfSync = (received: number) => NextResponse.json({ error: "Upload out of sync", received }, { status: 409 });

async function dropStale(dir: string) {
  const cutoff = Date.now() - STALE_MS;
  for (const f of await fs.readdir(dir).catch(() => [] as string[])) {
    if (!f.endsWith(".part")) continue;
    const p = path.join(dir, f);
    const st = await fs.stat(p).catch(() => null);
    if (st && st.mtimeMs < cutoff) await fs.unlink(p).catch(() => {});
  }
}

/** Receives one piece of a file: POST ?id=&name=&type=&total=&offset= with the raw bytes as the body.
 *  Pieces arrive in order and each is written at its own offset, so sending a piece again is harmless.
 *  The piece that completes the file assembles it and answers with the new media row. */
export const POST = handle(async (req) => {
  try {
    const q = new URL(req.url).searchParams;
    const id = q.get("id") || "";
    const name = (q.get("name") || "").slice(0, 255);
    const total = Number(q.get("total"));
    const offset = Number(q.get("offset"));
    if (!/^[a-f0-9]{16,64}$/.test(id) || !name || !Number.isSafeInteger(total) || !Number.isSafeInteger(offset) || total <= 0 || offset < 0 || offset >= total) return bad("Invalid upload request");
    if (total > MAX_UPLOAD_BYTES) return bad(`File too large: ${name} (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)`);
    const { mime } = describeUpload(name, q.get("type") || "");

    const chunk = Buffer.from(await req.arrayBuffer());
    const declared = Number(req.headers.get("content-length") ?? chunk.length);
    if (!chunk.length || chunk.length !== declared || offset + chunk.length > total) return bad("Invalid or incomplete chunk");

    const dir = tempDir();
    await ensureDir(dir);
    if (offset === 0) await dropStale(dir);
    const part = path.join(dir, `${id}.part`);
    const fh = await fs.open(part, offset === 0 ? "w" : "r+").catch((e) => {
      if (e?.code === "ENOENT") return null; // the first piece is gone (cleaned up or never arrived)
      throw e;
    });
    if (!fh) return outOfSync(0);
    try {
      const have = (await fh.stat()).size;
      if (offset > have) return outOfSync(have);
      await fh.write(chunk, 0, chunk.length, offset);
    } finally {
      await fh.close();
    }

    if (offset + chunk.length < total) return ok({ received: offset + chunk.length });
    try {
      if ((await fs.stat(part)).size !== total) throw new UploadError("Upload incomplete, please try again");
      return ok({ media: await saveMedia({ filename: name, mime, tempPath: part }) });
    } catch (e) {
      await fs.unlink(part).catch(() => {});
      throw e;
    }
  } catch (e) {
    if (e instanceof UploadError) return bad(e.message);
    throw e;
  }
});
