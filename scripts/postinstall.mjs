/* Runs `prisma generate` against the schema in the app root. Never fails npm install — prints guidance instead. */
import path from "node:path";
import { spawnSync } from "node:child_process";
import { findAppRoot, explainMissing, cliPath } from "./app-root.mjs";

const root = findAppRoot();
if (!root) {
  explainMissing();
  console.error("  Skipping `prisma generate` for now — run `npm run cpanel:setup` after the files are in place.\n");
  process.exit(0);
}
const cli = cliPath(root, "prisma");
if (!cli) { console.error("  prisma package not installed yet — skipping generate (npm run cpanel:setup will do it)."); process.exit(0); }
const r = spawnSync(process.execPath, [cli, "generate", "--schema", path.join(root, "prisma", "schema.prisma")], { cwd: root, stdio: "inherit", env: { ...process.env } });
if (r.status !== 0) console.error("  prisma generate did not succeed — `npm run cpanel:setup` will retry it.");
process.exit(0);
