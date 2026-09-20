// Tier 4 of the admin Leads and analytics dashboard (see CLAUDE.md's
// "Client dashboard" section) — Google Business Profile Performance data:
// map/search impressions, website clicks, call clicks, direction
// requests. Same shape of problem as get-traffic-stats (Tier 2): the
// credentials needed to read this back out can never reach the browser,
// so this function holds them server-side and the dashboard calls this
// instead of Google's API directly.
//
// Auth: same "verify_jwt isn't enough" preamble as every other admin
// function in this project, plus an admin_users role check —
// owner/agency only, matching admin/leads.astro's own gate.
//
// Config (`supabase secrets set ... --project-ref <ref>`), all per-client
// (unlike Mangools' one shared CMC-account key, this is each client's own
// OAuth grant on their own Google Business Profile — see the migration's
// header comment):
//   GOOGLE_BUSINESS_CLIENT_ID     - OAuth 2.0 Client ID from the Google
//                                   Cloud project used to request this
//                                   grant (same project/client id is
//                                   reused across every client site —
//                                   it's CMC's registered app, not a
//                                   per-client value — but still has to
//                                   be set per Supabase project since
//                                   secrets don't share across projects,
//                                   same as PUBLIC_UNSPLASH_APP_NAME).
//   GOOGLE_BUSINESS_CLIENT_SECRET - the matching OAuth client secret.
//   GOOGLE_BUSINESS_REFRESH_TOKEN - THIS client's own refresh token,
//                                   obtained once from a real OAuth
//                                   consent grant (scope
//                                   https://www.googleapis.com/auth/business.manage)
//                                   done by whoever has manager access on
//                                   this client's real GBP listing. Never
//                                   portable between clients.
//
// business.google_business_location_id (not a secret, see the migration)
// is the location resource id every Performance API call targets.
//
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are
// injected automatically into every Edge Function's environment.
//
// **Unverified against a live response.** Written from Google's published
// Business Profile Performance API v1 documentation
// (businessprofileperformance.googleapis.com) — no real OAuth grant exists
// for any client yet, so unlike refresh-seo-rankings' Mangools endpoints
// (which were corrected after a real live call exposed a wrong response
// shape), this has not had that same live-call correction pass. Treat the
// response-parsing logic below as the first thing to check if this comes
// back empty or errors once a real refresh token is set — trust a real
// response over these comments if they ever disagree, same discipline as
// the Mangools functions.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// The 7 daily metrics this dashboard cares about, out of the full set the
// API supports (BUSINESS_BOOKINGS, BUSINESS_FOOD_ORDERS, etc. don't apply
// to a counseling practice and aren't requested). Desktop/mobile map and
// search impressions are summed client-side into "map views"/"search
// views" the same way get-traffic-stats folds Cloudflare's raw event
// counts into a smaller set of dashboard numbers.
const DAILY_METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
  'WEBSITE_CLICKS',
  'CALL_CLICKS',
  'BUSINESS_DIRECTION_REQUESTS',
] as const;

