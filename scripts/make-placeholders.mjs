// Generates brand-coloured architectural artwork (SVG) used as default imagery,
// plus the OpenGraph image (PNG).   Run: node scripts/make-placeholders.mjs
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const out = path.join(process.cwd(), "public", "placeholders");
await fs.mkdir(out, { recursive: true });

const NAVY = "#1c2870", NAVY_DARK = "#0c1140", GOLD = "#d4a12a";
const LINE = "rgba(255,255,255,.72)", LINE_SOFT = "rgba(255,255,255,.34)", FILL = "rgba(255,255,255,.045)";

function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const r2 = (n) => Math.round(n * 100) / 100;
const esc = (t) => String(t).replace(/&(?!amp;)/g, "&amp;").replace(/</g, "&lt;");

/* ---------- drawing primitives ---------- */
function dim(x1, y1, x2, y2, label, opts = {}) {
  // dimension line with end ticks and a label (horizontal or vertical)
  const horiz = y1 === y2;
  const t = 8;
  const ticks = horiz
    ? `<line x1="${x1}" y1="${y1 - t}" x2="${x1}" y2="${y1 + t}"/><line x1="${x2}" y1="${y2 - t}" x2="${x2}" y2="${y2 + t}"/>`
    : `<line x1="${x1 - t}" y1="${y1}" x2="${x1 + t}" y2="${y1}"/><line x1="${x2 - t}" y1="${y2}" x2="${x2 + t}" y2="${y2}"/>`;
  const lx = horiz ? (x1 + x2) / 2 : x1 - 14, ly = horiz ? y1 - 10 : (y1 + y2) / 2;
  const rot = horiz ? "" : ` transform="rotate(-90 ${lx} ${ly})"`;
  return `<g stroke="${opts.color || LINE_SOFT}" stroke-width="1.2" fill="none"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>${ticks}</g>
  <text x="${lx}" y="${ly}" font-family="ui-monospace, Menlo, monospace" font-size="${opts.size || 13}" fill="${opts.color || LINE_SOFT}" text-anchor="middle"${rot}>${esc(label)}</text>`;
}

function titleBlock(W, H, title, sub, scale = "1:100") {
  const w = 400, h = 74, x = W - w - 40, y = H - h - 40;
  return `<g font-family="ui-monospace, Menlo, monospace" fill="${LINE_SOFT}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(0,0,0,.18)" stroke="${LINE_SOFT}" stroke-width="1.2"/>
    <line x1="${x}" y1="${y + 26}" x2="${x + w}" y2="${y + 26}" stroke="${LINE_SOFT}" stroke-width="1.2"/>
    <line x1="${x + 300}" y1="${y + 26}" x2="${x + 300}" y2="${y + h}" stroke="${LINE_SOFT}" stroke-width="1.2"/>
    <text x="${x + 12}" y="${y + 18}" font-size="12" letter-spacing="2">CAPE TOWN — ENGINEERING OFFICE</text>
    <text x="${x + 12}" y="${y + 47}" font-size="13" fill="${LINE}">${esc(title)}</text>
    <text x="${x + 12}" y="${y + 65}" font-size="11">${esc(sub)}</text>
    <text x="${x + 312}" y="${y + 47}" font-size="11">SCALE</text>
    <text x="${x + 312}" y="${y + 65}" font-size="13" fill="${LINE}">${scale}</text>
  </g>`;
}

