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

## Configuration (`.env`)

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | SQLite file, e.g. `file:./dev.db` (relative to `prisma/`) |
| `AUTH_SECRET` | long random string used to sign admin sessions — **must be unique in production** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin account, created by the seed when no user exists |
| `NEXT_PUBLIC_SITE_URL` | public URL (QR code, sitemap, Open Graph) — can also be set in Settings → SEO |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` (default) or `ar` — the language served at `/`; the other language lives under `/en` or `/ar` |
| `UPLOAD_DIR` | folder for uploaded media (default `./storage/uploads`) |

## Deployment

The site needs a Node.js host with a persistent disk (SQLite database + uploads). Any VPS (Hetzner, DigitalOcean, Contabo, AWS Lightsail…) works.

**Option A — Docker (recommended)**

```bash
cp .env.example .env      # then edit: AUTH_SECRET, ADMIN_*, NEXT_PUBLIC_SITE_URL=https://your-domain.com
docker compose up -d --build
```

The database is kept in `./data` and uploads in `./storage/uploads` — back up those two folders. Put Nginx/Caddy in front for HTTPS (Caddy example: `your-domain.com { reverse_proxy localhost:3000 }`).

**Option B — plain Node + PM2**

```bash
npm ci && npm run setup && npm run build
pm2 start npm --name capetown -- start
```

> Serverless platforms (Vercel, Netlify) are **not** suitable as-is because uploads and the SQLite file need a persistent disk.

## Content handover checklist

1. Sign in, open **My account** and change the password.
2. **Settings → Contact details**: real phone numbers, WhatsApp, email, address, Google Maps embed link, working hours, social links.
3. **Settings → SEO & site URL**: set the public domain (used by the QR code).
4. **Media**: upload the company's own project photos and swap them in under **Projects**, **Services** and the home page **Hero** section (Design tab → Background). The current photos are free stock images from Pexels (`public/photos/CREDITS.txt`).
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
storage/uploads/            uploaded media (served at /uploads/…)
```
