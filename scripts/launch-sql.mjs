// Turn content/launch/pages.json (site system v2 launch preview) into one
// SQL transaction that applies it to the database at launch.
//
//   node scripts/launch-sql.mjs > /tmp/launch.sql
//   supabase db query --linked --project-ref <ref> -f /tmp/launch.sql
//
// Some page fields (h1, meta_description, focus_keyword, images, copy)
// are locked to agency logins by enforce_content_permission, so the
// transaction switches that trigger off for its own updates and back on
// before it commits. Run it in Manual mode, approved by Luke (auto mode
// blocks disabling the trigger). Prints nothing secret.
import { readFileSync } from 'node:fs';

const FILE = 'content/launch/pages.json';
const { pages = {}, business = {} } = JSON.parse(readFileSync(FILE, 'utf8'));

const JSON_COLUMNS = new Set(['faqs', 'images', 'plan_steps', 'concerns', 'key_takeaways', 'specialties', 'modalities', 'opening_hours', 'same_as', 'photos', 'internal_links']);
const tag = '$launch$';

function literal(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (text.includes(tag)) throw new Error(`value contains ${tag}`);
  return `${tag}${text}${tag}`;
}

function assignment(column, value) {
  if (value === null) return `${column} = null`;
  if (JSON_COLUMNS.has(column)) return `${column} = ${literal(value)}::jsonb`;
  if (typeof value === 'number') return `${column} = ${value}`;
  if (typeof value === 'boolean') return `${column} = ${value}`;
  return `${column} = ${literal(value)}`;
}

const lines = ['begin;', 'alter table pages disable trigger pages_enforce_content_permission;'];
let count = 0;
for (const [slug, patch] of Object.entries(pages)) {
  const sets = [];
  for (const [column, value] of Object.entries(patch)) {
    if (column === 'parent') {
      sets.push(value ? `parent_page_id = (select id from pages where slug = ${literal(value)})` : 'parent_page_id = null');
    } else {
      sets.push(assignment(column, value));
    }
  }
  if (!sets.length) continue;
  const where = slug === 'home' ? `page_type = 'Homepage'` : `slug = ${literal(slug)}`;
  lines.push(`update pages set ${sets.join(', ')} where ${where};`);
  count++;
}
const bizSets = Object.entries(business).map(([c, v]) => assignment(c, v));
if (bizSets.length) lines.push(`update business set ${bizSets.join(', ')};`);
lines.push('alter table pages enable trigger pages_enforce_content_permission;');
lines.push('commit;');
lines.push(`select count(*) as published_pages, (select tgenabled from pg_trigger where tgname = 'pages_enforce_content_permission') as lock_on from pages where status = 'content-complete';`);
process.stdout.write(lines.join('\n') + '\n');
process.stderr.write(`${count} page update(s)${bizSets.length ? ' + business' : ''}\n`);
