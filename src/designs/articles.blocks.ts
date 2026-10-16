// Articles (Blog Index) design (articles.astro), e.g. /blog.
import { defineBlocks } from '../lib/blocks';

export const ARTICLES_BLOCKS = defineBlocks([
  { section: 'Featured article', key: 'featured.slug', label: 'Article to feature (its address, like what-emdr-actually-feels-like)', kind: 'text', fallback: '', help: 'Leave blank to feature the newest article.' },
]);
