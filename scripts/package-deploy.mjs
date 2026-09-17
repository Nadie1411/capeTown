/* Builds the site for a specific URL and packs everything a Node host needs into deploy/<name>.zip
   (node_modules are NOT included — the server installs them).
   Usage:  node scripts/package-deploy.mjs --url=https://albahloul.com/elegant/test
           node scripts/package-deploy.mjs --url=https://test.albahloul.com          (domain root) */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const arg = (k, d = "") => (process.argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=").slice(1).join("=") || d;
const url = arg("url", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
const basePath = new URL(url).pathname.replace(/\/+$/, "");
const locale = arg("locale", process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en");
const root = process.cwd();
const name = arg("name", `capetown${basePath.replace(/\//g, "-") || "-root"}`);

console.log(`\n▸ Building for ${url}  (base path: "${basePath || "/"}", default language: ${locale})`);
execSync("npm run build", { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_SITE_URL: url, NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_DEFAULT_LOCALE: locale } });

const outDir = path.join(root, "deploy");
fs.mkdirSync(outDir, { recursive: true });
const zip = path.join(outDir, `${name}.zip`);
fs.rmSync(zip, { force: true });

// what the server needs
const include = ["package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "server.js", ".env.production.example", "README.md", "prisma", "src", "public", "scripts", "storage", ".next"];
const exclude = ["-x", ".next/cache/*", "-x", ".next/dev/*", "-x", "storage/uploads/*", "-x", "prisma/*.db", "-x", "prisma/*.db-journal", "-x", "*/.DS_Store", "-x", "scripts/_*"];
execSync(`zip -qr "${zip}" ${include.map((i) => `"${i}"`).join(" ")} ${exclude.map((e) => `"${e}"`).join(" ")}`, { cwd: root, stdio: "inherit" });
// keep the uploads folder itself
execSync(`zip -q "${zip}" storage/uploads/.gitkeep`, { cwd: root });

// remember the build settings next to the zip
fs.writeFileSync(path.join(outDir, `${name}.env.txt`), `NEXT_PUBLIC_SITE_URL="${url}"\nNEXT_PUBLIC_BASE_PATH="${basePath}"\nNEXT_PUBLIC_DEFAULT_LOCALE="${locale}"\n`);
const size = (fs.statSync(zip).size / 1024 / 1024).toFixed(1);
console.log(`\n✓ ${path.relative(root, zip)} (${size} MB)\n  Upload it to the app root on the server, extract, create .env from .env.production.example,\n  then run "npm install" and "npm run cpanel:setup" (see README → Deploy to cPanel).`);
