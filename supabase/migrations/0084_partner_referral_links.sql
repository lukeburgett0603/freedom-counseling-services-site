-- Referral partners upgrade, step 3 (2026-11-20; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): a referral link
-- and QR code per partner. A visit through the link (?ref=<code>) is
-- remembered in the visitor's own browser (lib/adAttribution.ts, 90 days),
-- and an inquiry sent afterward is linked to that partner by submit-lead.
-- The code is not personal data: it names the partner, never the person.

alter table referral_partners
  add column ref_code text
    check (ref_code is null or ref_code ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(ref_code) between 2 and 40);
create unique index referral_partners_ref_code_idx on referral_partners (ref_code) where ref_code is not null;

-- Which link an inquiry came through (null when linked by hand or by name).
alter table leads add column referral_ref_code text;

-- "Dr. Lee's Family Medicine" -> "dr-lees-family-medicine"; "-2", "-3"...
-- when taken.
create or replace function make_partner_ref_code(p_name text, p_id uuid)
returns text
language plpgsql
set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  base := lower(coalesce(p_name, ''));
  base := regexp_replace(base, '[''’]', '', 'g');
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := trim(both '-' from base);
  -- Long names are cut at a whole word ("baptist-health-primary-care",
  -- never "...-middle").
  if char_length(base) > 34 then
    base := case when position('-' in left(base, 35)) > 0
      then regexp_replace(left(base, 35), '-[^-]*$', '')
      else left(base, 34) end;
  end if;
  base := trim(both '-' from base);
  if char_length(base) < 2 then base := 'partner'; end if;
  candidate := base;
  while exists (select 1 from referral_partners where ref_code = candidate and id is distinct from p_id) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

create or replace function set_partner_ref_code() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ref_code is null or btrim(new.ref_code) = '' then
    new.ref_code := make_partner_ref_code(new.name, new.id);
  end if;
  return new;
end $$;

create trigger referral_partners_ref_code
  before insert or update of ref_code on referral_partners
  for each row execute function set_partner_ref_code();

-- Existing partners get a code now (oldest first, so the plain name goes to
-- the longest-standing partner when two share a name).
do $$
declare r record;
begin
  for r in select id, name from referral_partners where ref_code is null order by created_at loop
    update referral_partners set ref_code = make_partner_ref_code(r.name, r.id) where id = r.id;
  end loop;
end $$;
