/* Exports the public website as plain static files (no Node.js needed on the host).
   Builds for the given URL, starts the app locally, saves every page from the sitemap as HTML,
   copies assets, adds an .htaccess for clean URLs, and zips the result.
   Usage: node scripts/snapshot.mjs --url=https://albahloul.com/elegant/test   */
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const arg = (k, d = "") => (process.argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=").slice(1).join("=") || d;
const url = arg("url", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
const basePath = new URL(url).pathname.replace(/\/+$/, "");
const locale = arg("locale", process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en");
const port = Number(arg("port", "3400"));
const root = process.cwd();
const name = arg("name", `static${basePath.replace(/\//g, "-") || "-root"}`);
const out = path.join(root, "deploy", name);
const env = { ...process.env, NEXT_PUBLIC_SITE_URL: url, NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_DEFAULT_LOCALE: locale, NODE_ENV: "production", PORT: String(port) };

if (!arg("skip-build")) {
  console.log(`\n▸ Building for ${url}`);
  execSync("npm run build", { stdio: "inherit", env });
}

console.log(`▸ Starting the app on port ${port}`);
const server = spawn(process.execPath, ["server.js"], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
const local = `http://localhost:${port}`;
const waitReady = async () => {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`${local}${basePath || "/"}`); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start");
};

try {
  await waitReady();
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  // pages: sitemap + root + 404
  const sitemap = await (await fetch(`${local}${basePath}/sitemap.xml`)).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const pages = [...new Set([basePath || "/", `${basePath}/ar`, ...locs])].map((p) => (basePath && p.startsWith(basePath) ? p.slice(basePath.length) || "/" : p));
  const fixOrigin = (txt) => txt.replaceAll(local, new URL(url).origin);
  let n = 0;
  for (const p of pages) {
    const res = await fetch(`${local}${basePath}${p === "/" ? "" : p}`, { redirect: "manual" });
    if (res.status !== 200) { console.warn(`  skip ${p} (${res.status})`); continue; }
    const html = fixOrigin(await res.text());
    const file = path.join(out, p === "/" ? "index.html" : `${p}/index.html`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    n++;
  }
  console.log(`  ${n} pages saved`);
  // 404 page
  const nf = await fetch(`${local}${basePath}/this-page-does-not-exist`);
  fs.writeFileSync(path.join(out, "404.html"), fixOrigin(await nf.text()));
  // sitemap & robots
  fs.writeFileSync(path.join(out, "sitemap.xml"), fixOrigin(sitemap));
  fs.writeFileSync(path.join(out, "robots.txt"), fixOrigin(await (await fetch(`${local}${basePath}/robots.txt`)).text()));

  // assets: everything in public/ + the built client chunks + any uploads
  fs.cpSync(path.join(root, "public"), out, { recursive: true });
  fs.cpSync(path.join(root, ".next", "static"), path.join(out, "_next", "static"), { recursive: true });
  const uploads = path.join(root, "storage", "uploads");
  if (fs.existsSync(uploads)) fs.cpSync(uploads, path.join(out, "uploads"), { recursive: true, filter: (s) => !s.endsWith(".gitkeep") });

  // clean URLs + caching for Apache/LiteSpeed
  fs.writeFileSync(path.join(out, ".htaccess"), `# Static export of the Cape Town website
Options -Indexes
DirectorySlash Off
ErrorDocument 404 ${basePath}/404.html
RewriteEngine On
RewriteBase ${basePath || "/"}/
# /services  ->  /services/index.html   (extensionless page URLs)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}/index.html -f
RewriteRule ^(.*)$ $1/index.html [L]
# trailing slash -> clean URL
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^(.+)/$ ${basePath}/$1 [R=301,L]
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
  ExpiresByType video/mp4 "access plus 30 days"
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType application/javascript "access plus 30 days"
</IfModule>
AddType video/mp4 .mp4
AddType image/svg+xml .svg
`);

  const zip = path.join(root, "deploy", `${name}.zip`);
  fs.rmSync(zip, { force: true });
  execSync(`zip -qr "${zip}" .`, { cwd: out });
  const size = (fs.statSync(zip).size / 1024 / 1024).toFixed(1);
  console.log(`\n✓ Static site: ${path.relative(root, out)}/  →  ${path.relative(root, zip)} (${size} MB)\n  Upload the zip into public_html${basePath} and extract it there (enable "Show hidden files" so .htaccess is visible).`);
} finally {
  server.kill();
}
