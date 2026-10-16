// Last-updated dates for the sitemap (<lastmod>), so search engines can
// see which pages changed and re-crawl those first. Each page's date is
// the latest real edit: the page row itself or any of its content blocks
// (page text edited in the admin). Never a build date, never faked:
// Google ignores lastmod once it learns a site's dates aren't honest.
//
// Plain .mjs so astro.config.mjs can import it. Reads the same public
// (anon) Supabase URL and key the site build uses; if they're missing or
// the request fails, the sitemap is simply built without dates.
export async function loadSitemapDates(env) {
  const url = env.PUBLIC_SUPABASE_URL;
  const key = env.PUBLIC_SUPABASE_ANON_KEY;
  const dates = new Map();
  if (!url || !key) return dates;
  const get = async (path) => {
    const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  };
  try {
    const [pages, blocks] = await Promise.all([
      get('pages?select=id,slug,page_type,updated_at,date_modified'),
      get('content_blocks?select=page_id,updated_at'),
    ]);
    const latestBlock = new Map();
    for (const b of blocks) {
      if (!b.updated_at) continue;
      if (!latestBlock.has(b.page_id) || b.updated_at > latestBlock.get(b.page_id)) latestBlock.set(b.page_id, b.updated_at);
    }
    for (const p of pages) {
      const candidates = [p.updated_at, latestBlock.get(p.id), p.date_modified].filter(Boolean).sort();
      if (!candidates.length) continue;
      const path = p.page_type === 'Homepage' ? '/' : `/${String(p.slug).replace(/^\/+|\/+$/g, '')}/`;
      dates.set(path, new Date(candidates[candidates.length - 1]).toISOString());
    }
  } catch (err) {
    console.warn(`[sitemap] building without <lastmod>: ${err.message}`);
  }
  return dates;
}
