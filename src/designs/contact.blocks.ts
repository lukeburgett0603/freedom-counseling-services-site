// Contact page design (contact.astro): the request form comes first.
import { defineBlocks } from '../lib/blocks';

export const CONTACT_BLOCKS = defineBlocks([
  { section: 'Top of page', key: 'hero.subhead', label: 'Line under the headline', kind: 'text', maxLength: 260 },
  { section: 'Form', key: 'request.heading', label: 'Form heading', kind: 'text', fallback: 'Request an appointment' },
  { section: 'Form', key: 'request.text', label: 'Text beside the form', kind: 'text', fallback: '' },
  { section: 'Form', key: 'request.format_note', label: 'Note under in person / online', kind: 'text', fallback: 'Online sessions are for clients in Kentucky. Indiana clients meet in person.' },
  { section: 'Other ways to reach us', key: 'office.heading', label: 'Heading', kind: 'text', fallback: 'Prefer to call?' },
  { section: 'Other ways to reach us', key: 'office.directions', label: 'Text', kind: 'rich' },
  { section: 'What happens next', key: 'next.heading', label: 'Heading', kind: 'text' },
  { section: 'What happens next', key: 'next.steps', label: 'Steps', kind: 'list', fields: [{ key: 'icon', label: 'Icon (Phosphor name)', kind: 'text' }, { key: 'title', label: 'Step', kind: 'text' }, { key: 'text', label: 'Text', kind: 'text' }] },
  { section: 'What happens next', key: 'cost.heading', label: 'Cost heading', kind: 'text', fallback: 'What it costs' },
  { section: 'What happens next', key: 'cost.body', label: 'Cost text', kind: 'rich' },
  { section: 'Good to know', key: 'note.heading', label: 'Heading', kind: 'text', fallback: '' },
  { section: 'Good to know', key: 'note.body', label: 'Text', kind: 'rich', fallback: '' },
]);
