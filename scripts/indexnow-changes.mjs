// Works out which pages changed in this build, for IndexNow.
//
//   node scripts/indexnow-changes.mjs        (after `npm run build`)
//
// Compares the new sitemap in dist/ (with real <lastmod> dates, see
// src/lib/sitemapDates.mjs) against the sitemap currently live, and
// prints the changed or new page addresses as JSON. In GitHub Actions it
// also writes them to the step output `urls`, which the deploy job sends
// to IndexNow once the new site is live. If the live sitemap can't be
// read (a first deploy), every page counts as changed.
import { readFileSync, readdirSync, appendFileSync } from 'node:fs';

const parse = (xml) => [...xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({ loc: m[1], lastmod: m[2] ?? '' }));
const fresh = readdirSync('dist').filter((f) => /^sitemap-\d+\.xml$/.test(f)).flatMap((f) => parse(readFileSync(`dist/${f}`, 'utf8')));
if (!fresh.length) {
  console.error('No sitemap in dist/. Run the build first.');
  process.exit(1);
}
const origin = new URL(fresh[0].loc).origin;

let live = new Map();
try {
  const index = await (await fetch(`${origin}/sitemap-index.xml`)).text();
  const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const map of maps) for (const u of parse(await (await fetch(map)).text())) live.set(u.loc, u.lastmod);
} catch (err) {
  console.warn(`Couldn't read the live sitemap (${err.message}); treating every page as changed.`);
  live = new Map();
}

const changed = fresh.filter((u) => !live.has(u.loc) || (u.lastmod && u.lastmod !== live.get(u.loc))).map((u) => u.loc);
console.log(JSON.stringify(changed, null, 2));
console.error(`${changed.length} of ${fresh.length} pages changed.`);
// The key file sits at the site's root (which includes the base path on
// a GitHub Pages project address): the shortest address in the sitemap.
const root = fresh.map((u) => u.loc).sort((a, b) => a.length - b.length)[0];
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `urls=${JSON.stringify(changed)}\nkeyloc=${root}indexnow-key.txt\n`);
