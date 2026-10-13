// General page design (page.astro): hubs, locations, counselors, fees,
// about. Every section is optional and shows only when it has text, in
// a fixed order so layouts never repeat back to back.
import { defineBlocks } from '../lib/blocks';

const text = (section: string, key: string, label: string, extra = {}) => ({ section, key, label, kind: 'text' as const, fallback: '', ...extra });
const rich = (section: string, key: string, label: string) => ({ section, key, label, kind: 'rich' as const, fallback: '' });

export const PAGE_BLOCKS = defineBlocks([
  text('Top of page', 'hero.eyebrow', 'Small label above the headline', { maxLength: 70 }),
  text('Top of page', 'hero.subhead', 'Line under the headline', { maxLength: 260 }),
  text('Top of page', 'hero.media', 'Photos beside the headline: "team" or blank'),
  { section: 'Facts under the top', key: 'facts', label: 'Facts (2 to 4)', kind: 'list', fallback: [], fields: [{ key: 'icon', label: 'Icon (Phosphor name)', kind: 'text' }, { key: 'text', label: 'Fact', kind: 'text' }] },
  text('Links', 'links.heading', 'Heading'),
  text('Links', 'links.lede', 'Intro'),
  { section: 'Links', key: 'links.items', label: 'Links', kind: 'list', fallback: [], fields: [{ key: 'title', label: 'Title', kind: 'text' }, { key: 'text', label: 'One line', kind: 'text' }, { key: 'href', label: 'Links to', kind: 'link' }] },
  text('Second links', 'links2.heading', 'Heading'),
  text('Second links', 'links2.lede', 'Intro'),
  { section: 'Second links', key: 'links2.items', label: 'Links', kind: 'list', fallback: [], fields: [{ key: 'title', label: 'Title', kind: 'text' }, { key: 'text', label: 'One line', kind: 'text' }, { key: 'href', label: 'Links to', kind: 'link' }] },
  text('Help choosing', 'chooser.heading', 'Heading'),
  text('Help choosing', 'chooser.lede', 'Intro'),
  { section: 'Help choosing', key: 'chooser.items', label: 'Needs and who fits', kind: 'list', fallback: [], fields: [{ key: 'quote', label: 'Need', kind: 'text' }, { key: 'label', label: 'Who fits', kind: 'text' }, { key: 'href', label: 'Links to', kind: 'link' }] },
  { section: 'Main sections', key: 'sections', label: 'Sections, in order', kind: 'list', fallback: [], fields: [{ key: 'heading', label: 'Heading', kind: 'text' }, { key: 'body', label: 'Text', kind: 'rich' }] },
  text('Faith', 'faith.heading', 'Heading'),
  rich('Faith', 'faith.body', 'Text'),
  text('Counselors', 'team.mode', 'Counselor cards: "top" (right under the facts), "all" (after the main sections), or blank'),
  text('Counselors', 'team.heading', 'Heading'),
  text('Counselors', 'team.lede', 'Intro'),
  text('Counselors', 'team.note', 'Line under the cards'),
  text('Rates', 'rates.heading', 'Heading (blank hides the rate list)'),
  text('Rates', 'rates.note', 'Line under the rates'),
  { section: 'More sections', key: 'more', label: 'Sections after the counselors', kind: 'list', fallback: [], fields: [{ key: 'heading', label: 'Heading', kind: 'text' }, { key: 'body', label: 'Text', kind: 'rich' }] },
  text('Office', 'office.heading', 'Heading (blank hides the office card)'),
  rich('Office', 'office.directions', 'Directions'),
  text('What to expect and cost', 'expect.heading', 'Heading'),
  rich('What to expect and cost', 'expect.body', 'Text'),
  text('What to expect and cost', 'cost.heading', 'Cost heading'),
  rich('What to expect and cost', 'cost.body', 'Cost text'),
  text('Good to know', 'note.heading', 'Heading'),
  rich('Good to know', 'note.body', 'Text'),
  text('Common questions', 'faq.heading', 'Heading', { fallback: 'Common questions' }),
  text('Request an appointment', 'request.heading', 'Heading', { fallback: 'Ready when you are.' }),
  text('Request an appointment', 'request.text', 'Text'),
  rich('Request an appointment', 'request.crisis', 'Crisis line wording (optional)'),
  text('Request an appointment', 'request.format_note', 'Note under in person / online', { fallback: 'Online sessions are for clients in Kentucky. Indiana clients meet in person.' }),
]);
