// Counselor profile design (profile.astro), e.g. /tony-gore. Name,
// credentials, headshot, rate, availability, and telehealth come from
// the page itself (Counselor settings), so they're edited there.
import { defineBlocks } from '../lib/blocks';

export const PROFILE_BLOCKS = defineBlocks([
  { section: 'Card on other pages', key: 'card.credential', label: 'Credential line on cards', kind: 'text', fallback: '', help: 'Blank uses the credentials field.' },
  { section: 'Card on other pages', key: 'card.summary', label: 'Who they help (one line, for cards)', kind: 'text', maxLength: 90 },
  { section: 'Top of page', key: 'hero.eyebrow', label: 'Small label above the name', kind: 'text', fallback: '' },
  { section: 'Top of page', key: 'hero.subhead', label: 'Who they help (a sentence or two)', kind: 'text', maxLength: 260 },
  { section: 'Their words', key: 'quote', label: 'A sentence in their own words', kind: 'text', maxLength: 200 },
  { section: 'Specialties and approaches', key: 'specialties', label: 'Specialties', kind: 'list', fields: [{ key: 'text', label: 'Specialty', kind: 'text' }] },
  { section: 'Specialties and approaches', key: 'approaches', label: 'Approaches', kind: 'list', fallback: [], fields: [{ key: 'text', label: 'Approach', kind: 'text' }] },
  { section: 'Main sections', key: 'sections', label: 'Sections, in order', kind: 'list', fields: [{ key: 'heading', label: 'Heading', kind: 'text' }, { key: 'body', label: 'Text', kind: 'rich' }] },
  { section: 'Faith', key: 'faith.heading', label: 'Heading', kind: 'text', fallback: 'Faith' },
  { section: 'Faith', key: 'faith.body', label: 'Text', kind: 'rich' },
  { section: 'Practical details', key: 'practical.body', label: 'Text', kind: 'rich' },
  { section: 'Request an appointment', key: 'request.heading', label: 'Heading', kind: 'text' },
  { section: 'Request an appointment', key: 'request.text', label: 'Text', kind: 'text' },
  { section: 'Request an appointment', key: 'request.format_note', label: 'Note under in person / online', kind: 'text', fallback: 'Online sessions are for clients in Kentucky. Indiana clients meet in person.' },
]);
