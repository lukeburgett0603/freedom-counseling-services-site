// Site system v2: page text stored by named block (content_blocks,
// migration 0078). A v2 page design (src/designs/) declares the blocks it
// reads in a sibling `*.blocks.ts` file; this module loads the values at
// build time and gives the design typed accessors. Plain .ts (no Astro
// imports) so the admin's client-side editor can import the same
// definitions.
import { supabase } from './supabase';
import type { ImageSlot } from './pages';

export type BlockKind = 'text' | 'rich' | 'list' | 'image';

// One field of a list item (e.g. a "what brings you here" line has a
// quote, a label, and a link).
export interface ListFieldDef {
  key: string;
  label: string;
  kind: 'text' | 'rich' | 'link';
  help?: string;
}

export interface BlockDef {
  key: string;
  label: string;
  kind: BlockKind;
  // Shown under the field in the admin: what the text is for, and any
  // length guidance from the design ("about 20 words").
  help?: string;
  // Soft limit the admin warns past (characters). Designs are tuned to
  // the approved copy; much longer text can break a layout.
  maxLength?: number;
  // Admin grouping, usually the page section ("Hero", "Faith").
  section: string;
  // list only
  fields?: ListFieldDef[];
  // Rendered when no value is stored yet. Real page text belongs in the
  // database (seeded from content/blocks/<slug>.json), not here; this is
  // only for text that's the same on every site ("Request an appointment").
  fallback?: unknown;
}

export type ListItem = Record<string, string>;
export type BlockValues = Map<string, unknown>;

export function defineBlocks<T extends BlockDef[]>(defs: T): T {
  return defs;
}

let allBlocks: Map<string, BlockValues> | null = null;

// One query per build, grouped by page, instead of one per page.
export async function loadAllBlocks(): Promise<Map<string, BlockValues>> {
  if (allBlocks) return allBlocks;
  const { data, error } = await supabase.from('content_blocks').select('page_id, block_key, value');
  if (error) throw new Error(`content_blocks: ${error.message}`);
  const grouped = new Map<string, BlockValues>();
  for (const row of data ?? []) {
    if (!grouped.has(row.page_id)) grouped.set(row.page_id, new Map());
    grouped.get(row.page_id)!.set(row.block_key, row.value);
  }
  allBlocks = grouped;
  return grouped;
}

export async function getPageBlocks(pageId: string): Promise<BlockValues> {
  return (await loadAllBlocks()).get(pageId) ?? new Map();
}

// Typed reads with the definition's fallback. A missing required block
// renders as empty (sections hide themselves when their text is empty)
// and is listed by `missingBlocks` so the build log says what to seed.
export function readText(values: BlockValues, defs: BlockDef[], key: string): string {
  const v = values.get(key) ?? defs.find((d) => d.key === key)?.fallback;
  return typeof v === 'string' ? v : '';
}

export function readList(values: BlockValues, defs: BlockDef[], key: string): ListItem[] {
  const v = values.get(key) ?? defs.find((d) => d.key === key)?.fallback;
  return Array.isArray(v) ? (v as ListItem[]) : [];
}

export function readImage(values: BlockValues, defs: BlockDef[], key: string): ImageSlot | null {
  const v = (values.get(key) ?? defs.find((d) => d.key === key)?.fallback) as ImageSlot | undefined;
  return v && typeof v.url === 'string' && v.url ? v : null;
}

// A reader bound to one page, so designs write `t('hero.subhead')`.
export function blockReader(values: BlockValues, defs: BlockDef[]) {
  return {
    t: (key: string) => readText(values, defs, key),
    list: (key: string) => readList(values, defs, key),
    image: (key: string) => readImage(values, defs, key),
  };
}

export function missingBlocks(values: BlockValues, defs: BlockDef[]): string[] {
  return defs.filter((d) => d.fallback === undefined && !values.has(d.key)).map((d) => d.key);
}
