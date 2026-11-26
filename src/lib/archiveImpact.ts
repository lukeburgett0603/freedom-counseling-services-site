// What archiving a counselor (migration 0092) does to the public site,
// worked out before anything changes, for the admin's archive screen.
// Plain functions over page rows and text blocks, so the same rules run
// in the browser and in a quick check from the command line.
//
// Automatic (the build does it): their profile comes down, and every
// derived section drops them (cards, service teams, fees, rate range,
// request form, structured data); links to their page are unlinked.
// Not automatic: sentences that name them, and prices typed as numbers.
// Those are listed here for the practice to rewrite.

export interface ImpactPage {
  id: string;
  slug: string;
  title: string;
  page_type: string;
  status: string;
  session_rate_usd: number | null;
  author_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  copy: string | null;
  faqs: { question: string; answer: string }[] | null;
}

export interface ImpactBlock {
  page_id: string;
  block_key: string;
  value: unknown;
}

export interface ServiceImpact {
  page: ImpactPage;
  // Remaining counselors listed for this service, by page title.
  others: string[];
}

export interface Mention {
  page: ImpactPage;
  // Where on the page: "Page text: sections", "FAQ", "Search description".
  where: string;
  // The editor that holds it.
  editor: 'page-text' | 'page-copy' | 'blog';
  snippet: string;
  // What was found: their name or a link to them, a price typed as a
  // number (their rate), or the team size typed as a word ("six counselors").
  kind: 'name' | 'price' | 'count';
}

export interface ArchiveImpact {
  counselor: ImpactPage;
  services: ServiceImpact[];
  soleServices: ServiceImpact[];
  rateBefore: string | null;
  rateAfter: string | null;
  posts: ImpactPage[];
  mentions: Mention[];
  remaining: number;
}

const SERVICE_TYPES = ['Service Hub', 'Service Page'];

export function rangeText(rates: (number | null)[]): string | null {
  const r = rates.filter((x): x is number => typeof x === 'number');
  if (!r.length) return null;
  const lo = Math.min(...r);
  const hi = Math.max(...r);
  return lo === hi ? `$${lo}` : `$${lo} to $${hi}`;
}

function teamSlugs(blocks: ImpactBlock[], pageId: string): string[] {
  const b = blocks.find((x) => x.page_id === pageId && x.block_key === 'team.items');
  return Array.isArray(b?.value) ? (b!.value as { slug?: string }[]).map((i) => i.slug ?? '').filter(Boolean) : [];
}

// Every string inside a block value (text, or list items' fields), with
// a label for where it sits.
function strings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

function snippetAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 70);
  const end = Math.min(text.length, index + length + 70);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export function archiveImpact(pages: ImpactPage[], blocks: ImpactBlock[], counselorId: string): ArchiveImpact {
  const counselor = pages.find((p) => p.id === counselorId);
  if (!counselor) throw new Error('Counselor not found');
  const live = pages.filter((p) => p.status === 'content-complete');
  const team = live.filter((p) => p.page_type === 'Counselor Profile');
  const stays = team.filter((p) => p.id !== counselorId);
  const staySlugs = new Map(stays.map((p) => [p.slug, p.title]));

  const services: ServiceImpact[] = [];
  const soleServices: ServiceImpact[] = [];
  for (const page of live.filter((p) => SERVICE_TYPES.includes(p.page_type))) {
    const slugs = teamSlugs(blocks, page.id);
    if (!slugs.includes(counselor.slug)) continue;
    const others = slugs.filter((s) => staySlugs.has(s)).map((s) => staySlugs.get(s)!);
    (others.length ? services : soleServices).push({ page, others });
  }

  // Text that names them or links to them, on pages that stay up (their
  // own page and anything coming down with them don't count).
  const gone = new Set([counselorId, ...soleServices.map((s) => s.page.id)]);
  const first = counselor.title.split(' ')[0];
  const nameRe = new RegExp(`\\b(${escapeRe(counselor.title)}|${escapeRe(first)})\\b|/${escapeRe(counselor.slug)}\\b`, 'g');
  // Their rate as a typed number counts only when nobody staying charges it.
  const rate = counselor.session_rate_usd;
  const priceRe = rate !== null && !stays.some((p) => p.session_rate_usd === rate) ? new RegExp(`\\$${rate}(?![0-9])`, 'g') : null;

  // The team size typed as a word or number ("six counselors"), which
  // {counselor_count} keeps current instead.
  const n = team.length;
  const countRe = new RegExp(`\\b(${NUMBER_WORDS[n] ?? n}|${n})\\s+(counselors|therapists|clinicians)\\b`, 'gi');

  const mentions: Mention[] = [];
  const scan = (page: ImpactPage, where: string, editor: Mention['editor'], text: string | null) => {
    if (!text) return;
    const checks: [Mention['kind'], RegExp | null][] = [['name', nameRe], ['price', priceRe], ['count', countRe]];
    for (const [kind, re] of checks) {
      if (!re) continue;
      const m = [...text.matchAll(re)][0];
      if (m) mentions.push({ page, where, editor, kind, snippet: snippetAround(text, m.index ?? 0, m[0].length) });
    }
  };

  for (const page of live) {
    if (gone.has(page.id)) continue;
    const isPost = page.page_type === 'Blog Post';
    // Posts they wrote keep their own words; others' posts are checked.
    if (isPost && page.author_name?.trim().toLowerCase() === counselor.title.trim().toLowerCase()) continue;
    for (const b of blocks.filter((x) => x.page_id === page.id)) {
      // Their entry on a service team list comes off by itself; the other
      // counselors' entries are still checked.
      const value = b.block_key === 'team.items' && Array.isArray(b.value)
        ? (b.value as { slug?: string }[]).filter((i) => i.slug !== counselor.slug)
        : b.value;
      for (const s of strings(value)) scan(page, `Page text: ${b.block_key}${s.path ? ` ${s.path}` : ''}`, 'page-text', s.text);
    }
    scan(page, 'Search title', 'page-copy', page.meta_title);
    scan(page, 'Search description', 'page-copy', page.meta_description);
    scan(page, 'Headline', 'page-copy', page.h1);
    for (const f of page.faqs ?? []) scan(page, `FAQ: ${f.question}`, 'page-copy', `${f.question} ${f.answer}`);
    scan(page, isPost ? 'Post text' : 'Page body', isPost ? 'blog' : 'page-copy', page.copy);
  }

  const posts = live.filter(
    (p) => p.page_type === 'Blog Post' && p.author_name?.trim().toLowerCase() === counselor.title.trim().toLowerCase(),
  );

  return {
    counselor,
    services,
    soleServices,
    rateBefore: rangeText(team.map((p) => p.session_rate_usd)),
    rateAfter: rangeText(stays.map((p) => p.session_rate_usd)),
    posts,
    mentions,
    remaining: stays.length,
  };
}
