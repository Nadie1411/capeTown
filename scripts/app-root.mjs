/* Finds the folder that holds prisma/schema.prisma, no matter where npm/cPanel runs a script from. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function findAppRoot() {
  const here = path.dirname(fs.realpathSync(fileURLToPath(import.meta.url))); // .../scripts
  // cPanel/CloudLinux runs scripts in ~/nodevenv/<app-root>/<node>/lib — derive the app root from that
  const venv = [process.cwd(), process.env.INIT_CWD || ""].map((d) => d.match(/^(.*)\/nodevenv\/(.+?)\/\d+\/lib\/?$/)).find(Boolean);
  const candidates = [path.resolve(here, ".."), venv && path.join(venv[1], venv[2]), process.env.INIT_CWD, process.cwd(), process.env.PWD].filter(Boolean);
  for (const dir of candidates) {
    try {
      const real = fs.realpathSync(dir);
      if (fs.existsSync(path.join(real, "prisma", "schema.prisma"))) return real;
    } catch {}
  }
  return null;
}

/** Absolute path of a package's CLI script, found relative to the app root (package "bin" field). */
export function cliPath(root, pkg) {
  const dirs = [path.join(root, "node_modules", pkg)];
  // cPanel keeps node_modules in the virtual environment; the app root only has a symlink — follow it, and also look next to the node binary (~/nodevenv/app/24/bin/node → ../lib/node_modules)
  try { dirs.push(path.join(fs.realpathSync(path.join(root, "node_modules")), pkg)); } catch {}
  dirs.push(path.resolve(path.dirname(process.execPath), "..", "lib", "node_modules", pkg));
  for (const d of [process.cwd(), process.env.INIT_CWD || ""]) { const m = d.match(/^(.*\/nodevenv\/.+?\/\d+\/lib)\/?$/); if (m) dirs.push(path.join(m[1], "node_modules", pkg)); }
  for (const dir of dirs) {
    const pj = path.join(dir, "package.json");
    if (!fs.existsSync(pj)) continue;
    const meta = JSON.parse(fs.readFileSync(pj, "utf8"));
    const bin = typeof meta.bin === "string" ? meta.bin : meta.bin?.[pkg] || Object.values(meta.bin || {})[0];
    if (bin) return path.join(dir, bin);
  }
  return null;
}

export function explainMissing() {
  console.error(`\n✗ Could not find prisma/schema.prisma.\n  Looked in: ${[process.env.INIT_CWD, process.cwd()].filter(Boolean).join(", ")}\n  The application root must contain: package.json, server.js, prisma/schema.prisma, .next/, public/, src/\n  Extract the deployment zip directly into the application root (enable "Show hidden files" in File Manager to see .next).\n`);
}
