// Sends one email to a referral partner from the admin (referral partners
// upgrade, step 1, migration 0082; plan:
// Counselor Marking Co./referral-partners/upgrade-plan.md).
//
// - Owners and agency only (checked against admin_users, not just a valid
//   session). verify_jwt stays on.
// - Sent through the practice's own Resend key and verified domain
//   (NURTURE_RESEND_API_KEY / NURTURE_SENDER_EMAIL), from
//   "<Signer> at <Practice>". Replies go to the sender's own address or the
//   practice inbox (business.lead_notification_email), never to the
//   no-reply sending address. Replies don't come back into the platform yet:
//   that waits for a Resend upgrade (more than one inbound webhook) and the
//   HIPAA work.
// - Every sent email is saved on the partner's timeline
//   (referral_partner_activities, activity_type 'email') with its subject
//   and text. A failed send is not saved; the error goes back to the admin.
// - Looks like a note typed by a person, so Gmail files it under Primary,
//   not Promotions (Luke's live test 2026-11-19 landed in Promotions):
//   plain text only (no HTML part), and sent from a personal-looking address
//   on the practice's verified sending domain, built from the sender's first
//   name (luke@communications.example.org), never the automated no-reply
//   address. That address has no mailbox; Reply-To always carries the real
//   inbox.
// - Privacy: the admin shows a fixed reminder (no client names or details).
//   This function can't judge content, so it doesn't try.
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

