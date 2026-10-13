// Launch preview (site system v2). While a site is rebuilt on a branch,
// the branch and the live site read the same database, so page fields
// (H1, titles, descriptions, FAQs, menu) can't change in the database
// before launch without leaking onto the live site. Instead they live in
// content/launch/pages.json, applied on top of the database only when
// LAUNCH_PREVIEW=1 (branch previews). At launch the same file is applied
// to the database (scripts/apply-launch.mjs) and this has no effect.
//
// File shape: { "pages": { "<slug>": { <page column>: value, "parent": "<slug>" } },
//               "business": { <business column>: value } }
import { readFileSync, existsSync } from 'node:fs';
import type { Page, Business } from './pages';

const ENABLED = process.env.LAUNCH_PREVIEW === '1';
const FILE = 'content/launch/pages.json';

interface Overlay {
  pages?: Record<string, Partial<Page> & { parent?: string }>;
  business?: Partial<Business>;
}

let cached: Overlay | null = null;
function overlay(): Overlay {
  if (cached) return cached;
  cached = ENABLED && existsSync(FILE) ? (JSON.parse(readFileSync(FILE, 'utf8')) as Overlay) : {};
  return cached;
}

export const launchPreview = () => ENABLED;

export function applyPageOverlay(all: Page[]): Page[] {
  const o = overlay().pages;
  if (!o) return all;
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return all.map((p) => {
    const patch = o[p.slug];
    if (!patch) return p;
    const { parent, ...fields } = patch;
    const next = { ...p, ...fields } as Page;
    if (parent !== undefined) next.parent_page_id = parent ? bySlug.get(parent)?.id ?? null : null;
    return next;
  });
}

export function applyBusinessOverlay(b: Business): Business {
  const o = overlay().business;
  return o ? ({ ...b, ...o } as Business) : b;
}
