// Weekly referral partner email to the practice owner (referral partners
// upgrade step 5, migration 0086; plan:
// Counselor Marking Co./referral-partners/upgrade-plan.md).
//
// Two ways in:
//   - The weekly schedule (pg_cron, Mondays): Authorization: Bearer
//     DIGEST_CRON_SECRET. Sends only when business.partner_digest_enabled
//     is on, there is something to report, and none went out in the last
//     six days (so a retried run never doubles up).
//   - "Send me a test" in the admin: a signed-in owner or agency session
//     with { test: true }. Always sends, to that person only, even with
//     nothing to report, so they can see what it looks like.
// verify_jwt is off for this function (the cron secret isn't a Supabase
// JWT), so the test path checks the session itself.
//
// Privacy: counts and partner names only. Never a client's name or details:
// this goes to an inbox, and the admin is where client records live.
//
// The due / going cold / stopped referring rules are the same file the
// admin uses (_shared/partnerHealth.ts).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { partnerHealth, type PartnerHealthRow } from '../_shared/partnerHealth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const REFERRAL_LEAD_SOURCES = ['doctor', 'professional', 'church'];
const DAY = 86_400_000;

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function shortDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

type Partner = {
  id: string;
  name: string;
  status: string;
  archived_at: string | null;
  created_at: string;
  priority: string | null;
  next_follow_up: string | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const db = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const auth = req.headers.get('Authorization') ?? '';
  const cronSecret = Deno.env.get('DIGEST_CRON_SECRET');
  const body = await req.json().catch(() => ({}));

  // Who is asking: the schedule, or a person testing from the admin.
  // { dry_run: true } with the schedule's secret builds the email and returns
  // it without sending or recording anything (for checking the wording).
  let testTo: string | null = null;
  let dryRun = false;
  if (cronSecret && auth === `Bearer ${cronSecret}`) {
    testTo = null;
    dryRun = body?.dry_run === true;
  } else if (body?.test === true && auth.startsWith('Bearer ')) {
    const caller = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return json({ error: 'Not signed in' }, 401);
    const { data: me } = await db.from('admin_users').select('role, status, email').eq('id', user.id).maybeSingle();
    if (!me || (me.role !== 'owner' && me.role !== 'agency') || me.status !== 'active' || !me.email) {
      return json({ error: 'Only an owner or the agency can send a test.' }, 403);
    }
    testTo = me.email;
  } else {
    return json({ error: 'Unauthorized' }, 401);
  }

  const resendKey = Deno.env.get('NURTURE_RESEND_API_KEY');
  const sender = Deno.env.get('NURTURE_SENDER_EMAIL');
  if (!resendKey || !sender) return json({ error: 'Email sending is not set up for this site.' }, 503);

  const { data: biz } = await db
    .from('business')
    .select('id, display_name, website_domain, lead_notification_email, partner_digest_enabled, partner_digest_email, partner_digest_last_sent_at')
    .maybeSingle();
  if (!biz) return json({ error: 'No business record' }, 500);

  if (!testTo && !dryRun) {
    if (!biz.partner_digest_enabled) return json({ skipped: 'turned off' });
    if (biz.partner_digest_last_sent_at && Date.now() - new Date(biz.partner_digest_last_sent_at).getTime() < 6 * DAY) {
      return json({ skipped: 'already sent this week' });
    }
  }

  const now = new Date();
  const today = ymd(now);
  const weekAgo = new Date(now.getTime() - 7 * DAY).toISOString();
  const weekOut = ymd(new Date(now.getTime() + 6 * DAY));

  const [pRes, hRes, refRes, toldRes] = await Promise.all([
    db.from('referral_partners').select('id, name, status, archived_at, created_at, priority, next_follow_up').is('archived_at', null),
    db.from('referral_partner_health').select('*'),
    db.from('leads').select('referral_partner_id, status').not('referral_partner_id', 'is', null).is('lead_magnet_id', null).gte('created_at', weekAgo).limit(1000),
    db.from('leads').select('id').is('referral_partner_id', null).is('lead_magnet_id', null).in('lead_source', REFERRAL_LEAD_SOURCES).gte('created_at', weekAgo).limit(1000),
  ]);
  if (pRes.error) return json({ error: pRes.error.message }, 500);
  const partners = (pRes.data ?? []) as Partner[];
  const health = new Map(((hRes.data ?? []) as PartnerHealthRow[]).map((r) => [r.partner_id, r]));
  const byId = new Map(partners.map((p) => [p.id, p]));

  // 1. New referrals this week, by partner (counts only).
  const refCounts = new Map<string, number>();
  for (const l of refRes.data ?? []) refCounts.set(l.referral_partner_id as string, (refCounts.get(l.referral_partner_id as string) ?? 0) + 1);
  const newRefs = [...refCounts.entries()]
    .map(([id, n]) => ({ name: byId.get(id)?.name ?? 'A partner', n }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  const unlinked = (toldRes.data ?? []).length;

  // 2. Follow-ups due in the next 7 days (or overdue).
  const followUps = partners
    .filter((p) => p.status !== 'inactive' && p.next_follow_up && p.next_follow_up <= weekOut)
    .sort((a, b) => a.next_follow_up!.localeCompare(b.next_follow_up!));

  // 3. Time to reach out: same rules and order as the partners page.
  const reach = partners
    .filter((p) => p.status === 'active' && !(p.next_follow_up && p.next_follow_up >= today))
    .map((p) => ({ p, h: partnerHealth(p, health.get(p.id), now) }))
    .filter(({ h }) => h.stoppedReferring || h.state === 'cold' || h.state === 'due')
    .sort((a, b) => (a.h.stoppedReferring ? 0 : a.h.state === 'cold' ? 1 : 2) - (b.h.stoppedReferring ? 0 : b.h.state === 'cold' ? 1 : 2));

  const nothing = newRefs.length === 0 && unlinked === 0 && followUps.length === 0 && reach.length === 0;
  if (nothing && !testTo && !dryRun) return json({ skipped: 'nothing to report' });

  // Email: a short, plain note with one link to the admin.
  const site = biz.website_domain ? `https://${String(biz.website_domain).replace(/^https?:\/\//, '').replace(/\/+$/, '')}` : '';
  const adminLink = site ? `${site}/admin/referral-partners/` : '';
  const reportLink = site ? `${site}/admin/analytics/referrals/` : '';
  const section = (title: string, items: string[]) =>
    items.length
      ? `<p style="margin:20px 0 6px;font-weight:600;">${esc(title)}</p><ul style="margin:0;padding-left:20px;">${items.map((i) => `<li style="margin:0 0 4px;">${i}</li>`).join('')}</ul>`
      : '';
  const textSection = (title: string, items: string[]) => (items.length ? `${title}\n${items.map((i) => `- ${i.replace(/<[^>]+>/g, '')}`).join('\n')}\n\n` : '');

  const refItems = newRefs.map((r) => `${esc(r.name)}: ${plural(r.n, 'new inquiry', 'new inquiries')}`);
  if (unlinked) refItems.push(`${plural(unlinked, 'inquiry', 'inquiries')} said a doctor, professional or church referred them but ${unlinked === 1 ? "isn't" : "aren't"} linked to a partner yet. Link ${unlinked === 1 ? 'it' : 'them'} in Inquiries so ${unlinked === 1 ? 'it counts' : 'they count'}.`);
  const followItems = followUps.map((p) => `${esc(p.name)}: ${p.next_follow_up! < today ? `overdue (was due ${shortDate(p.next_follow_up!)})` : p.next_follow_up === today ? 'due today' : `due ${shortDate(p.next_follow_up!)}`}`);
  const reachItems = reach.map(({ p, h }) =>
    h.stoppedReferring
      ? `${esc(p.name)}: no referral in ${h.stoppedReferring.daysSince} days (usually every ${h.stoppedReferring.usualGap}). A check-in or thank-you can help.`
      : h.daysSinceContact === null
        ? `${esc(p.name)}: active partner with no contact logged yet`
        : `${esc(p.name)}: ${h.state === 'cold' ? 'going cold' : 'due for a touch'}, last contact ${h.daysSinceContact} days ago`
  );

  const counts = [
    reach.length ? `${plural(reach.length, 'partner')} to reach out to` : '',
    followUps.length ? plural(followUps.length, 'follow-up') : '',
    newRefs.length ? plural(newRefs.reduce((s, r) => s + r.n, 0), 'new referral') : '',
  ].filter(Boolean);
  const subject = nothing ? 'Referral partners this week: all caught up' : `Referral partners this week: ${counts.join(', ') || 'a few things to check'}`;

  const intro = nothing
    ? 'Nothing needs your attention this week: no follow-ups due, no partners going quiet, and no new referrals. (This is a test, so it was sent anyway. A real week like this sends nothing.)'
    : 'Here is where your referral relationships stand this week.';
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1f2328;max-width:600px;">
<p style="margin:0 0 14px;">${esc(intro)}</p>
${section('Time to reach out', reachItems)}
${section('Follow-ups due this week', followItems)}
${section('New referrals in the last 7 days', refItems)}
${adminLink ? `<p style="margin:22px 0 0;"><a href="${adminLink}">Open Referral partners</a>${reportLink ? ` &middot; <a href="${reportLink}">Referral report</a>` : ''}</p>` : ''}
<p style="margin:22px 0 0;font-size:12.5px;color:#6b7280;">You get this weekly email because it's turned on in your admin (Referral partners, Weekly email). Client names are never included.</p>
</div>`;
  const text = `${intro}\n\n${textSection('Time to reach out', reachItems)}${textSection('Follow-ups due this week', followItems)}${textSection('New referrals in the last 7 days', refItems)}${adminLink ? `Referral partners: ${adminLink}\n` : ''}${reportLink ? `Referral report: ${reportLink}\n` : ''}\nYou get this weekly email because it's turned on in your admin (Referral partners, Weekly email). Client names are never included.`;

  const recipients = testTo
    ? [testTo]
    : String(biz.partner_digest_email || biz.lead_notification_email || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
  if (dryRun) return json({ dry_run: true, would_send_to: recipients, subject, text });
  if (!recipients.length) return json({ skipped: 'no recipient address' });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: biz.display_name ? `${String(biz.display_name).replace(/["<>]/g, '')} <${sender}>` : sender,
      to: recipients,
      subject: testTo ? `[Test] ${subject}` : subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error('send-partner-digest: Resend rejected the email', { status: res.status, detail });
    return json({ error: `The email wasn't sent (error ${res.status}).` }, 502);
  }
  if (!testTo) await db.from('business').update({ partner_digest_last_sent_at: new Date().toISOString() }).eq('id', biz.id);

  return json({ ok: true, sent_to: recipients, test: Boolean(testTo), reach: reach.length, follow_ups: followUps.length, new_referrals: newRefs.length, unlinked });
});
