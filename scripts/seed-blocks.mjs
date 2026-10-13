// Load approved page text into content_blocks (site system v2).
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-blocks.mjs [--overwrite] [--dry-run] [file ...]
//
// Reads content/blocks/*.json (or the files given). Each file:
//   { "slug": "" | "<page slug>", "blocks": { "<block key>": <value>, ... } }
// ("" is the homepage.) By default only blocks with no stored value are
// written, so text a practice edited in the admin is never overwritten;
// --overwrite replaces stored values too (use only before launch).
//
// The service role key is used only from the environment for this run,
// never written to a file.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const dryRun = args.includes('--dry-run');
const files = args.filter((a) => !a.startsWith('--'));
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for this run.');
  process.exit(1);
}

const dir = 'content/blocks';
const targets = files.length ? files : existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f)) : [];
if (!targets.length) {
  console.error('No block files found (content/blocks/*.json).');
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
async function api(path, init = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const pages = await api('pages?select=id,slug,page_type');
let written = 0;
let kept = 0;
for (const file of targets) {
  const { slug, blocks } = JSON.parse(readFileSync(file, 'utf8'));
  const page = slug === '' ? pages.find((p) => p.page_type === 'Homepage') : pages.find((p) => p.slug === slug);
  if (!page) { console.error(`${file}: no page with slug "${slug}"`); process.exitCode = 1; continue; }
  const existing = await api(`content_blocks?select=block_key&page_id=eq.${page.id}`);
  const have = new Set(existing.map((r) => r.block_key));
  const rows = Object.entries(blocks)
    .filter(([k]) => overwrite || !have.has(k))
    .map(([block_key, value]) => ({ page_id: page.id, block_key, value }));
  kept += Object.keys(blocks).length - rows.length;
  if (!rows.length) { console.log(`${file}: nothing new`); continue; }
  if (!dryRun) {
    await api('content_blocks?on_conflict=page_id,block_key', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(rows),
    });
  }
  written += rows.length;
  console.log(`${file}: ${dryRun ? 'would write' : 'wrote'} ${rows.length} block(s) to ${slug || 'home'}`);
}
console.log(`Done. ${dryRun ? 'Would write' : 'Wrote'} ${written}; kept ${kept} already-stored value(s).`);
