// Plain-language opening hours from business.opening_hours (schema.org
// OpeningHoursSpecification objects, the same value the structured data
// uses), so the visible hours and Google's hours can't disagree.
// "Monday to Thursday, 8 am to 5 pm" / "Friday, 8 am to 12 pm".

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Spec {
  dayOfWeek?: string | string[];
  opens?: string;
  closes?: string;
}

function dayName(d: string): string {
  return d.replace(/^https?:\/\/schema\.org\//, '');
}

function time(t: string): string {
  const [hRaw, m] = t.split(':').map(Number);
  const h = hRaw % 24;
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
}

export function formatHours(openingHours: unknown): string[] {
  const specs = (Array.isArray(openingHours) ? openingHours : []) as Spec[];
  const byDay = new Map<string, string>();
  for (const s of specs) {
    if (!s.opens || !s.closes) continue;
    const days = Array.isArray(s.dayOfWeek) ? s.dayOfWeek : s.dayOfWeek ? [s.dayOfWeek] : [];
    for (const d of days) byDay.set(dayName(d), `${time(s.opens)} to ${time(s.closes)}`);
  }
  // Group consecutive days with the same hours.
  const lines: string[] = [];
  let i = 0;
  while (i < DAYS.length) {
    const hours = byDay.get(DAYS[i]);
    if (!hours) { i++; continue; }
    let j = i;
    while (j + 1 < DAYS.length && byDay.get(DAYS[j + 1]) === hours) j++;
    const label = j === i ? DAYS[i] : j === i + 1 ? `${DAYS[i]} and ${DAYS[j]}` : `${DAYS[i]} to ${DAYS[j]}`;
    lines.push(`${label}, ${hours}`);
    i = j + 1;
  }
  return lines;
}

export function fullAddress(b: { street_address: string | null; street_address_2: string | null; address_locality: string | null; address_region: string | null; postal_code: string | null }): string | null {
  const street = [b.street_address, b.street_address_2].filter(Boolean).join(', ');
  if (!street) return null;
  return `${street}, ${b.address_locality ?? ''}, ${b.address_region ?? ''} ${b.postal_code ?? ''}`.replace(/\s+,/g, ',').trim();
}
