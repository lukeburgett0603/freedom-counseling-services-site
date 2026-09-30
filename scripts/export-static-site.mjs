#!/usr/bin/env node
// Static exit export: the practice's public website as plain files that
// run anywhere, with no dependency on CMC's backend. Run by CMC when a
// practice leaves (see the offboarding playbook in the CMC folder,
// offboarding/client-exit-process.md). The practice keeps its website,
// content, images, domain, and data; the CMC platform (admin, CRM,
// dashboards, automations) stays with CMC.
//
// Usage (from the repo root, while the practice's Supabase project still
// exists, since content is fetched at build time):
//   node scripts/export-static-site.mjs
//   node scripts/export-static-site.mjs --form-action=https://formspree.io/f/xxxx
//
// What it does:
//   1. Builds the site with PUBLIC_STATIC_EXPORT=true (src/lib/exportMode.ts),
//      which removes every backend dependency from the public pages.
//   2. Deletes /admin and prunes JS/CSS that only admin pages used.
//   3. Downloads every image still served from CMC's Supabase Storage into
//      the export and rewrites references to the practice's own domain.
//   4. Verifies no reference to CMC's Supabase project remains, and fails
//      loudly if one does.
//   5. Writes HOSTING-README.md and zips everything to exports/.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { zipSync } from 'fflate';

const root = process.cwd();
const formAction = process.argv.find((a) => a.startsWith('--form-action='))?.split('=').slice(1).join('=') ?? '';

function readEnv(key) {
  if (process.env[key]) return process.env[key];
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return '';
  const line = readFileSync(envPath, 'utf8').split('\n').find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : '';
}

const supabaseUrl = readEnv('PUBLIC_SUPABASE_URL');
if (!supabaseUrl) {
  console.error('PUBLIC_SUPABASE_URL is not set (.env). Run this from the client repo root.');
  process.exit(1);
}
const supabaseHost = new URL(supabaseUrl).host;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const TEXT_EXT = new Set(['.html', '.css', '.js', '.mjs', '.xml', '.json', '.txt', '.webmanifest', '.svg']);

// 1. Build
const outDir = join(tmpdir(), `static-export-${Date.now()}`);
console.log(`Building static export into ${outDir} ...`);
const build = spawnSync('npx', ['astro', 'build', '--outDir', outDir], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_STATIC_EXPORT: 'true', PUBLIC_EXPORT_FORM_ACTION: formAction },
});
if (build.status !== 0) {
  console.error('Build failed; nothing exported.');
  process.exit(1);
}

// 2. Remove the admin area, then prune assets nothing public still uses.
rmSync(join(outDir, 'admin'), { recursive: true, force: true });

