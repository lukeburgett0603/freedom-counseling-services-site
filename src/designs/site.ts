// Site system v2: which pages use a v2 design, per client. Plain .ts (no
// .astro imports) so the admin can read it too. See README.md here.
//
// A page uses a design when its slug is in DESIGN_BY_SLUG, or else its
// page_type is in DESIGN_BY_PAGE_TYPE. Everything else keeps rendering
// with the older templates (src/templates/), unchanged. The template
// ships with v2 off; a client turns it on page by page.
import type { Page, PageType } from '../lib/pages';
import type { BlockDef } from '../lib/blocks';
import { HOME_BLOCKS } from './home.blocks';
import { SERVICE_BLOCKS } from './service.blocks';
import { PAGE_BLOCKS } from './page.blocks';
import { PROFILE_BLOCKS } from './profile.blocks';
import { CONTACT_BLOCKS } from './contact.blocks';
import { ARTICLE_BLOCKS } from './article.blocks';
import { ARTICLES_BLOCKS } from './articles.blocks';

export const DESIGN_BY_PAGE_TYPE: Partial<Record<PageType, string>> = {
  Homepage: 'home',
  'Service Hub': 'service',
  'Services Overview': 'page',
  'Service Areas Overview': 'page',
  'Service Area': 'page',
  'Counselors Overview': 'page',
  'Counselor Profile': 'profile',
  About: 'page',
  Contact: 'contact',
  'Blog Post': 'article',
  'Blog Index': 'articles',
  Other: 'legal',
};

export const DESIGN_BY_SLUG: Record<string, string> = {
  fees: 'page',
};

// Every design's block definitions, by design id.
export const DESIGN_BLOCKS: Record<string, BlockDef[]> = {
  home: HOME_BLOCKS,
  service: SERVICE_BLOCKS,
  page: PAGE_BLOCKS,
  profile: PROFILE_BLOCKS,
  contact: CONTACT_BLOCKS,
  article: ARTICLE_BLOCKS,
  articles: ARTICLES_BLOCKS,
  legal: [],
};

// Services menu in two groups (Luke, 2026-10-13).
export const MENU_GROUPS: Record<string, { label: string; slugs: string[] }[]> = {
  services: [
    {
      label: "What you're facing",
      slugs: [
        'individual-counseling', 'couples-marriage-counseling', 'family-counseling', 'child-teen-counseling',
        'christian-counseling', 'counseling-for-pastors', 'grief-counseling', 'anxiety-depression-counseling', 'depression-counseling',
        'ocd-treatment', 'porn-addiction-counseling', 'trauma-counseling',
      ],
    },
    { label: 'Approaches', slugs: ['trauma-emdr-counseling', 'cbt-therapy', 'act-therapy', 'dbt-therapy', 'ifs-therapy'] },
  ],
};

// Self-hosted font files to preload (paths under public/), from theme.css.
// Preload only the one or two weights used above the fold.
export const THEME_FONT_PRELOADS: string[] = ['/fonts/figtree-latin.woff2'];

export function designIdFor(page: Pick<Page, 'slug' | 'page_type'>): string | null {
  return DESIGN_BY_SLUG[page.slug] ?? DESIGN_BY_PAGE_TYPE[page.page_type] ?? null;
}

export function blocksFor(page: Pick<Page, 'slug' | 'page_type'>): BlockDef[] {
  const id = designIdFor(page);
  return id ? DESIGN_BLOCKS[id] ?? [] : [];
}
