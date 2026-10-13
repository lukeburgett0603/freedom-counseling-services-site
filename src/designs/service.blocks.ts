// Service page design (service.astro), e.g. /couples-marriage-counseling.
// H1, meta, FAQs on `pages`; related articles come from posts in the
// page's category; rates from the counselors' own pages.
import { defineBlocks } from '../lib/blocks';

export const SERVICE_BLOCKS = defineBlocks([
  { section: 'Top of page', key: 'hero.eyebrow', label: 'Small label above the headline', kind: 'text', maxLength: 70 },
  { section: 'Top of page', key: 'hero.subhead', label: 'Line under the headline', kind: 'text', maxLength: 260 },
  {
    section: 'Facts under the top', key: 'facts', label: 'Facts (2 to 4)', kind: 'list',
    fields: [
      { key: 'icon', label: 'Icon (Phosphor name)', kind: 'text' },
      { key: 'text', label: 'Fact', kind: 'text' },
    ],
  },
  { section: 'You might be here because', key: 'signs.heading', label: 'Heading', kind: 'text', fallback: 'You might be here because' },
  { section: 'You might be here because', key: 'signs.items', label: 'Lines', kind: 'list', fields: [{ key: 'text', label: 'Line', kind: 'text' }] },
  {
    section: 'Main sections', key: 'sections', label: 'Sections, in order', kind: 'list',
    help: 'Each has a heading and text. Faith, counselors, and costs have their own places below.',
    fields: [
      { key: 'heading', label: 'Heading', kind: 'text' },
      { key: 'body', label: 'Text', kind: 'rich' },
    ],
  },
  { section: 'Faith', key: 'faith.heading', label: 'Heading', kind: 'text' },
  { section: 'Faith', key: 'faith.body', label: 'Text', kind: 'rich' },
  { section: 'Counselors', key: 'team.heading', label: 'Heading', kind: 'text' },
  {
    section: 'Counselors', key: 'team.items', label: 'Counselors for this service', kind: 'list',
    fields: [
      { key: 'slug', label: 'Counselor page (e.g. tony-gore)', kind: 'text' },
      { key: 'text', label: 'What they do here', kind: 'text' },
    ],
  },
  { section: 'Counselors', key: 'team.note', label: 'Line under the cards', kind: 'text', fallback: '' },
  { section: 'What to expect', key: 'expect.heading', label: 'Heading', kind: 'text' },
  { section: 'What to expect', key: 'expect.body', label: 'Text', kind: 'rich' },
  { section: 'What it costs', key: 'cost.heading', label: 'Heading', kind: 'text', fallback: 'What it costs' },
  { section: 'What it costs', key: 'cost.body', label: 'Text', kind: 'rich', help: 'The price range above it comes from the counselors listed.' },
  { section: 'Good to know', key: 'note.heading', label: 'Heading (optional)', kind: 'text', fallback: '' },
  { section: 'Good to know', key: 'note.body', label: 'Text (optional)', kind: 'rich', fallback: '' },
  { section: 'Common questions', key: 'faq.heading', label: 'Heading', kind: 'text', fallback: 'Common questions' },
  { section: 'Related articles', key: 'related.heading', label: 'Heading', kind: 'text', fallback: 'Related articles' },
  { section: 'Request an appointment', key: 'request.heading', label: 'Heading', kind: 'text' },
  { section: 'Request an appointment', key: 'request.text', label: 'Text', kind: 'text' },
  { section: 'Request an appointment', key: 'request.crisis', label: 'Crisis line wording (optional)', kind: 'rich', fallback: '' },
  { section: 'Request an appointment', key: 'request.format_note', label: 'Note under in person / online', kind: 'text', fallback: 'Online sessions are for clients in Kentucky. Indiana clients meet in person.' },
]);