type DailyMetric = (typeof DAILY_METRICS)[number];

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function toDateParts(d: Date): DateParts {
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function dateKey(p: { year: number; month: number; day: number }): string {
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

// Google's documented response shape for fetchMultiDailyMetricsTimeSeries:
// { multiDailyMetricTimeSeries: [ { dailyMetricTimeSeries: [
//     { dailyMetric, timeSeries: { datedValues: [ { date, value } ] } }
// ] } ] } — parsed defensively (optional chaining, `?? []` everywhere)
// since this hasn't been checked against a real response yet (see header
// comment).
function parseMetricSeries(apiResponse: any): Map<DailyMetric, Map<string, number>> {
  const result = new Map<DailyMetric, Map<string, number>>();
  const groups = apiResponse?.multiDailyMetricTimeSeries ?? [];
  for (const group of groups) {
    const series = group?.dailyMetricTimeSeries ?? [];
    for (const entry of series) {
      const metric = entry?.dailyMetric as DailyMetric | undefined;
      if (!metric) continue;
      const byDate = result.get(metric) ?? new Map<string, number>();
      const datedValues = entry?.timeSeries?.datedValues ?? [];
      for (const dv of datedValues) {
        if (!dv?.date) continue;
        const key = dateKey(dv.date);
        const value = Number(dv.value ?? 0);
        byDate.set(key, (byDate.get(key) ?? 0) + value);
      }
      result.set(metric, byDate);
    }
  }
  return result;
}

function sumMetricInRange(
  byMetric: Map<DailyMetric, Map<string, number>>,
  metrics: DailyMetric[],
  start: Date,
  end: Date
): number {
  let total = 0;
  for (const metric of metrics) {
    const byDate = byMetric.get(metric);
    if (!byDate) continue;
    for (const [key, value] of byDate) {
      const d = new Date(key + 'T00:00:00Z');
      if (d >= start && d < end) total += value;
    }
  }
  return total;
}

function dailySeries(
  byMetric: Map<DailyMetric, Map<string, number>>,
  metrics: DailyMetric[],
  start: Date,
  end: Date
): { date: string; value: number }[] {
  const byDate = new Map<string, number>();
  for (const metric of metrics) {
    const series = byMetric.get(metric);
    if (!series) continue;
    for (const [key, value] of series) {
      byDate.set(key, (byDate.get(key) ?? 0) + value);
    }
  }
  const out: { date: string; value: number }[] = [];
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = dateKey(toDateParts(d));
    out.push({ date: key, value: byDate.get(key) ?? 0 });
  }
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST' && req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await callerClient.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: 'Not authenticated' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: callerRow } = await adminClient
    .from('admin_users')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!callerRow || (callerRow.role !== 'owner' && callerRow.role !== 'agency') || callerRow.status !== 'active') {
    return jsonResponse({ error: 'Not authorized' }, 403);
  }

  const clientId = Deno.env.get('GOOGLE_BUSINESS_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_BUSINESS_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_BUSINESS_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) {
    return jsonResponse({ error: 'Google Business Profile is not configured for this site' }, 500);
  }

  const { data: business } = await adminClient.from('business').select('google_business_location_id').maybeSingle();
  if (!business?.google_business_location_id) {
    return jsonResponse({ error: 'Google Business Profile is not configured for this site' }, 500);
  }

  // Short-lived access token, fetched fresh on every call rather than
  // cached — same "no state to go stale" tradeoff refresh-seo-rankings
  // makes by not caching Mangools responses either, and this function is
  // called at most a few times per admin page load, not high-frequency.
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenRes.ok) {
    return jsonResponse({ error: 'Google OAuth token refresh failed', detail: await tokenRes.text() }, 502);
  }
  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    return jsonResponse({ error: 'Google OAuth token refresh returned no access token' }, 502);
  }

  const now = new Date();
  const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  const rangeStart = startOfLastMonth;
  const startParts = toDateParts(rangeStart);
  const endParts = toDateParts(tomorrow);

  const params = new URLSearchParams();
  for (const metric of DAILY_METRICS) params.append('dailyMetrics', metric);
  params.set('dailyRange.start_date.year', String(startParts.year));
  params.set('dailyRange.start_date.month', String(startParts.month));
  params.set('dailyRange.start_date.day', String(startParts.day));
  params.set('dailyRange.end_date.year', String(endParts.year));
  params.set('dailyRange.end_date.month', String(endParts.month));
  params.set('dailyRange.end_date.day', String(endParts.day));

  const gbpUrl = `https://businessprofileperformance.googleapis.com/v1/locations/${business.google_business_location_id}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`;

  const gbpRes = await fetch(gbpUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!gbpRes.ok) {
    return jsonResponse({ error: 'Google Business Profile API request failed', detail: await gbpRes.text() }, 502);
  }
  const gbpJson = await gbpRes.json();
  const byMetric = parseMetricSeries(gbpJson);

  const mapMetrics: DailyMetric[] = ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS'];
  const searchMetrics: DailyMetric[] = ['BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH'];

  function monthSummary(start: Date, end: Date) {
    return {
      mapViews: sumMetricInRange(byMetric, mapMetrics, start, end),
      searchViews: sumMetricInRange(byMetric, searchMetrics, start, end),
      websiteClicks: sumMetricInRange(byMetric, ['WEBSITE_CLICKS'], start, end),
      callClicks: sumMetricInRange(byMetric, ['CALL_CLICKS'], start, end),
      directionRequests: sumMetricInRange(byMetric, ['BUSINESS_DIRECTION_REQUESTS'], start, end),
    };
  }

  return jsonResponse({
    thisMonth: monthSummary(startOfThisMonth, tomorrow),
    lastMonth: monthSummary(startOfLastMonth, startOfThisMonth),
    byDay: dailySeries(byMetric, [...mapMetrics, ...searchMetrics], thirtyDaysAgo, tomorrow),
  });
});
