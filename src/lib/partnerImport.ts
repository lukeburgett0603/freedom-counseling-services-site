// Bulk import of referral partners from a spreadsheet (referral partners
// upgrade step 10; plan: Counselor Marking Co./referral-partners/
// upgrade-plan.md). Pure functions, no browser or database access, so they
// can be tested on their own: parse CSV text, recognize the columns, map
// each row to a partner, and flag problems and duplicates. The admin page
// shows the preview and inserts the rows the person keeps.

export type ImportField =
  | 'name'
  | 'category'
  | 'contact_name'
  | 'contact_role'
  | 'email'
  | 'phone'
  | 'website'
  | 'address'
  | 'notes';

export type ImportRow = {
  line: number; // 1-based line in the file (header is line 1)
  values: Record<ImportField, string>;
  category: string; // mapped partner category
  categoryGuessed: boolean; // true when the type wasn't recognized
  errors: string[]; // the row can't be imported
  warnings: string[]; // imported, but worth a look
  duplicateOf: string | null; // name of the existing partner or earlier row it matches
};

export type ExistingPartner = { name: string; website: string | null };

// Recognized column headings (lowercased, punctuation removed).
const HEADERS: Record<ImportField, string[]> = {
  name: ['name', 'partner', 'partner name', 'organization', 'organisation', 'practice', 'office', 'business', 'church', 'school', 'company'],
  category: ['type', 'category', 'kind', 'partner type'],
  contact_name: ['contact', 'contact name', 'contact person', 'main contact', 'person', 'doctor', 'pastor'],
  contact_role: ['role', 'title', 'contact role', 'position', 'job title'],
  email: ['email', 'e mail', 'email address', 'contact email'],
  phone: ['phone', 'phone number', 'telephone', 'tel', 'office phone'],
  website: ['website', 'web site', 'url', 'site', 'web'],
  address: ['address', 'street address', 'location', 'full address'],
  notes: ['notes', 'note', 'comments', 'about', 'details'],
};

const FIELDS = Object.keys(HEADERS) as ImportField[];

// Partner types from the words people actually type. Order matters: the
// first match wins (so "pediatric" beats "doctor").
const CATEGORY_WORDS: [string, RegExp][] = [
  ['pediatrician', /pediatric|paediatric|children'?s (clinic|doctor)|kids? doctor/],
  ['mental_health', /psychiatr|therap|counsel|psycholog|mental health|lpc|lcsw|social work/],
  ['physician', /physician|doctor|dr\.?\b|primary care|family (medicine|practice)|medical|clinic|hospital|health ?care|urgent care|internal medicine|ob ?gyn|nurse/],
  ['attorney', /attorney|lawyer|law (firm|office)|legal|mediat/],
  ['church', /church|pastor|ministr|parish|congregation|chapel|faith|temple|synagogue|mosque|clergy/],
  ['school', /school|academy|college|university|campus|district|education/],
  ['employer', /employer|eap|human resources|\bhr\b|company|business|corporate|workplace/],
  ['other_professional', /professional|coach|chiropract|massage|dentist|funeral|realtor|insurance/],
];

export const IMPORT_TEMPLATE_HEADERS = ['Name', 'Type', 'Contact', 'Role', 'Email', 'Phone', 'Website', 'Address', 'Notes'];
export const IMPORT_TEMPLATE_EXAMPLE = [
  'Grace Community Church',
  'Church',
  'Pastor Mike Allen',
  'Senior pastor',
  'mike@gracechurch.example',
  '(502) 555-0100',
  'gracechurch.example',
  '123 Main St, Louisville, KY',
  'Has a care ministry; met at the community fair',
];

/** RFC 4180-style CSV: quoted fields, doubled quotes, commas and line breaks inside quotes. Also accepts tabs (pasted from a spreadsheet). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"' && field === '') {
      quoted = true;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Which import field each column is, by its heading. Unrecognized columns map to null. */
export function mapHeaders(header: string[]): (ImportField | null)[] {
  const used = new Set<ImportField>();
  return header.map((h) => {
    const n = norm(h);
    const field = FIELDS.find((f) => !used.has(f) && HEADERS[f].includes(n));
    if (field) used.add(field);
    return field ?? null;
  });
}

export function mapCategory(raw: string): { category: string; guessed: boolean } {
  const n = raw.toLowerCase().trim();
  if (!n) return { category: 'other', guessed: true };
  const exact = ['physician', 'pediatrician', 'mental_health', 'attorney', 'church', 'school', 'employer', 'other_professional', 'other'];
  if (exact.includes(n.replace(/\s+/g, '_'))) return { category: n.replace(/\s+/g, '_'), guessed: false };
  for (const [category, re] of CATEGORY_WORDS) if (re.test(n)) return { category, guessed: false };
  return { category: 'other', guessed: true };
}

/** "https://www.Grace-Church.org/about" -> "grace-church.org". */
export function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  const host = url.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
  return host && host.includes('.') ? host : null;
}

