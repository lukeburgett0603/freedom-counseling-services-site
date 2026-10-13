// Homepage design (home.astro): the text blocks it reads. The H1, meta
// title and description, and FAQs stay on the `pages` row (with their
// existing locks and the FAQ structured data). Counselor cards, rates,
// phone, address, and hours come from their own data, not from here.
// Text may use {rate_range} and {phone}; they're filled in at build.
import { defineBlocks } from '../lib/blocks';

export const HOME_BLOCKS = defineBlocks([
  { section: 'Top of page', key: 'hero.eyebrow', label: 'Small label above the headline', kind: 'text', maxLength: 60 },
  { section: 'Top of page', key: 'hero.subhead', label: 'Line under the headline', kind: 'text', maxLength: 140, help: 'About 20 words. The headline itself is the page H1 (search setting).' },
  {
    section: 'Facts under the top', key: 'facts', label: 'Facts strip (2 to 4)', kind: 'list',
    help: 'Facts only: no ratings, review counts, or client quotes.',
    fields: [
      { key: 'icon', label: 'Icon (Phosphor name)', kind: 'text' },
      { key: 'text', label: 'Fact', kind: 'text' },
      { key: 'link_text', label: 'Link words (optional)', kind: 'text' },
      { key: 'href', label: 'Link to (optional)', kind: 'link' },
    ],
  },
  { section: 'What brings you here', key: 'brings.heading', label: 'Heading', kind: 'text' },
  { section: 'What brings you here', key: 'brings.lede', label: 'Intro', kind: 'text' },
  {
    section: 'What brings you here', key: 'brings.items', label: 'Lines, in visitors\' own words', kind: 'list',
    fields: [
      { key: 'quote', label: 'What they might say', kind: 'text' },
      { key: 'label', label: 'Service name', kind: 'text' },
      { key: 'href', label: 'Links to', kind: 'link' },
    ],
  },
  { section: 'Reaching out', key: 'empathy.heading', label: 'Heading', kind: 'text' },
  { section: 'Reaching out', key: 'empathy.body', label: 'Text', kind: 'rich' },
  { section: 'Faith', key: 'faith.heading', label: 'Heading', kind: 'text' },
  { section: 'Faith', key: 'faith.body', label: 'Text', kind: 'rich' },
  { section: 'Faith', key: 'faith.link_label', label: 'Link words', kind: 'text' },
  { section: 'Faith', key: 'faith.link_href', label: 'Link to', kind: 'text' },
  { section: 'Counselors', key: 'team.heading', label: 'Heading', kind: 'text' },
  { section: 'Counselors', key: 'team.lede', label: 'Intro', kind: 'text' },
  { section: 'Counselors', key: 'team.note', label: 'Line under the cards', kind: 'text' },
  { section: 'Counselors', key: 'team.all_label', label: 'Button to all counselors', kind: 'text', fallback: 'Meet all our counselors' },
  { section: 'Getting started', key: 'start.heading', label: 'Heading', kind: 'text' },
  {
    section: 'Getting started', key: 'start.steps', label: 'Steps', kind: 'list',
    fields: [
      { key: 'icon', label: 'Icon (Phosphor name)', kind: 'text' },
      { key: 'title', label: 'Step', kind: 'text' },
      { key: 'text', label: 'Text', kind: 'text' },
    ],
  },
  { section: 'What it costs', key: 'cost.heading', label: 'Heading', kind: 'text' },
  { section: 'What it costs', key: 'cost.note', label: 'Line under the price range', kind: 'text', help: 'The range itself comes from the counselors\' rates.' },
  { section: 'What it costs', key: 'cost.body', label: 'Text', kind: 'rich' },
  { section: 'What it costs', key: 'cost.link_label', label: 'Link to fees', kind: 'text', fallback: "See every counselor's rate" },
  { section: 'What could change', key: 'vision.heading', label: 'Heading', kind: 'text' },
  { section: 'What could change', key: 'vision.body', label: 'Text', kind: 'rich', help: 'A picture, not a promise ("imagine," never "you will").' },
  { section: 'When we refer out', key: 'elsewhere.heading', label: 'Heading', kind: 'text' },
  { section: 'When we refer out', key: 'elsewhere.body', label: 'Text', kind: 'rich' },
  { section: 'Common questions', key: 'faq.heading', label: 'Heading', kind: 'text', fallback: 'Common questions', help: 'The questions themselves are edited under FAQs.' },
  { section: 'Request an appointment', key: 'request.heading', label: 'Heading', kind: 'text', fallback: 'Ready when you are.' },
  { section: 'Request an appointment', key: 'request.text', label: 'Text', kind: 'text' },
  { section: 'Request an appointment', key: 'request.format_note', label: 'Note under in person / online', kind: 'text' },
]);