// "Luke Burgett" -> "luke"; accents dropped, letters only. Empty when the
// name has no usable letters (then the practice's sending address is used).
const TITLES = new Set(['dr', 'rev', 'pastor', 'father', 'fr', 'mr', 'mrs', 'ms', 'mx', 'prof']);
function localPartFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = (TITLES.has((words[0] ?? '').toLowerCase().replace(/\./g, '')) && words[1] ? words[1] : words[0]) ?? '';
  return first
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, 30);
}

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const DAILY_LIMIT = 100;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Missing Authorization header' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await callerClient.auth.getUser();
  if (authError || !user) return jsonResponse({ error: 'Not signed in' }, 401);

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: caller } = await admin
    .from('admin_users')
    .select('role, status, email, display_name, linked_counselor_page_id')
    .eq('id', user.id)
    .maybeSingle();
  // Owners and the agency email any partner; a counselor (staff linked to a
  // counselor page) only the partners they own (step 8, migration 0090).
  const isAdmin = caller && (caller.role === 'owner' || caller.role === 'agency');
  const isCounselor = caller && caller.role === 'staff' && Boolean(caller.linked_counselor_page_id);
  if (!caller || caller.status !== 'active' || (!isAdmin && !isCounselor)) {
    return jsonResponse({ error: 'Only an owner, the agency or a counselor can email referral partners.' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }
  const partnerId = typeof body.partner_id === 'string' ? body.partner_id : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const text = typeof body.body === 'string' ? body.body.replace(/\r\n/g, '\n').trim() : '';
  const replyChoice = body.reply_to === 'practice' ? 'practice' : 'me';
  const signer = typeof body.signer === 'string' ? body.signer.trim().slice(0, 80) : '';
  // The sender's local date, so "today" on the timeline matches theirs.
  // Which kit message this was (step 6: the availability update is tracked
  // per partner). Known keys only.
  const templateKey = ['intro_email', 'follow_up_email', 'availability_update', 'blank'].includes(String(body.template_key)) ? String(body.template_key) : null;
  const localDate = typeof body.occurred_on === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.occurred_on) ? body.occurred_on : null;

  if (!partnerId) return jsonResponse({ error: 'partner_id is required' }, 400);
  if (!subject) return jsonResponse({ error: 'Add a subject.' }, 400);
  if (subject.length > 200) return jsonResponse({ error: 'The subject is too long (200 characters at most).' }, 400);
  if (!text) return jsonResponse({ error: 'The message is empty.' }, 400);
  if (text.length > 10000) return jsonResponse({ error: 'The message is too long.' }, 400);
  if (/\[[^\]\n]{1,80}\]/.test(subject + '\n' + text)) {
    return jsonResponse({ error: 'Finish the [bracketed] parts before sending.' }, 400);
  }

  const resendKey = Deno.env.get('NURTURE_RESEND_API_KEY');
  const senderEmail = Deno.env.get('NURTURE_SENDER_EMAIL');
  if (!resendKey || !senderEmail) {
    return jsonResponse({ error: 'Email sending isn\'t set up for this site yet (no verified sending domain).' }, 503);
  }

  const { data: partner } = await admin
    .from('referral_partners')
    .select('id, name, email, status, archived_at, owner_user_id')
    .eq('id', partnerId)
    .maybeSingle();
  if (!partner) return jsonResponse({ error: 'Partner not found.' }, 404);
  if (!isAdmin && partner.owner_user_id !== user.id) {
    return jsonResponse({ error: 'You can email only the partners you own.' }, 403);
  }
  // Step 7 (0089): send to one of the partner's other contacts when asked,
  // otherwise the main contact. A contact must belong to this partner.
  let to = (partner.email ?? '').trim();
  let contactName: string | null = null;
  const contactId = typeof body.contact_id === 'string' && body.contact_id ? body.contact_id : null;
  if (contactId) {
    const { data: contact } = await admin
      .from('referral_partner_contacts')
      .select('id, name, email, partner_id')
      .eq('id', contactId)
      .maybeSingle();
    if (!contact || contact.partner_id !== partner.id) return jsonResponse({ error: 'That contact is not on this partner.' }, 400);
    to = (contact.email ?? '').trim();
    contactName = contact.name;
  }
  if (!EMAIL_RE.test(to)) {
    return jsonResponse({ error: contactId ? 'Add a valid email address for this contact first.' : 'Add a valid email address for this partner first.' }, 400);
  }

  const { data: business } = await admin.from('business').select('display_name, lead_notification_email').maybeSingle();
  const practice = (business?.display_name ?? '').trim();
  const practiceInbox = (business?.lead_notification_email ?? '').split(',').map((s: string) => s.trim()).filter(Boolean)[0] ?? '';
  const replyTo = replyChoice === 'practice' ? practiceInbox || caller.email : caller.email || practiceInbox;

  // A guard against a runaway loop or a mistake, not a sending quota.
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await admin
    .from('referral_partner_activities')
    .select('id', { count: 'exact', head: true })
    .eq('activity_type', 'email')
    .not('resend_id', 'is', null)
    .gte('created_at', since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return jsonResponse({ error: `This site has sent ${DAILY_LIMIT} partner emails in the last day. Try again tomorrow.` }, 429);
  }

  const who = signer || (caller.display_name ?? '').trim();
  const fromName = (who && practice ? `${who} at ${practice}` : who || practice || '').replace(/["<>]/g, '');
  const sendingDomain = senderEmail.split('@')[1] ?? '';
  const local = localPartFor(who) || localPartFor(caller.display_name ?? '');
  const fromAddress = local && sendingDomain ? `${local}@${sendingDomain}` : senderEmail;
  const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
    }),
  });
  const sent = await res.json().catch(() => ({}));
  if (!res.ok || !sent?.id) {
    console.error('send-partner-email: Resend rejected the email', { status: res.status, body: sent });
    return jsonResponse({ error: `The email wasn't sent (${sent?.message ?? `error ${res.status}`}).` }, 502);
  }

  const { data: activity, error: logError } = await admin
    .from('referral_partner_activities')
    .insert({
      partner_id: partner.id,
      activity_type: 'email',
      occurred_on: localDate ?? new Date().toISOString().slice(0, 10),
      note: subject,
      subject,
      body: text,
      sent_to: to,
      resend_id: sent.id,
      created_by: user.id,
      ...(templateKey || contactName
        ? { detail: { ...(templateKey ? { template: templateKey } : {}), ...(contactName ? { contact: contactName } : {}) } }
        : {}),
    })
    .select()
    .single();
  if (logError) console.error('send-partner-email: sent but not logged', logError);

  // First outreach moves a prospect forward (same rule as logging by hand).
  let status = partner.status;
  if (partner.status === 'prospect') {
    const { error: stageError } = await callerClient.from('referral_partners').update({ status: 'contacted' }).eq('id', partner.id);
    if (!stageError) status = 'contacted';
  }

  return jsonResponse({ ok: true, activity: activity ?? null, status, reply_to: replyTo || null });
});
