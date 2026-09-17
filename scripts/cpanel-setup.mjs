/* Server-side setup: generate the Prisma client, create/update the SQLite database, seed content + admin user.
   Works from any working directory (cPanel runs scripts from its virtual environment folder). */
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { findAppRoot, explainMissing, cliPath } from "./app-root.mjs";

const root = findAppRoot();
if (!root) { explainMissing(); process.exit(1); }
const prisma = cliPath(root, "prisma");
const tsx = cliPath(root, "tsx");
if (!prisma || !tsx) { console.error("✗ Dependencies are not installed yet — click \"Run NPM Install\" first (needs the prisma and tsx packages)."); process.exit(1); }
const schema = path.join(root, "prisma", "schema.prisma");
const envFile = path.join(root, ".env");
if (!fs.existsSync(envFile)) {
  console.error(`✗ ${envFile} is missing. Rename .env.production.example to .env and fill in AUTH_SECRET / admin login first.`);
  process.exit(1);
}
const run = (label, args) => {
  console.log(`\n▸ ${label}`);
  const r = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit", env: { ...process.env } });
  if (r.status !== 0) { console.error(`✗ ${label} failed`); process.exit(r.status || 1); }
};
run("prisma generate", [prisma, "generate", "--schema", schema]);
run("create / update database", [prisma, "db", "push", "--skip-generate", "--schema", schema]);
run("seed content + admin user", [tsx, path.join(root, "prisma", "seed.ts")]);
console.log(`\n✓ Setup complete in ${root}\n  Now click Restart in "Setup Node.js App" and open the site.`);
