-- Site system v2: page text stored by named block (2026-10-13).
--
-- A v2 page's layout is designed in code (src/designs/), but its wording
-- lives here, one row per block, so a practice can still edit text in
-- the admin without touching (or breaking) the design. Which blocks a
-- page has, their labels, and their kind (text, rich text, list, image)
-- are declared in code next to the design (src/designs/*.blocks.ts); this
-- table only holds values. SEO fields (h1, meta_title, meta_description,
-- focus_keyword) and FAQs stay on `pages`, with their existing locks.
--
-- Pages without a v2 design keep using the `pages` columns exactly as
-- before; nothing here changes them.

create table content_blocks (
  page_id uuid not null references pages(id) on delete cascade,
  block_key text not null check (block_key ~ '^[a-z0-9_.-]+$'),
  -- A string for text/rich text, an array of objects for lists, an
  -- ImageSlot ({url, alt, creditName?, creditUrl?}) for images.
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key (page_id, block_key)
);

alter table content_blocks enable row level security;

-- Public site build reads every block (same as `pages`).
create policy "public can read content blocks" on content_blocks
  for select using (true);

-- Editing follows the same tiers as page copy (0011, 0013): the agency
-- can always edit; the practice owner can edit directly only on the
-- 'full' content permission tier, and otherwise submits a suggestion
-- (content_suggestions.field_name = 'block:<key>'); staff logins can't
-- edit page text. Blog posts don't use blocks.
create or replace function can_edit_content_blocks()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_agency()
    or (is_owner() and exists (select 1 from business where content_permission_level = 'full'));
$$;

create policy "editors can insert content blocks" on content_blocks
  for insert with check (can_edit_content_blocks());

create policy "editors can update content blocks" on content_blocks
  for update using (can_edit_content_blocks()) with check (can_edit_content_blocks());

create policy "editors can delete content blocks" on content_blocks
  for delete using (can_edit_content_blocks());

create or replace function content_blocks_touch()
returns trigger as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$ language plpgsql;

create trigger content_blocks_touch
  before insert or update on content_blocks
  for each row execute function content_blocks_touch();
