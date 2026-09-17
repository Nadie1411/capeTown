# Cape Town General Trading & Contracting — Website + Admin Panel

Bilingual (English / العربية) marketing website for **Cape Town General Trading & Contracting Co. W.L.L** (Kuwait), with a full admin panel that controls every part of the site: pages are built from drag-and-drop sections with a live preview, and every colour, font, image/video, text, button and contact detail is editable.

## What's included

**Public website** (`/` English, `/ar` Arabic, RTL-aware)
- Home, About, Services, Projects, Contact — all built from editable sections
- Service detail pages (`/services/<slug>`) and project detail pages (`/projects/<slug>`) with galleries
- Click-to-call / WhatsApp buttons, contact form (saved to the admin inbox and/or opened in WhatsApp)
- SEO metadata, Open Graph image, `sitemap.xml`, `robots.txt`
- Large, readable typography (text size is adjustable in settings for older visitors)

**Admin panel** (`/admin`)
- **Pages & layout** — page builder with 23 section types (hero, services, projects, why-us, stats, steps, testimonials, FAQ, gallery, video, map, contact form, CTA, team, partners, rich text, custom HTML, …). Drag to reorder, click a section in the live preview to edit it, switch desktop/tablet/mobile and EN/AR preview. Each section has a **Content** tab and a **Design** tab (background colour / gradient / image / video with overlay, text & heading colours, spacing, width, alignment, animation, hide on mobile/desktop, anchor id…).
- **Services** and **Projects** — bilingual title, description, rich text, cover image, photo/video gallery, icon, building type, featured/published, drag ordering.
- **Media library** — drag-and-drop upload of images (auto-optimised + thumbnails), videos (MP4/WebM) and PDFs.
- **Messages** — contact-form inbox with unread badge, call/WhatsApp shortcuts, CSV export.
- **Site settings** with live preview — brand & colours, fonts (English/Arabic), logo, header & menu, footer, floating buttons, contact details & map, social links, SEO, languages, project types, tracking codes.
- **QR code** — website QR (or vCard contact QR) with the logo in the middle, brand colours, SVG/PNG download for the business card.
- **My account** — change name/email/password. The admin UI itself is available in English and Arabic.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 + SQLite · Tiptap (rich text) · dnd-kit (drag & drop) · sharp (image processing) · qrcode

Typography: Plus Jakarta Sans (English) and IBM Plex Sans Arabic (Arabic), both switchable in *Settings → Brand & colors*.

## Local development

```bash
npm install
npm run setup      # prisma generate + create the SQLite DB + seed demo content & admin user
npm run dev        # http://localhost:3000  — admin at http://localhost:3000/admin
```

Default admin login (from `.env`, **change it after first login** in *My account*):

- Email: `admin@capetown-kw.com`
- Password: `ChangeMe123!`

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` / `npm run start` | production build / serve |
| `npm run db:seed` | seed demo content into empty tables (`-- --reset` wipes content & settings first) |
| `npm run db:studio` | open Prisma Studio to inspect the database |
| `npm run placeholders` | regenerate the placeholder artwork in `public/placeholders` |
| `npm run typecheck` | TypeScript check |
| `npm run backup` | zips the database + uploads into `backups/` |
| `npm run reset-password -- <email> <new password>` | reset (or create) an admin login when the password is forgotten |
| `npm run photos` | re-download the default stock photos into `public/photos` |
| `node scripts/snapshot.mjs --url=https://…` | static export (HTML/CSS/JS) of the public site for that URL, zipped into `deploy/` |
| `node scripts/package-deploy.mjs --url=https://…` | production build for that URL (root or sub-folder) zipped into `deploy/` for upload |
| `npm run cpanel:setup` | on the server: create the database and seed it |

