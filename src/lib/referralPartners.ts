// Shared vocabulary for the referral partner tracker
// (admin/referral-partners.astro) and the Lead CRM's partner link. See
// 0068_referral_partners.sql — these lists must match its CHECK constraints.

export const PARTNER_CATEGORIES = [
  { value: 'physician', label: 'Doctor / primary care' },
  { value: 'pediatrician', label: 'Pediatrician' },
  { value: 'mental_health', label: 'Psychiatrist / other therapist' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'church', label: 'Church / pastor' },
  { value: 'school', label: 'School' },
  { value: 'employer', label: 'Employer / EAP' },
  { value: 'other_professional', label: 'Other professional' },
  { value: 'other', label: 'Other' },
] as const;

export const PARTNER_STATUSES = [
  { value: 'prospect', label: 'Prospect', classes: 'border-slate-300 bg-white text-slate-700' },
  { value: 'contacted', label: 'Contacted', classes: 'border-amber-300 bg-amber-50 text-amber-800' },
  { value: 'meeting', label: 'Meeting set', classes: 'border-sky-300 bg-sky-50 text-sky-800' },
  { value: 'active', label: 'Active partner', classes: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { value: 'inactive', label: 'Inactive', classes: 'border-slate-200 bg-slate-50 text-slate-500' },
] as const;

export const ACTIVITY_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'call', label: 'Call' },
  { value: 'visit', label: 'Dropped by' },
  { value: 'meeting', label: 'Meeting / lunch' },
  { value: 'materials', label: 'Sent materials' },
  { value: 'thank_you', label: 'Thank-you note' },
  { value: 'note', label: 'Note' },
] as const;

const CATEGORY_LABELS = new Map<string, string>(PARTNER_CATEGORIES.map((c) => [c.value, c.label]));
const STATUS_LABELS = new Map<string, string>(PARTNER_STATUSES.map((s) => [s.value, s.label]));
const STATUS_CLASSES = new Map<string, string>(PARTNER_STATUSES.map((s) => [s.value, s.classes]));
// 'reply' (They replied) and 'stage' (written by trigger) aren't in the
// manual log form but still need labels on the timeline (0082).
const ACTIVITY_LABELS = new Map<string, string>([
  ...ACTIVITY_TYPES.map((a) => [a.value, a.label] as [string, string]),
  ['reply', 'They replied'],
  ['stage', 'Stage changed'],
]);

export const categoryLabel = (v: string) => CATEGORY_LABELS.get(v) ?? v;
export const partnerStatusLabel = (v: string) => STATUS_LABELS.get(v) ?? v;
export const partnerStatusClasses = (v: string) => STATUS_CLASSES.get(v) ?? STATUS_CLASSES.get('prospect')!;
export const activityLabel = (v: string) => ACTIVITY_LABELS.get(v) ?? v;

export type ReferralPartner = {
  id: string;
  created_at: string;
  name: string;
  category: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  status: string;
  next_follow_up: string | null;
  notes: string | null;
  archived_at: string | null;
  priority?: string | null; // 0083
  ref_code?: string | null; // 0084: referral link code (?ref=)
};

export type PartnerActivity = {
  id: string;
  partner_id: string;
  activity_type: string;
  occurred_on: string;
  note: string | null;
  created_at: string;
  // Sent from the admin (0082): subject, text and who it went to.
  subject?: string | null;
  body?: string | null;
  sent_to?: string | null;
  // A stage change (0082): {"from": "prospect", "to": "contacted"}.
  detail?: { from?: string; to?: string } | null;
};

// ---------------------------------------------------------------------
// Rhythm and going cold (referral partners upgrade step 2, migration 0083).
// One set of rules for the partners page and Today.
// ---------------------------------------------------------------------

export const PARTNER_PRIORITIES = [
  { value: 'key', label: 'Key', days: 30, hint: 'Every 30 days' },
  { value: 'regular', label: 'Regular', days: 60, hint: 'Every 60 days' },
  { value: 'occasional', label: 'Occasional', days: 90, hint: 'Every 90 days' },
] as const;

const PRIORITY_DAYS = new Map<string, number>(PARTNER_PRIORITIES.map((p) => [p.value, p.days]));
const PRIORITY_LABELS = new Map<string, string>(PARTNER_PRIORITIES.map((p) => [p.value, p.label]));
export const priorityLabel = (v: string | null | undefined) => PRIORITY_LABELS.get(v ?? 'regular') ?? 'Regular';
export const rhythmDays = (v: string | null | undefined) => PRIORITY_DAYS.get(v ?? 'regular') ?? 60;

// A row of the referral_partner_health view.
export type PartnerHealthRow = {
  partner_id: string;
  last_contact_on: string | null;
  referral_count: number;
  first_referral_at: string | null;
  last_referral_at: string | null;
  first_contact_on?: string | null; // 0085
};

export type PartnerHealth = {
  lastContact: string | null; // YYYY-MM-DD
  daysSinceContact: number | null;
  rhythm: number;
  // ok: in rhythm. due: time for a touch. cold: well past it.
  // none: not an active partner, so no rhythm applies.
  state: 'ok' | 'due' | 'cold' | 'none';
  nextTouchBy: string | null; // YYYY-MM-DD
  // Used to refer and has gone well past their usual gap.
  stoppedReferring: { daysSince: number; usualGap: number } | null;
};

const DAY_MS = 86_400_000;
const COLD_FACTOR = 1.5;
const STOPPED_MIN_DAYS = 60;

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function localDay(value: string): Date {
  // A plain date (YYYY-MM-DD) is a local calendar day; a timestamp is an instant.
  if (value.length <= 10) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const t = new Date(value);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export function partnerHealth(
  partner: Pick<ReferralPartner, 'status' | 'archived_at' | 'created_at'> & { priority?: string | null },
  row: PartnerHealthRow | undefined,
  now: Date = new Date()
): PartnerHealth {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rhythm = rhythmDays(partner.priority);
  const lastContact = row?.last_contact_on ?? null;
  const daysSinceContact = lastContact ? daysBetween(localDay(lastContact), today) : null;
  const active = partner.status === 'active' && !partner.archived_at;

  let state: PartnerHealth['state'] = 'none';
  let nextTouchBy: string | null = null;
  if (active) {
    if (daysSinceContact === null) {
      state = 'due';
      nextTouchBy = ymd(today);
    } else {
      const next = localDay(lastContact!);
      next.setDate(next.getDate() + rhythm);
      nextTouchBy = ymd(next);
      state = daysSinceContact >= rhythm * COLD_FACTOR ? 'cold' : daysSinceContact >= rhythm ? 'due' : 'ok';
    }
  }

  // Stopped referring: needs at least two referrals to know their usual
  // gap; flagged past twice that gap (and never sooner than 60 days).
  let stoppedReferring: PartnerHealth['stoppedReferring'] = null;
  const count = Number(row?.referral_count ?? 0);
  if (active && count >= 2 && row?.first_referral_at && row.last_referral_at) {
    const span = daysBetween(localDay(row.first_referral_at), localDay(row.last_referral_at));
    const usualGap = Math.max(1, Math.round(span / (count - 1)));
    const daysSince = daysBetween(localDay(row.last_referral_at), today);
    if (daysSince > Math.max(usualGap * 2, STOPPED_MIN_DAYS)) stoppedReferring = { daysSince, usualGap };
  }

  return { lastContact, daysSinceContact, rhythm, state, nextTouchBy, stoppedReferring };
}
