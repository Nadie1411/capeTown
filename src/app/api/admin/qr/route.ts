import QRCode from "qrcode";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { handle, bad } from "@/lib/api";
import { getSettings } from "@/lib/content";
import { lt } from "@/lib/i18n";

function vcard(s: Awaited<ReturnType<typeof getSettings>>) {
  const name = s.brand.name.en || s.brand.name.ar;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `ORG:${name}`,
    ...s.contact.phones.map((p) => `TEL;TYPE=WORK,VOICE:${p.number.replace(/\s+/g, "")}`),
    s.contact.whatsapp ? `TEL;TYPE=CELL:${s.contact.whatsapp.replace(/\s+/g, "")}` : "",
    s.contact.email ? `EMAIL;TYPE=WORK:${s.contact.email}` : "",
    `ADR;TYPE=WORK:;;${lt(s.contact.address, "en")};;;;Kuwait`,
    `URL:${s.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || ""}`,
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}

export const GET = handle(async (req) => {
  const u = new URL(req.url);
  const settings = await getSettings();
  const type = u.searchParams.get("type") || "url";
  const fg = "#" + (u.searchParams.get("fg") || "233283").replace("#", "");
  const bg = "#" + (u.searchParams.get("bg") || "ffffff").replace("#", "");
  const size = Math.min(2048, Math.max(128, Number(u.searchParams.get("size")) || 1024));
  const format = u.searchParams.get("format") === "png" ? "png" : "svg";
  const withLogo = u.searchParams.get("logo") !== "0";
  const transparent = u.searchParams.get("transparent") === "1";
  const text = type === "vcard" ? vcard(settings) : u.searchParams.get("url") || settings.seo.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!text) return bad("Missing url");

  const opts = { errorCorrectionLevel: "H" as const, margin: 1, color: { dark: fg, light: transparent ? "#0000" : bg } };
  const logoPath = path.join(process.cwd(), "public", (settings.brand.logoMarkUrl || "/brand/mark.svg").replace(/^\//, ""));
  const logoExists = await fs.stat(logoPath).then(() => true).catch(() => false);

  if (format === "svg") {
    let svg = await QRCode.toString(text, { ...opts, type: "svg", width: size });
    if (withLogo && logoExists) {
      const logo = await fs.readFile(logoPath, "utf8");
      const vb = /viewBox="([^"]+)"/.exec(svg)?.[1] || `0 0 ${size} ${size}`;
      const [, , w] = vb.split(" ").map(Number);
      const logoSize = w * 0.24;
      const pad = logoSize * 0.12;
      const x = (w - logoSize) / 2;
      const data = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;
      const overlay = `<rect x="${x - pad}" y="${x - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" rx="${pad}" fill="${transparent ? "#fff" : bg}"/><image href="${data}" x="${x}" y="${x}" width="${logoSize}" height="${logoSize}"/>`;
      svg = svg.replace("</svg>", `${overlay}</svg>`);
    }
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Content-Disposition": `inline; filename="qr-${type}.svg"` } });
  }

  let png = await QRCode.toBuffer(text, { ...opts, type: "png", width: size });
  if (withLogo && logoExists) {
    const logoSize = Math.round(size * 0.24);
    const pad = Math.round(logoSize * 0.12);
    const logoPng = await sharp(await fs.readFile(logoPath), { density: 400 }).resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const bgRect = Buffer.from(`<svg width="${logoSize + pad * 2}" height="${logoSize + pad * 2}"><rect width="100%" height="100%" rx="${pad}" fill="${transparent ? "#ffffff" : bg}"/></svg>`);
    const off = Math.round((size - logoSize) / 2);
    png = await sharp(png)
      .composite([
        { input: bgRect, left: off - pad, top: off - pad },
        { input: logoPng, left: off, top: off },
      ])
      .png()
      .toBuffer();
  }
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Content-Disposition": `inline; filename="qr-${type}.png"` } });
});
