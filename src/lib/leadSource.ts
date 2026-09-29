// "How did you hear about us?" — shared by the public lead form
// (LeadGenerator.astro), the Lead CRM, and the Leads/Caseload dashboards,
// so every surface uses the same values and labels. See
// 0067_lead_source_and_response_time.sql.
//
// Grouped by the Full Caseload System step each source proves: search and
// maps are "Get Found", professional/church referrals are "Get Referred".
// submit-lead keeps its own copy of the value list (Deno can't import from
// src/) — add a new option in both places.

export const LEAD_SOURCES = [
  { value: 'google_search', label: 'Google search' },
  { value: 'google_maps', label: 'Google Maps' },
  { value: 'ai_assistant', label: 'ChatGPT or another AI assistant' },
  { value: 'directory', label: 'Psychology Today or another directory' },
  { value: 'insurance', label: 'My insurance company' },
  { value: 'doctor', label: 'My doctor or another healthcare provider' },
  { value: 'professional', label: 'An attorney or other professional' },
  { value: 'church', label: 'My church or pastor' },
  { value: 'friend_family', label: 'A friend or family member' },
  { value: 'social_media', label: 'Social media' },
  { value: 'other', label: 'Other' },
] as const;

// Sources where "who referred you?" is worth asking, and where a lead can
// be linked to a tracked referral partner.
export const REFERRAL_LEAD_SOURCES: readonly string[] = ['doctor', 'professional', 'church'];

const LABELS = new Map<string, string>(LEAD_SOURCES.map((s) => [s.value, s.label]));

export function leadSourceLabel(value: string | null | undefined): string {
  if (!value) return 'Not answered';
  return LABELS.get(value) ?? value;
}

// Shorter labels for dashboard bar lists, where the visitor-facing
// phrasing ("My church or pastor") reads oddly.
const SHORT_LABELS: Record<string, string> = {
  google_search: 'Google search',
  google_maps: 'Google Maps',
  ai_assistant: 'AI assistant',
  directory: 'Directory',
  insurance: 'Insurance',
  doctor: 'Doctor / healthcare',
  professional: 'Attorney / professional',
  church: 'Church / pastor',
  friend_family: 'Friend or family',
  social_media: 'Social media',
  other: 'Other',
};

export function leadSourceShortLabel(value: string | null | undefined): string {
  if (!value) return 'Not answered';
  return SHORT_LABELS[value] ?? value;
}

// Renders a "count per source" bar list, same visual as the Leads
// dashboard's existing "Leads by page" list.
export function renderSourceBars(values: (string | null)[], emptyText: string): string {
  if (values.length === 0) return `<p class="text-slate-500">${emptyText}</p>`;
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = v ?? '';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = sorted[0][1];
  return sorted
    .map(
      ([value, count]) => `
      <div class="flex items-center gap-3">
        <span class="w-40 shrink-0 truncate ${value ? 'text-slate-700' : 'text-slate-400'}">${leadSourceShortLabel(value || null)}</span>
        <div class="h-2 flex-1 rounded-full bg-slate-100">
          <div class="h-2 rounded-full bg-brand-accent" style="width: ${Math.round((count / max) * 100)}%"></div>
        </div>
        <span class="w-6 shrink-0 text-right font-semibold text-brand-ink">${count}</span>
      </div>`
    )
    .join('');
}

// Speed to lead: hours from form submission to the lead first leaving
// `new` in the CRM (first_contacted_at). Manually added leads are excluded
// by callers, since they're logged after contact has already happened.
export function hoursToFirstContact(createdAt: string, firstContactedAt: string): number {
  return (new Date(firstContactedAt).getTime() - new Date(createdAt).getTime()) / 3_600_000;
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} hrs`;
  return `${Math.round(hours / 24)} days`;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