## Configuration (`.env`)

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | SQLite file, e.g. `file:./dev.db` (relative to `prisma/`) |
| `AUTH_SECRET` | long random string used to sign admin sessions — **must be unique in production** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin account, created by the seed when no user exists |
| `NEXT_PUBLIC_SITE_URL` | public URL (QR code, sitemap, Open Graph) — can also be set in Settings → SEO |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` (default) or `ar` — the language served at `/`; the other language lives under `/en` or `/ar` |
| `NEXT_PUBLIC_BASE_PATH` | sub-folder the site is served from, e.g. `/elegant/test` (empty for the domain root). Build-time value — rebuild after changing it |
| `UPLOAD_DIR` | folder for uploaded media (default `./storage/uploads`) |

## Deployment

### Production — automatic (GitHub Actions → VPS)

Push to `main` as normal. To release, merge `main` into `prod` and push: the *Deploy to production* workflow (`.github/workflows/deploy.yml`) builds the Docker image on GitHub's runners, copies it to the server and restarts the container — never build on the server itself (2 GB shared box). Watch runs at https://github.com/Nadie1411/capeTown/actions (≈3–4 min). The server's `.env` (secrets, DB path, port) lives only on the server; build-time values (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_DEFAULT_LOCALE`) are set as `ARG` defaults in the `Dockerfile` (domain root, English first). After the first deploy, set the public URL in *Admin → Settings → SEO* so the sitemap, robots and QR code use the real domain.

**Content vs. code:** pages, sections and settings live in the database, not in the code. When a deploy ships a new default design (`CONTENT_VERSION` in `src/lib/seed.ts`), the container's start-up seed refreshes every page and setting that was never edited in the admin; anything the client edited is left alone. To force it, use *Admin → Settings → Advanced → Load latest default design*.

### Other hosts

The site needs a Node.js host with a persistent disk (SQLite database + uploads). It can run at a domain root **or inside a sub-folder** (e.g. `https://albahloul.com/elegant/test`) — the sub-folder is baked in at build time through `NEXT_PUBLIC_BASE_PATH`.

### Option 0 — Static files on any shared hosting (recommended for previews / cPanel without a Node.js budget)

Shared hosts often count Node.js threads against a tiny process limit. For a preview you can skip Node on the server entirely: export the public site as plain HTML/CSS/JS and upload it like a PHP site. The admin panel then runs on your computer (`npm run dev` → `/admin`); after editing, export again and re-upload.

```bash
node scripts/snapshot.mjs --url=https://albahloul.com/elegant/test
```

→ `deploy/static-elegant-test.zip` (all pages in both languages, photos, videos, scripts, a `.htaccess` for clean URLs and a 404 page).

