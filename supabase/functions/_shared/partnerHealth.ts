// Rhythm and going-cold rules for referral partners (referral partners
// upgrade steps 2 and 5). ONE copy, shared by the admin (re-exported from
// src/lib/referralPartners.ts) and Edge Functions (send-partner-digest), so
// the partners page, Today and the weekly email always agree. Plain
// TypeScript with no imports, so both Astro and Deno can load it.

export type PartnerForHealth = {
  status: string;
  archived_at: string | null;
  created_at?: string;
  priority?: string | null;
};
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
  partner: PartnerForHealth,
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
