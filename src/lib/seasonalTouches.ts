// Seasonal touches for referral partners (referral partners upgrade step 9,
// migration 0091). A small calendar of good reasons to be in touch, by
// partner type. When a touch is in season, the partners page and Today list
// the active partners it applies to; "Mark done" logs an activity with
// seasonal_key = `${key}-${year}` so each partner gets it once a year.
//
// Ethics: cards and notes only. Never a gift, fee or anything of value in
// exchange for referrals (ACA Code of Ethics A.10.b).

export type SeasonalTouch = {
  key: string;
  title: string; // short name, shown on Today
  why: string; // one line on the partners page
  // Month-day window, inclusive. A window never crosses New Year.
  start: [number, number];
  end: [number, number];
  // Partner categories it applies to; null = every type.
  categories: string[] | null;
  // How it's logged (an ACTIVITY_TYPES value).
  activityType: 'email' | 'visit' | 'materials' | 'thank_you';
  note: string; // saved as the activity note
};

export const SEASONAL_TOUCHES: SeasonalTouch[] = [
  {
    key: 'new-year',
    title: 'New year check-in',
    why: 'Doctors and employers plan for the year in January. A short note with who has openings keeps you top of mind.',
    start: [1, 2],
    end: [1, 31],
    categories: ['physician', 'pediatrician', 'employer', 'mental_health'],
    activityType: 'email',
    note: 'New year check-in (seasonal)',
  },
  {
    key: 'mental-health-month',
    title: 'Mental Health Awareness Month',
    why: "May is Mental Health Awareness Month: a natural reason to thank partners and remind them you're a resource.",
    start: [5, 1],
    end: [5, 31],
    categories: null,
    activityType: 'thank_you',
    note: 'Mental Health Awareness Month note (seasonal)',
  },
  {
    key: 'fall-ministry',
    title: 'Before fall ministry season',
    why: 'Churches plan small groups and care ministry for the fall over the summer. Offer counseling resources for their leaders.',
    start: [7, 15],
    end: [8, 31],
    categories: ['church'],
    activityType: 'email',
    note: 'Fall ministry season resources (seasonal)',
  },
  {
    key: 'back-to-school',
    title: 'Back to school',
    why: "Schools and pediatricians see the back-to-school stress first. A short note on how to refer students and families.",
    start: [8, 1],
    end: [9, 15],
    categories: ['school', 'pediatrician'],
    activityType: 'email',
    note: 'Back-to-school note (seasonal)',
  },
  {
    key: 'pastor-appreciation',
    title: 'Pastor Appreciation Month',
    why: 'October is Pastor Appreciation Month. A handwritten thank-you to the pastors who send people your way.',
    start: [10, 1],
    end: [10, 31],
    categories: ['church'],
    activityType: 'thank_you',
    note: 'Pastor Appreciation Month thank-you (seasonal)',
  },
  {
    key: 'holiday-card',
    title: 'Holiday cards',
    why: 'A holiday card thanks every active partner, and the holidays are hard for many people: mention you can help with grief and stress.',
    start: [11, 15],
    end: [12, 20],
    categories: null,
    activityType: 'thank_you',
    note: 'Holiday card (seasonal)',
  },
];

const md = (d: Date) => (d.getMonth() + 1) * 100 + d.getDate();

/** Touches in season on this date. */
export function touchesInSeason(today: Date = new Date()): SeasonalTouch[] {
  const now = md(today);
  return SEASONAL_TOUCHES.filter((t) => now >= t.start[0] * 100 + t.start[1] && now <= t.end[0] * 100 + t.end[1]);
}

/** The key a done touch is logged under this year, e.g. 'holiday-card-2026'. */
export function seasonalKey(touch: SeasonalTouch, today: Date = new Date()): string {
  return `${touch.key}-${today.getFullYear()}`;
}

/** Does this touch apply to a partner of this type? */
export function touchAppliesTo(touch: SeasonalTouch, category: string): boolean {
  return !touch.categories || touch.categories.includes(category);
}

/** Days left in the touch's window (0 on its last day). */
export function daysLeft(touch: SeasonalTouch, today: Date = new Date()): number {
  const end = new Date(today.getFullYear(), touch.end[0] - 1, touch.end[1]);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}
