// Creates backups/backup-<date>.tgz containing the SQLite database and all uploaded media.
// Usage: npm run backup
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const env = fs.existsSync(path.join(root, ".env")) ? fs.readFileSync(path.join(root, ".env"), "utf8") : "";
const dbUrl = process.env.DATABASE_URL || /DATABASE_URL="?file:([^"\n]+)"?/.exec(env)?.[1] || "./dev.db";
const dbFile = dbUrl.replace(/^file:/, "");
const dbPath = path.isAbsolute(dbFile) ? dbFile : path.join(root, "prisma", dbFile);
const uploads = process.env.UPLOAD_DIR || /UPLOAD_DIR="?([^"\n]+)"?/.exec(env)?.[1] || "./storage/uploads";
const uploadsPath = path.isAbsolute(uploads) ? uploads : path.join(root, uploads);
if (!fs.existsSync(dbPath)) { console.error("database not found:", dbPath); process.exit(1); }
fs.mkdirSync(path.join(root, "backups"), { recursive: true });
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const out = path.join(root, "backups", `backup-${stamp}.tgz`);
const items = [path.relative(root, dbPath), fs.existsSync(uploadsPath) ? path.relative(root, uploadsPath) : null].filter(Boolean);
execSync(`tar -czf "${out}" ${items.map((i) => `"${i}"`).join(" ")}`, { cwd: root, stdio: "inherit" });
console.log("✓ backup written:", out, `(${(fs.statSync(out).size / 1024 / 1024).toFixed(1)} MB)`);
