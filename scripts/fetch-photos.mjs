// Downloads the free stock photos used as default imagery (Pexels License — free for commercial use, no attribution required).
// Run: node scripts/fetch-photos.mjs   — re-run any time to restore the originals.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PHOTOS = {
  // name: [pexels photo id, width]
  "hero-construction-site": [5511065, 2200],
  "kuwait-skyline": [38096102, 2200],
  "kuwait-skyline-sunset": [3414922, 2200],
  "kuwait-towers": [19864700, 2200],
  "highrise-dusk": [18162494, 2200],
  "about-engineers-site": [8961146, 1800],
  "engineer-inspection": [17395035, 1800],
  "service-construction": [15109999, 1600],
  "service-excavation": [36657008, 1600],
  "service-finishing": [5493654, 1600],
  "service-contracting": [6285150, 1600],
  "service-drawings": [11269741, 1600],
  "service-engineering-office": [6285146, 1600],
  "service-permits": [4134179, 1600],
  "service-maintenance": [6474133, 1600],
  "project-villa-jahra": [10647324, 1600],
  "project-building-farwaniya": [27459248, 1600],
  "project-commercial-hawally": [532562, 1600],
  "project-government": [38583092, 1600],
  "project-house-sabah": [13203179, 1600],
  "project-villa-salmiya": [34378030, 1600],
};

const out = path.join(process.cwd(), "public", "photos");
await fs.mkdir(out, { recursive: true });
const credits = [];
for (const [name, [id, w]] of Object.entries(PHOTOS)) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const img = sharp(buf).rotate().jpeg({ quality: 80, mozjpeg: true });
  const meta = await sharp(buf).metadata();
  await img.toFile(path.join(out, `${name}.jpg`));
  credits.push(`${name}.jpg — https://www.pexels.com/photo/${id}/ (${meta.width}×${meta.height})`);
  console.log("✓", name, `${meta.width}×${meta.height}`);
}
await fs.writeFile(path.join(out, "CREDITS.txt"), `Photos from Pexels (https://www.pexels.com/license/) — free to use, no attribution required.\n\n${credits.join("\n")}\n`);
console.log("done:", credits.length, "photos");