/** A building elevation drawing. kind: villa | building | commercial | government | residential */
function elevation(seed, kind, cx, ground, opts = {}) {
  const r = rng(seed);
  let scale = opts.scale || 1;
  const cfg = {
    villa: { floors: 2, w: 520, fh: 120, cols: 5, style: "villa" },
    residential: { floors: 3, w: 440, fh: 110, cols: 4, style: "villa" },
    building: { floors: 5 + Math.floor(r() * 3), w: 460, fh: 96, cols: 5, style: "flats" },
    commercial: { floors: 4 + Math.floor(r() * 2), w: 560, fh: 104, cols: 8, style: "glass" },
    government: { floors: 3, w: 640, fh: 118, cols: 7, style: "civic" },
  }[kind] || { floors: 4, w: 460, fh: 100, cols: 5, style: "flats" };
  if (opts.fit) scale = Math.min(opts.fit.w / cfg.w, opts.fit.h / (cfg.floors * cfg.fh + 110));
  const W = cfg.w * scale, FH = cfg.fh * scale, x0 = cx - W / 2, top = ground - cfg.floors * FH;
  const p = [];
  const g = (s) => p.push(s);
  // main body
  g(`<rect x="${x0}" y="${top}" width="${W}" height="${cfg.floors * FH}" fill="${FILL}" stroke="${LINE}" stroke-width="2"/>`);
  // parapet
  g(`<rect x="${x0 - 10 * scale}" y="${top - 16 * scale}" width="${W + 20 * scale}" height="${16 * scale}" fill="${FILL}" stroke="${LINE}" stroke-width="2"/>`);
  if (cfg.style === "civic") {
    // portico with columns
    const pw = W * 0.5, px = cx - pw / 2, ph = FH * 1.35;
    g(`<rect x="${px}" y="${top - 34 * scale}" width="${pw}" height="${34 * scale}" fill="none" stroke="${LINE}" stroke-width="2"/>`);
    g(`<rect x="${px - 12 * scale}" y="${ground - ph - 6 * scale}" width="${pw + 24 * scale}" height="${6 * scale}" fill="${FILL}" stroke="${LINE}" stroke-width="1.6"/>`);
    g(`<polygon points="${px - 12 * scale},${top - 34 * scale} ${cx},${top - 90 * scale} ${px + pw + 12 * scale},${top - 34 * scale}" fill="${FILL}" stroke="${LINE}" stroke-width="2"/>`);
    for (let i = 0; i <= 5; i++) {
      const colx = px + (pw / 5) * i;
      g(`<rect x="${colx - 9 * scale}" y="${ground - ph}" width="${18 * scale}" height="${ph}" fill="rgba(28,40,112,.9)" stroke="${LINE}" stroke-width="1.6"/>`);
      g(`<rect x="${colx - 14 * scale}" y="${ground - ph}" width="${28 * scale}" height="${10 * scale}" fill="rgba(28,40,112,.9)" stroke="${LINE}" stroke-width="1.4"/>`);
    }
    // steps
    for (let s = 0; s < 4; s++) g(`<line x1="${px - 20 - s * 10}" y1="${ground - s * 6 * scale}" x2="${px + pw + 20 + s * 10}" y2="${ground - s * 6 * scale}" stroke="${LINE}" stroke-width="1.4"/>`);
  }
  // floor lines
  for (let f = 1; f < cfg.floors; f++) g(`<line x1="${x0}" y1="${top + f * FH}" x2="${x0 + W}" y2="${top + f * FH}" stroke="${LINE_SOFT}" stroke-width="1.2"/>`);
  // windows / glazing
  const margin = 34 * scale, gap = (W - margin * 2) / cfg.cols;
  for (let f = 0; f < cfg.floors; f++) {
    const fy = top + f * FH;
    for (let c = 0; c < cfg.cols; c++) {
      const wx = x0 + margin + c * gap + gap * 0.18, ww = gap * 0.64;
      const isGround = f === cfg.floors - 1;
      if (cfg.style === "glass") {
        g(`<rect x="${x0 + margin + c * gap}" y="${fy + 6 * scale}" width="${gap}" height="${FH - 12 * scale}" fill="${c % 2 ? "rgba(212,161,42,.10)" : "rgba(255,255,255,.07)"}" stroke="${LINE_SOFT}" stroke-width="1.2"/>`);
        g(`<line x1="${x0 + margin + c * gap + gap / 2}" y1="${fy + 6 * scale}" x2="${x0 + margin + c * gap + gap / 2}" y2="${fy + FH - 6 * scale}" stroke="${LINE_SOFT}" stroke-width="1"/>`);
        continue;
      }
      if (isGround && c === Math.floor(cfg.cols / 2) && cfg.style !== "civic") {
        // entrance door
        const dw = ww * 0.9, dh = FH * 0.62;
        g(`<rect x="${wx + (ww - dw) / 2}" y="${fy + FH - dh}" width="${dw}" height="${dh}" fill="rgba(212,161,42,.18)" stroke="${LINE}" stroke-width="1.8"/>`);
        g(`<line x1="${wx + ww / 2}" y1="${fy + FH - dh}" x2="${wx + ww / 2}" y2="${fy + FH}" stroke="${LINE}" stroke-width="1.2"/>`);
        g(`<rect x="${wx - 6}" y="${fy + FH - dh - 14 * scale}" width="${ww + 12}" height="${10 * scale}" fill="none" stroke="${LINE}" stroke-width="1.4"/>`);
        continue;
      }
      const lit = r() < 0.3;
      const wh = FH * (cfg.style === "villa" ? 0.5 : 0.46), wy = fy + FH * 0.24;
      g(`<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="${lit ? "rgba(212,161,42,.22)" : "rgba(255,255,255,.08)"}" stroke="${LINE}" stroke-width="1.5"/>`);
      g(`<line x1="${wx + ww / 2}" y1="${wy}" x2="${wx + ww / 2}" y2="${wy + wh}" stroke="${LINE_SOFT}" stroke-width="1"/>`);
      g(`<line x1="${wx}" y1="${wy + wh / 2}" x2="${wx + ww}" y2="${wy + wh / 2}" stroke="${LINE_SOFT}" stroke-width="1"/>`);
      // balcony on flats
      if (cfg.style === "flats" && !isGround && c % 2 === 0) {
        g(`<rect x="${wx - 8}" y="${wy + wh}" width="${ww + 16}" height="${16 * scale}" fill="${FILL}" stroke="${LINE}" stroke-width="1.4"/>`);
        for (let b = 1; b < 6; b++) g(`<line x1="${wx - 8 + ((ww + 16) / 6) * b}" y1="${wy + wh}" x2="${wx - 8 + ((ww + 16) / 6) * b}" y2="${wy + wh + 16 * scale}" stroke="${LINE_SOFT}" stroke-width="1"/>`);
      }
      // arched top on villa upper floor
      if (cfg.style === "villa" && !isGround && c % 2 === 1) g(`<path d="M ${wx} ${wy} a ${ww / 2} ${ww / 2} 0 0 1 ${ww} 0" fill="rgba(255,255,255,.05)" stroke="${LINE}" stroke-width="1.5"/>`);
    }
  }
  // roof details
  if (cfg.style !== "civic") {
    g(`<rect x="${cx - 40 * scale}" y="${top - 46 * scale}" width="${80 * scale}" height="${30 * scale}" fill="${FILL}" stroke="${LINE}" stroke-width="1.5"/>`);
    g(`<line x1="${cx + 60 * scale}" y1="${top - 16 * scale}" x2="${cx + 60 * scale}" y2="${top - 60 * scale}" stroke="${LINE}" stroke-width="1.5"/>`);
  }
  // ground line & hatch
  g(`<line x1="${x0 - 120}" y1="${ground}" x2="${x0 + W + 120}" y2="${ground}" stroke="${LINE}" stroke-width="2"/>`);
  for (let i = 0; i < 26; i++) g(`<line x1="${x0 - 110 + i * ((W + 220) / 26)}" y1="${ground}" x2="${x0 - 122 + i * ((W + 220) / 26)}" y2="${ground + 12}" stroke="${LINE_SOFT}" stroke-width="1.2"/>`);
  if (opts.dims !== false) {
    g(dim(x0, ground + 46, x0 + W, ground + 46, `${r2(W / 20).toFixed(2)} m`));
    g(dim(x0 - 60, top - 16 * scale, x0 - 60, ground, `${r2((ground - top) / 20).toFixed(2)} m`));
    for (let f = 0; f <= cfg.floors; f++) {
      const y = ground - f * FH;
      g(`<text x="${x0 + W + 26}" y="${y + 4}" font-family="ui-monospace, Menlo, monospace" font-size="12" fill="${LINE_SOFT}">${f === 0 ? "±0.00" : "+" + (f * (cfg.fh / 30)).toFixed(2)}</text>`);
      g(`<line x1="${x0 + W}" y1="${y}" x2="${x0 + W + 20}" y2="${y}" stroke="${LINE_SOFT}" stroke-width="1"/>`);
    }
  }
  return p.join("\n");
}