const referenced = new Set();
const queue = [];
for (const file of walk(outDir).filter((f) => f.endsWith('.html'))) {
  for (const m of readFileSync(file, 'utf8').matchAll(/\/_astro\/[^"'\s)>?#]+/g)) queue.push(m[0].split('/').pop());
}
while (queue.length) {
  const name = queue.pop();
  if (referenced.has(name)) continue;
  referenced.add(name);
  const path = join(outDir, '_astro', name);
  if (!existsSync(path) || !['.js', '.css', '.mjs'].includes(extname(path))) continue;
  for (const m of readFileSync(path, 'utf8').matchAll(/["'`(/]\.?\.?\/?(?:_astro\/)?([A-Za-z0-9_.@-]+\.(?:js|mjs|css|woff2?|ttf|svg|png|jpe?g|webp|avif|gif))/g)) queue.push(m[1]);
}
let pruned = 0;
const astroDir = join(outDir, '_astro');
if (existsSync(astroDir)) {
  for (const file of walk(astroDir)) {
    if (!referenced.has(file.split('/').pop())) {
      rmSync(file);
      pruned++;
    }
  }
}
console.log(`Removed /admin and ${pruned} admin-only asset file(s).`);

// 3. Localize Supabase Storage images onto the practice's own domain.
const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8');
const canonical = indexHtml.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (!canonical) {
  console.error('Could not find the canonical URL in index.html; cannot rewrite image URLs safely.');
  process.exit(1);
}
const siteRoot = canonical.endsWith('/') ? canonical : `${canonical}/`;
const storagePattern = new RegExp(`https://${supabaseHost.replace(/\./g, '\\.')}/storage/v1/object/public/([^"'\\s)<>?#]+)`, 'g');

const textFiles = walk(outDir).filter((f) => TEXT_EXT.has(extname(f)));
const storagePaths = new Set();
for (const file of textFiles) {
  for (const m of readFileSync(file, 'utf8').matchAll(storagePattern)) storagePaths.add(m[1]);
}
for (const storagePath of storagePaths) {
  const res = await fetch(`https://${supabaseHost}/storage/v1/object/public/${storagePath}`);
  if (!res.ok) {
    console.error(`Could not download storage file ${storagePath} (${res.status}).`);
    process.exit(1);
  }
  const dest = join(outDir, '_files', decodeURIComponent(storagePath));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}
// Visible references (img src/srcset, links, CSS url()) become site-relative
// so images work on any host, including a preview URL before the domain
// moves. Only meta tags (og:image etc.) and JSON-LD keep a full URL, since
// those must be absolute to be valid.
const basePath = new URL(siteRoot).pathname;
for (const file of textFiles) {
  const text = readFileSync(file, 'utf8');
  const next = text.replace(storagePattern, (_, p, offset) => {
    const before = text.slice(Math.max(0, offset - 60), offset);
    const needsAbsolute = /content="$/.test(before) || /"(?:url|logo|image|contentUrl|thumbnailUrl)"\s*:\s*"$/.test(before);
    return `${needsAbsolute ? siteRoot : basePath}_files/${p}`;
  });
  if (next !== text) writeFileSync(file, next);
}
console.log(`Localized ${storagePaths.size} storage file(s) under ${siteRoot}_files/.`);

// 4. Nothing may still point at CMC's backend.
const leftovers = [];
for (const file of walk(outDir).filter((f) => TEXT_EXT.has(extname(f)))) {
  if (readFileSync(file, 'utf8').includes(supabaseHost)) leftovers.push(relative(outDir, file));
}
if (leftovers.length) {
  console.error(`Export still references ${supabaseHost} in:\n  ${leftovers.join('\n  ')}\nFix these before handing over.`);
  process.exit(1);
}

// 5. README + zip
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(outDir, 'HOSTING-README.md'),
  `# Your website (exported ${today})

These are the complete files for ${siteRoot}. They are plain static files
(HTML, CSS, images) and will run on any web host.

## Putting it online
1. Choose a static host (for example Netlify, Cloudflare Pages, or GitHub
   Pages). Most have a free plan and let you upload a folder.
2. Upload everything in this folder (keep the folder structure as is).
3. Point your domain at the new host (your domain registrar's DNS
   settings; the host will tell you which records to add).

Keep your domain the same: some links and image addresses in these files
use ${siteRoot}.

## What changed from your managed site
- Editing: the admin dashboard is not included, so content changes now
  mean editing these files (or asking a web developer).
- Contact form: ${
    formAction
      ? `posts to ${formAction}. Make sure that form service account stays active.`
      : 'replaced with your phone number and email address. To add a form back, use a form service (for example Formspree) and ask your developer to point the form at it.'
  }
- Removed: guide downloads, click tracking, and the site analytics that ran
  through Counselor Marketing Co.'s systems.${
  formAction
    ? ''
    : `
- Check your page text: some pages may mention "the form below." Without a
  form service, update that wording to point people to your phone or email.`
}

Your leads, notes, referral partners, and other records are in the separate
data export (the "Download all my data" file from your admin), not here.
`
);

const files = {};
for (const file of walk(outDir)) files[relative(outDir, file)] = new Uint8Array(readFileSync(file));
const siteName = new URL(siteRoot).host.replace(/^www\./, '');
mkdirSync(join(root, 'exports'), { recursive: true });
const zipPath = join(root, 'exports', `${siteName}-website-${today}.zip`);
writeFileSync(zipPath, zipSync(files, { level: 9 }));
rmSync(outDir, { recursive: true, force: true });
console.log(`\nDone: ${relative(root, zipPath)} (${Object.keys(files).length} files).`);
