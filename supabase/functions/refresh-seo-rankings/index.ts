// Weekly SEO Insights refresh: pulls each active target keyword's
// current Mangools SerpWatcher rank-tracking stats, plus one
// competitor keyword-gap check per client, and snapshots both into
// keyword_rank_snapshots/keyword_gap_snapshots. See CLAUDE.md's "SEO
// Insights dashboard" section for the full design reasoning — most
// importantly, this reads Mangools SerpWatcher trackings that already
// exist (created once, manually, during a real curation session) rather
// than paying for a fresh point-in-time check per keyword per run, and
// runs weekly rather than daily specifically to keep this client's
// share of the shared Mangools quota pool low.
//
// Auth: same shape as send-nurture-emails — there's no browser session
// here, the caller is a Supabase Cron job, not a logged-in admin. A
// dedicated SEO_CRON_SECRET (not NURTURE_CRON_SECRET — separate
// concern, separate rotation) is checked directly rather than compared
// against SUPABASE_SERVICE_ROLE_KEY, for the same reason documented in
// send-nurture-emails/index.ts (the key injected into a function's own
// environment doesn't reliably match what an external caller would
// present).
//
// Config (`supabase secrets set ... --project-ref <ref>`):
//   SEO_CRON_SECRET  - any random value (e.g. `openssl rand -hex 32`).
//                      Configure the Supabase Cron job (Dashboard ->
//                      Integrations -> Cron, weekly schedule) to send
//                      this same value as its Authorization: Bearer
//                      header.
//   MANGOOLS_API_KEY - the x-access-token value for CMC's shared
//                       Mangools account (see CLAUDE.md's Mangools
//                       section for the MCP-vs-REST split — a deployed
//                       Edge Function can't use MCP at runtime, so this
//                       calls the REST API directly).
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// IMPORTANT — exact Mangools endpoint paths below (MANGOOLS_SERPWATCHER_
// STATS_PATH, MANGOOLS_GAP_ANALYSIS_PATH) follow the same /v3/<product>/
// <action> convention as the already-confirmed kwfinder/related-keywords
// endpoint, but have not yet been confirmed against a live response —
// verify both via a real curl call (or the connected Mangools MCP tools)
// before relying on this in production, and adjust the response-shape
// parsing below to match whatever comes back for real.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MANGOOLS_API_BASE = 'https://api.mangools.com/v3';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

interface TargetKeywordRow {
  id: string;
  keyword: string;
  mangools_tracking_id: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const cronSecret = Deno.env.get('SEO_CRON_SECRET');
  if (!cronSecret || req.headers.get('Authorization') !== `Bearer ${cronSecret}`) {
    return jsonResponse({ error: 'Not authorized' }, 401);
  }

  const mangoolsApiKey = Deno.env.get('MANGOOLS_API_KEY');
  if (!mangoolsApiKey) {
    return jsonResponse({ error: 'Mangools is not configured for this site' }, 500);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: business } = await supabase
    .from('business')
    .select('mangools_location_id, seo_competitor_domains, google_maps_url')
    .maybeSingle();

  if (!business?.mangools_location_id) {
    // Graceful "not configured" response, same shape as get-traffic-stats
    // on a site with no Cloudflare token set — onboarding hasn't reached
    // this step yet, not an error.
    return jsonResponse({ skipped: 'mangools_location_id not set on business' });
  }

  const { data: targetKeywords, error: keywordsError } = await supabase
    .from('target_keywords')
    .select('id, keyword, mangools_tracking_id')
    .in('status', ['active', 'achieved']);

  if (keywordsError) {
    return jsonResponse({ error: 'Could not load target keywords: ' + keywordsError.message }, 500);
  }

  let ranksChecked = 0;
  let ranksErrors: string[] = [];

  for (const tk of (targetKeywords as TargetKeywordRow[]) ?? []) {
    if (!tk.mangools_tracking_id) {
      // Curated but not yet given a real SerpWatcher tracking — skipped,
      // not errored, so a partially-curated list never fails the run.
      continue;
    }

    try {
      const statsRes = await fetch(
        `${MANGOOLS_API_BASE}/serpwatcher/tracked-keywords/${tk.mangools_tracking_id}/stats`,
        { headers: { 'x-access-token': mangoolsApiKey } }
      );
      if (!statsRes.ok) {
        ranksErrors.push(`${tk.keyword}: Mangools returned ${statsRes.status}`);
        continue;
      }
      const stats = await statsRes.json();
      // Response-shape assumption, pending live confirmation — see the
      // top-of-file note. Adjust these two field accesses once a real
      // response is captured.
      const position: number | null = stats?.position ?? null;
      const rankingUrl: string | null = stats?.url ?? null;

      const { error: insertError } = await supabase.from('keyword_rank_snapshots').insert({
        target_keyword_id: tk.id,
        position,
        ranking_url: rankingUrl,
      });
      if (insertError) {
        ranksErrors.push(`${tk.keyword}: ${insertError.message}`);
        continue;
      }
      ranksChecked++;
    } catch (err) {
      ranksErrors.push(`${tk.keyword}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Once per client, not per-keyword — a single competitor-gap
  // comparison against every configured competitor domain.
  let gapKeywordsFound = 0;
  const competitorDomains: string[] = business.seo_competitor_domains ?? [];

  if (competitorDomains.length > 0) {
    try {
      const gapRes = await fetch(`${MANGOOLS_API_BASE}/kwfinder/keyword-gap-analysis`, {
        method: 'POST',
        headers: { 'x-access-token': mangoolsApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitor_domains: competitorDomains,
          location_id: business.mangools_location_id,
          language_id: 1000,
        }),
      });
      if (!gapRes.ok) {
        ranksErrors.push(`gap analysis: Mangools returned ${gapRes.status}`);
      } else {
        const gapData = await gapRes.json();
        // Response-shape assumption, pending live confirmation — see the
        // top-of-file note.
        const gapKeywords: { keyword: string; search_volume?: number; domain: string }[] = gapData?.keywords ?? [];
        for (const gk of gapKeywords) {
          const { error: gapInsertError } = await supabase.from('keyword_gap_snapshots').insert({
            keyword: gk.keyword,
            search_volume: gk.search_volume ?? null,
            competitor_domain: gk.domain,
          });
          if (!gapInsertError) gapKeywordsFound++;
        }
      }
    } catch (err) {
      ranksErrors.push(`gap analysis: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return jsonResponse({ ranksChecked, ranksErrors, gapKeywordsFound });
});