/** A floor-plan drawing: rooms, door swings, window openings, dimension lines */
function floorPlan(seed, x, y, w, h) {
  const r = rng(seed);
  const p = [];
  const g = (s) => p.push(s);
  g(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${FILL}" stroke="${LINE}" stroke-width="5"/>`);
  // split into rooms: 2 rows, variable columns
  const rows = 2, rowH = h / rows;
  for (let row = 0; row < rows; row++) {
    const cols = 2 + Math.floor(r() * 2);
    let cx = x;
    const widths = Array.from({ length: cols }, () => 0.6 + r());
    const sum = widths.reduce((a, b) => a + b, 0);
    for (let c = 0; c < cols; c++) {
      const cw = (widths[c] / sum) * w;
      const ry = y + row * rowH;
      // walls
      if (c > 0) g(`<line x1="${cx}" y1="${ry}" x2="${cx}" y2="${ry + rowH}" stroke="${LINE}" stroke-width="3"/>`);
      // door with swing arc
      const dx = cx + cw * (0.3 + r() * 0.4), dy = row === 0 ? ry + rowH : ry, dw = 46;
      g(`<line x1="${dx}" y1="${dy}" x2="${dx + dw}" y2="${dy}" stroke="${NAVY_DARK}" stroke-width="5"/>`);
      g(`<path d="M ${dx} ${dy} L ${dx} ${dy + (row === 0 ? -dw : dw)} A ${dw} ${dw} 0 0 ${row === 0 ? 1 : 0} ${dx + dw} ${dy}" fill="none" stroke="${LINE}" stroke-width="1.4"/>`);
      // window openings on outer walls
      if (row === 0) {
        const wx = cx + cw * 0.3;
        g(`<line x1="${wx}" y1="${y}" x2="${wx + cw * 0.4}" y2="${y}" stroke="${NAVY_DARK}" stroke-width="6"/>`);
        g(`<line x1="${wx}" y1="${y - 1.5}" x2="${wx + cw * 0.4}" y2="${y - 1.5}" stroke="${LINE}" stroke-width="1.4"/><line x1="${wx}" y1="${y + 1.5}" x2="${wx + cw * 0.4}" y2="${y + 1.5}" stroke="${LINE}" stroke-width="1.4"/>`);
      }
      // room label
      const labels = ["LIVING", "BEDROOM", "MAJLIS", "KITCHEN", "DINING", "OFFICE", "LOBBY", "STORE"];
      const lab = labels[Math.floor(r() * labels.length)];
      g(`<text x="${cx + cw / 2}" y="${ry + rowH / 2}" font-family="ui-monospace, Menlo, monospace" font-size="13" letter-spacing="2" fill="${LINE_SOFT}" text-anchor="middle">${lab}</text>`);
      g(`<text x="${cx + cw / 2}" y="${ry + rowH / 2 + 18}" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="${LINE_SOFT}" text-anchor="middle">${(cw / 40).toFixed(2)} × ${(rowH / 40).toFixed(2)}</text>`);
      cx += cw;
    }
  }
  g(`<line x1="${x}" y1="${y + rowH}" x2="${x + w}" y2="${y + rowH}" stroke="${LINE}" stroke-width="3"/>`);
  // stairs block
  const sx = x + w - 90, sy = y + h - 130;
  g(`<rect x="${sx}" y="${sy}" width="70" height="110" fill="none" stroke="${LINE}" stroke-width="2"/>`);
  for (let i = 1; i < 9; i++) g(`<line x1="${sx}" y1="${sy + i * 12}" x2="${sx + 70}" y2="${sy + i * 12}" stroke="${LINE_SOFT}" stroke-width="1.2"/>`);
  g(`<line x1="${sx + 35}" y1="${sy + 110}" x2="${sx + 35}" y2="${sy + 8}" stroke="${LINE}" stroke-width="1.4"/><polygon points="${sx + 30},${sy + 14} ${sx + 35},${sy + 4} ${sx + 40},${sy + 14}" fill="${LINE}"/>`);
  g(dim(x, y + h + 48, x + w, y + h + 48, `${(w / 40).toFixed(2)} m`));
  g(dim(x - 56, y, x - 56, y + h, `${(h / 40).toFixed(2)} m`));
  // north arrow
  g(`<g transform="translate(${x + w + 70} ${y + 40})"><circle r="22" fill="none" stroke="${LINE_SOFT}" stroke-width="1.4"/><polygon points="0,-18 6,6 0,2 -6,6" fill="${LINE}"/><text y="42" font-family="ui-monospace, Menlo, monospace" font-size="12" fill="${LINE_SOFT}" text-anchor="middle">N</text></g>`);
  return p.join("\n");
}

function wrap(W, H, body, { angle = 160, glow = true, grid = true, vignette = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})"><stop offset="0" stop-color="${NAVY}"/><stop offset="1" stop-color="${NAVY_DARK}"/></linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,.045)" stroke-width="1"/></pattern>
    <radialGradient id="glow"><stop offset="0" stop-color="${GOLD}" stop-opacity=".22"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  ${grid ? `<rect width="100%" height="100%" fill="url(#grid)"/>` : ""}
  ${glow ? `<circle cx="${W * 0.8}" cy="${H * 0.15}" r="${H * 0.55}" fill="url(#glow)"/>` : ""}
  ${body}
  ${vignette ? `<rect width="100%" height="100%" fill="url(#vig)"/>` : ""}
</svg>`;
}

const files = {};
// hero: three elevations at different depths, text area on the left kept quiet
files["hero.svg"] = wrap(1920, 1080, `
  <g opacity=".75">${elevation(3, "villa", 640, 960, { fit: { w: 470, h: 420 }, dims: false })}</g>
  <g opacity=".9">${elevation(21, "building", 1180, 960, { fit: { w: 470, h: 760 }, dims: false })}</g>
  <g opacity=".8">${elevation(7, "commercial", 1660, 960, { fit: { w: 480, h: 620 }, dims: false })}</g>
  ${dim(360, 1010, 1790, 1010, "SITE FRONTAGE  71.50 m")}
  ${titleBlock(1920, 1080, "SHEET A-201 — FRONT ELEVATIONS", "PROJECT: MIXED-USE DEVELOPMENT", "1:200")}
`, { angle: 155 });
// about (4:3): one villa elevation with full dimensions
files["about.svg"] = wrap(1600, 1200, `${elevation(11, "villa", 800, 880, { fit: { w: 1200, h: 720 } })}${titleBlock(1600, 1200, "SHEET A-101 — VILLA ELEVATION", "TYPE: PRIVATE VILLA — 2 FLOORS + ROOF", "1:100")}`, { angle: 140 });
// projects: one elevation per building type
const kinds = ["villa", "building", "commercial", "government", "residential", "villa"];
kinds.forEach((k, i) => {
  files[`project-${i + 1}.svg`] = wrap(1600, 1200, `${elevation(100 + i * 17, k, 800, 780, { fit: { w: 1180, h: 620 } })}${titleBlock(1600, 1200, `SHEET A-${201 + i} — ${k.toUpperCase()} ELEVATION`, `PROJECT NO. CT-${2021 + i}-0${i + 1}`, "1:100")}`, { angle: 120 + i * 15 });
});
// services: alternate floor plans / elevations / details
for (let i = 1; i <= 8; i++) {
  const body = i % 2 ? floorPlan(300 + i * 7, 260, 180, 900, 520) : elevation(400 + i * 13, ["building", "commercial", "residential", "government"][(i / 2) % 4 | 0], 760, 780, { fit: { w: 1000, h: 600 } });
  files[`service-${i}.svg`] = wrap(1600, 1000, `${body}${titleBlock(1600, 1000, i % 2 ? `SHEET A-10${i} — GROUND FLOOR PLAN` : `SHEET A-20${i} — ELEVATION`, "ISSUED FOR CONSTRUCTION", i % 2 ? "1:50" : "1:100")}`, { angle: 130 + i * 8 });
}
files["generic.svg"] = wrap(1600, 1000, `${floorPlan(77, 260, 180, 900, 520)}${titleBlock(1600, 1000, "SHEET A-100 — FLOOR PLAN", "ENGINEERING OFFICE", "1:50")}`);

for (const [name, svg] of Object.entries(files)) await fs.writeFile(path.join(out, name), svg);

// OpenGraph image
const logo = await fs.readFile(path.join(process.cwd(), "public/brand/logo-white.svg"));
const logoPng = await sharp(logo, { density: 300 }).resize(400, 400).png().toBuffer();
const ogSvg = wrap(1200, 630, `<g opacity=".45">${elevation(9, "commercial", 880, 600, { fit: { w: 700, h: 520 }, dims: false })}</g>
  <text x="520" y="250" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="700" fill="#fff">Cape Town General Trading</text>
  <text x="520" y="302" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="700" fill="#fff">&amp; Contracting Co. W.L.L</text>
  <text x="520" y="368" font-family="Inter, Arial, sans-serif" font-size="24" fill="${GOLD}">Construction · Excavation · Finishing · Engineering office</text>
  <text x="520" y="414" font-family="Inter, Arial, sans-serif" font-size="24" fill="rgba(255,255,255,.75)">Kuwait</text>`, { glow: false });
const og = await sharp(Buffer.from(ogSvg)).composite([{ input: logoPng, left: 80, top: 115 }]).png().toBuffer();
await fs.writeFile(path.join(process.cwd(), "public/brand/og.png"), og);
const markPng = await sharp(await fs.readFile(path.join(process.cwd(), "public/brand/mark.svg")), { density: 400 }).resize(512, 512).png().toBuffer();
await fs.writeFile(path.join(process.cwd(), "public/brand/mark.png"), markPng);
console.log("placeholders:", Object.keys(files).length, "+ og.png + mark.png");