/** Name for duplicate matching: lowercase, no punctuation, no leading "the". */
export function nameKey(name: string): string {
  return norm(name).replace(/^the /, '');
}

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

/** Turn parsed CSV rows (header first) into checked import rows. */
export function buildImport(rows: string[][], existing: ExistingPartner[]): { rows: ImportRow[]; unmatchedHeaders: string[] } {
  if (rows.length === 0) return { rows: [], unmatchedHeaders: [] };
  const [header, ...body] = rows;
  const map = mapHeaders(header);
  const unmatchedHeaders = header.filter((h, i) => map[i] === null && h.trim() !== '');

  const existingNames = new Map(existing.map((p) => [nameKey(p.name), p.name]));
  const existingDomains = new Map(existing.filter((p) => domainOf(p.website)).map((p) => [domainOf(p.website)!, p.name]));
  const seenNames = new Map<string, string>();
  const seenDomains = new Map<string, string>();

  const out = body.map((cells, i): ImportRow => {
    const values = Object.fromEntries(FIELDS.map((f) => [f, ''])) as Record<ImportField, string>;
    map.forEach((field, col) => {
      if (field) values[field] = (cells[col] ?? '').trim();
    });
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!values.name) errors.push('No name');
    if (values.name.length > 200) errors.push('Name is too long');
    const { category, guessed } = mapCategory(values.category);
    if (guessed && values.category) warnings.push(`Type "${values.category}" not recognized; set to Other`);
    if (values.email && !EMAIL_RE.test(values.email)) {
      warnings.push(`Email "${values.email}" doesn't look right; left out`);
      values.email = '';
    }
    if (values.website && !domainOf(values.website)) {
      warnings.push(`Website "${values.website}" doesn't look right; left out`);
      values.website = '';
    }
    if (values.website && !/^https?:\/\//i.test(values.website)) values.website = `https://${values.website}`;
    if (values.contact_role.length > 80) values.contact_role = values.contact_role.slice(0, 80);

    // Duplicates: same name or same website as an existing partner or an
    // earlier row in this file.
    let duplicateOf: string | null = null;
    const key = values.name ? nameKey(values.name) : '';
    const domain = domainOf(values.website);
    if (key && existingNames.has(key)) duplicateOf = existingNames.get(key)!;
    else if (domain && existingDomains.has(domain)) duplicateOf = existingDomains.get(domain)!;
    else if (key && seenNames.has(key)) duplicateOf = `${seenNames.get(key)} (earlier in this file)`;
    else if (domain && seenDomains.has(domain)) duplicateOf = `${seenDomains.get(domain)} (earlier in this file)`;
    if (key && !seenNames.has(key)) seenNames.set(key, values.name);
    if (domain && !seenDomains.has(domain)) seenDomains.set(domain, values.name);

    return { line: i + 2, values, category, categoryGuessed: guessed, errors, warnings, duplicateOf };
  });
  return { rows: out, unmatchedHeaders };
}

/** CSV text for the downloadable template. */
export function templateCsv(): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [IMPORT_TEMPLATE_HEADERS, IMPORT_TEMPLATE_EXAMPLE].map((r) => r.map(esc).join(',')).join('\n') + '\n';
}
