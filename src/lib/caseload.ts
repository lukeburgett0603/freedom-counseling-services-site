// Shared caseload math for Counselor settings and the Caseload dashboard.
// See 0066_caseload_tracking.sql for why the target caseload is derived
// here rather than stored.

// Caseload is bigger than weekly sessions because some clients come
// biweekly or monthly, and some sessions get cancelled. The default "full"
// is the weekly target x 2.0 (raised from 1.5 by Luke, 2026-11-20); each
// counselor can set their own number instead (counselor_caseload.full_caseload,
// migration 0088), since client mixes differ a lot between counselors.
export const CASELOAD_MULTIPLIER = 2;

export const WEEKLY_TARGET_GUIDANCE =
  'Most full-time counselors see 16 to 30 clients a week, and 20 is typical.';

// At or above this share of a full caseload, nudge "Accepting New
// Clients" toward "Almost Full" on Counselor settings.
export const ALMOST_FULL_THRESHOLD = 0.9;

export type CounselorCaseload = {
  counselor_page_id: string;
  weekly_client_target: number | null;
  current_active_clients: number | null;
  // The counselor's own "full" number (0088). Null: weekly target x default.
  full_caseload?: number | null;
  updated_at: string;
};

// A counselor's full caseload: their own number when they've set one,
// otherwise the weekly target x the default multiplier.
export function targetCaseload(weeklyClientTarget: number | null | undefined, fullCaseload?: number | null): number | null {
  if (fullCaseload && fullCaseload > 0) return fullCaseload;
  if (!weeklyClientTarget || weeklyClientTarget <= 0) return null;
  return Math.round(weeklyClientTarget * CASELOAD_MULTIPLIER);
}

// The default only (what "full" would be without the counselor's own number).
export function defaultCaseload(weeklyClientTarget: number | null | undefined): number | null {
  return targetCaseload(weeklyClientTarget, null);
}

// Percent full, capped at 100 for bar widths. Over-capacity is still
// reported honestly by callers via openSpots going negative.
export function percentFull(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

// Color bands for a caseload bar: plenty of room / getting close / full.
export function caseloadBarClass(current: number, target: number): string {
  const ratio = target > 0 ? current / target : 0;
  if (ratio >= 1) return 'bg-emerald-600';
  if (ratio >= ALMOST_FULL_THRESHOLD) return 'bg-emerald-500';
  if (ratio >= 0.6) return 'bg-amber-500';
  return 'bg-brand-accent';
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}
