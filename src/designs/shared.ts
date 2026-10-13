// Helpers every v2 design shares: counselor cards, the published rate
// range, counselor options for the request form. Derived from the
// Counselor Profile pages, never typed into a page's text, so a new
// counselor or a rate change shows up everywhere at once.
import type { Page, ImageSlot } from '../lib/pages';
import { readText, type BlockValues } from '../lib/blocks';
import { withBase } from '../lib/url';

export interface PersonCard {
  name: string;
  credential: string;
  summary: string;
  rate: number | null;
  href: string;
  photo: ImageSlot | null;
}

export function counselorPages(allPages: Page[]): Page[] {
  return allPages.filter((p) => p.page_type === 'Counselor Profile').sort((a, b) => a.nav_order - b.nav_order);
}

// "LCSW, Owner and Director" / "Student Counselor, supervised by ..."
export function credentialLine(p: Page): string {
  return [p.credentials, p.professional_title].filter(Boolean).join(', ');
}

// Each counselor's one-line "who they help" lives on their own profile
// as the `card.summary` block, so editing it there updates every card.
// `card.credential` overrides the displayed credential line when the
// approved wording isn't just the schema fields ("Student Counselor,
// supervised by Tony Gore, LCSW"), keeping credentials/professional_title
// accurate for structured data (honorificSuffix / jobTitle).
export function personCards(allPages: Page[], allBlocks: Map<string, BlockValues>): PersonCard[] {
  return counselorPages(allPages).map((p) => ({
    name: p.title,
    credential: readText(allBlocks.get(p.id) ?? new Map(), [], 'card.credential') || credentialLine(p),
    summary: readText(allBlocks.get(p.id) ?? new Map(), [], 'card.summary'),
    rate: p.session_rate_usd,
    href: withBase(`/${p.slug}`),
    photo: p.images.headshot ?? null,
  }));
}

// "$50 to $160" (or "$115" when everyone charges the same), or null when
// no rates are published.
export function rateRange(allPages: Page[]): string | null {
  const rates = counselorPages(allPages).map((p) => p.session_rate_usd).filter((r): r is number => r !== null);
  if (!rates.length) return null;
  const lo = Math.min(...rates);
  const hi = Math.max(...rates);
  return lo === hi ? `$${lo}` : `$${lo} to $${hi}`;
}

export function counselorOptions(allPages: Page[]): { id: string; title: string }[] {
  return counselorPages(allPages).map((p) => ({ id: p.id, title: p.title }));
}

// Replaces {rate_range} and {phone} in block text, so copy like
// "Sessions are {rate_range}" stays true when a rate changes.
export function fill(text: string, vars: Record<string, string | null | undefined>): string {
  return text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
}

// Articles in a service's category (the service page's own `category`),
// newest first: the "Related articles" list builds itself as posts are
// published.
export function relatedArticles(allPages: Page[], category: string | null, limit = 4) {
  if (!category) return [];
  return allPages
    .filter((p) => p.page_type === 'Blog Post' && p.category === category)
    .sort((a, b) => (b.date_published ?? '').localeCompare(a.date_published ?? ''))
    .slice(0, limit)
    .map((p) => ({ title: p.h1 || p.title, href: withBase(`/${p.slug}`), meta: p.author_name ? `By ${p.author_name}` : undefined }));
}

// A service page lists its counselors with service-specific wording
// (block list `team.items`: {slug, text}); photo, credential line and
// rate still come from each counselor's own page.
export function teamCards(
  items: { slug: string; text: string }[],
  allPages: Page[],
  allBlocks: Map<string, BlockValues>,
): PersonCard[] {
  const all = personCards(allPages, allBlocks);
  return items
    .map((i) => {
      const card = all.find((c) => c.href === withBase(`/${i.slug}`));
      return card ? { ...card, summary: i.text || card.summary } : null;
    })
    .filter((c): c is PersonCard => c !== null);
}

export function rangeOf(cards: PersonCard[]): string | null {
  const rates = cards.map((c) => c.rate).filter((r): r is number => r !== null);
  if (!rates.length) return null;
  const lo = Math.min(...rates);
  const hi = Math.max(...rates);
  return lo === hi ? `$${lo}` : `$${lo} to $${hi}`;
}