1. If you created a Node.js app for this folder earlier, **destroy it** in *Setup Node.js App* first (it owns the folder's `.htaccess`).
2. File Manager → `public_html/elegant/test` → upload the zip → Extract → delete the zip (turn on *Show Hidden Files* to see `.htaccess`).
3. Open `https://albahloul.com/elegant/test`.

What works statically: everything visitors see, language switch, WhatsApp/call buttons, the contact form (it opens WhatsApp with the message instead of saving to the admin inbox). What doesn't: `/admin` on that host — edit locally and re-export. Uploaded images/videos from the local media library are included in the export.

### Option A — cPanel with "Setup Node.js App" (e.g. test deployment at albahloul.com/elegant/test)

1. **Build the package locally** (bakes in the public URL / sub-folder):
   ```bash
   node scripts/package-deploy.mjs --url=https://albahloul.com/elegant/test
   ```
   → `deploy/capetown-elegant-test.zip` (~40 MB, no `node_modules`).
2. **cPanel → Setup Node.js App → Create application**
   - Node.js version: **20.x** or **22.x** (24 also works)
   - Application mode: **Production**
   - Application root: `elegant-test-app` (a folder *outside* `public_html` — cPanel creates it)
   - Application URL: `albahloul.com` / `elegant/test`
   - Application startup file: `server.js`
   - Click **Create**. cPanel writes a `.htaccess` into `public_html/elegant/test` that hands requests to the app.
3. **File Manager** → open the application root (`elegant-test-app`) → **Upload** the zip → **Extract** it there → delete the zip.
   Rename `.env.production.example` to `.env` and edit it: set a long random `AUTH_SECRET`, the admin email/password, and check `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_BASE_PATH` match the URL you built for.
4. Back in **Setup Node.js App** → open the app → **Run NPM Install** (installs dependencies and generates the database client).
5. Under *Run JS script* enter `cpanel:setup` and run it (creates the database and seeds the demo content + admin user). Alternatively, in Terminal: `source ~/nodevenv/elegant-test-app/20/bin/activate && cd ~/elegant-test-app && npm run cpanel:setup`.
6. **Restart** the application and open `https://albahloul.com/elegant/test` — admin at `/elegant/test/admin`.

Notes for cPanel:
- cPanel runs npm inside `~/nodevenv/<app>/<version>/lib`, not in the app folder — the `postinstall` and `cpanel:setup` scripts detect that and switch to the real app folder automatically.
- If the host's Node.js selector is missing, the panel cannot run this site (it is not a PHP app) — use option B or C.
- If `albahloul.com/elegant/test` shows the *parent* PHP app instead of the site, add `DirectorySlash Off` at the top of `public_html/elegant/test/.htaccess` (above cPanel's Passenger block) and restart.
- Uploads land in `elegant-test-app/storage/uploads`, the database in `elegant-test-app/prisma/prod.db` — back up both. `npm run backup` zips them.
- To update the site later: build a new zip, extract it over the app root (keep `.env`, `prisma/prod.db` and `storage/`), then Restart.

### Option B — Docker (any VPS)

```bash
cp .env.example .env      # then edit: AUTH_SECRET, ADMIN_*, NEXT_PUBLIC_SITE_URL=https://your-domain.com
docker compose up -d --build
```

The database is kept in `./data` and uploads in `./storage/uploads` — back up those two folders. Put Nginx/Caddy in front for HTTPS (Caddy example: `your-domain.com { reverse_proxy localhost:3000 }`).

### Option C — plain Node + PM2

```bash
npm ci && npm run setup && npm run build
pm2 start server.js --name capetown
```

> Serverless platforms (Vercel, Netlify) are **not** suitable as-is because uploads and the SQLite file need a persistent disk.

## Content handover checklist

1. Sign in, open **My account** and change the password.
2. **Settings → Contact details**: real phone numbers, WhatsApp, email, address, Google Maps embed link, working hours, social links.
3. **Settings → SEO & site URL**: set the public domain (used by the QR code).
4. **Media**: upload the company's own project photos and swap them in under **Projects**, **Services** and the home page **Hero** section (Design tab → Background). The current photos and the hero drone video are free stock media from Pexels (`public/photos/CREDITS.txt`, `public/videos/CREDITS.txt`). Phones show the hero poster image instead of the video unless *Also play the video on phones* is switched on.
5. **Pages & layout → Home**: adjust the wording, statistics (years of experience, project count…) and the "Why choose us" points.
6. **QR code**: download the SVG and send it to the business-card printer.

## Project structure

```
prisma/schema.prisma        database models (User, Setting, Page, Service, Project, Media, Lead)
prisma/seed.ts              demo content + first admin user
src/blocks/registry.ts      section (block) definitions: fields, defaults, design options
src/blocks/render/          how each section renders on the site
src/app/(site)/[locale]/    public pages
src/app/(preview)/preview   live preview used by the admin editors
src/app/admin/              admin panel pages
src/app/api/admin/          admin JSON API (pages, services, projects, media, settings, leads, QR)
src/components/admin/       admin UI kit, schema-driven forms, page builder
src/lib/                    settings defaults, i18n, auth, theme, database
public/brand/               logo files (SVG), mark, Open Graph image
public/photos/              default photography (Pexels license, see CREDITS.txt) — `node scripts/fetch-photos.mjs` restores them
public/videos/              hero background video (12 s loop, 720p + 480p; Pexels license, see CREDITS.txt)
storage/uploads/            uploaded media (served at /uploads/…)
```
