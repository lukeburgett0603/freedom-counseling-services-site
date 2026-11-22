-- Referral partners upgrade, step 8 (2026-11-21; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): a relationship
-- owner per partner. Owners and the agency see and manage every partner
-- and choose the owner. A counselor (staff linked to a counselor page) sees
-- and works only the partners they own: the same rule as their inquiries
-- (0073). Counselors can add partners (owned by themselves), edit details,
-- log activity, send emails (send-partner-email checks ownership) and
-- manage contacts; they can't delete, archive, reassign, or change a
-- partner's referral link.

alter table referral_partners
  add column owner_user_id uuid references admin_users(id) on delete set null;
create index referral_partners_owner_idx on referral_partners (owner_user_id) where owner_user_id is not null;

-- Is the signed-in counselor this partner's owner? security definer so
-- policies on other tables can ask without recursing through RLS.
create or replace function owns_partner(p_partner uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select linked_counselor_page_id() is not null
    and exists (select 1 from referral_partners where id = p_partner and owner_user_id = auth.uid())
$$;
revoke all on function owns_partner(uuid) from public, anon;
grant execute on function owns_partner(uuid) to authenticated;

-- referral_partners
create policy "counselor can read own partners" on referral_partners
  for select using (linked_counselor_page_id() is not null and owner_user_id = auth.uid());
create policy "counselor can add own partners" on referral_partners
  for insert with check (linked_counselor_page_id() is not null and owner_user_id = auth.uid());
create policy "counselor can update own partners" on referral_partners
  for update using (linked_counselor_page_id() is not null and owner_user_id = auth.uid())
  with check (linked_counselor_page_id() is not null and owner_user_id = auth.uid());

-- A counselor's edits can't archive, reassign or change the referral link.
create or replace function enforce_counselor_partner_update() returns trigger
language plpgsql as $$
begin
  if is_owner() or is_agency() or auth.uid() is null then
    return new;
  end if;
  if new.owner_user_id is distinct from old.owner_user_id
     or new.archived_at is distinct from old.archived_at
     or new.ref_code is distinct from old.ref_code then
    raise exception 'Only the practice owner can archive, reassign, or change a partner''s link.' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger referral_partners_zz_counselor_guard
  before update on referral_partners
  for each row execute function enforce_counselor_partner_update();

-- referral_partner_activities: read and log on own partners (same limits as
-- owners: no stage rows, no fake sent emails).
create policy "counselor can read own partner activity" on referral_partner_activities
  for select using (owns_partner(partner_id));
create policy "counselor can log own partner activity" on referral_partner_activities
  for insert with check (
    owns_partner(partner_id)
    and activity_type <> 'stage'
    and subject is null and body is null and sent_to is null and resend_id is null and detail is null
  );

-- referral_partner_contacts: full control on own partners.
create policy "counselor can read own partner contacts" on referral_partner_contacts
  for select using (owns_partner(partner_id));
create policy "counselor can add own partner contacts" on referral_partner_contacts
  for insert with check (owns_partner(partner_id));
create policy "counselor can update own partner contacts" on referral_partner_contacts
  for update using (owns_partner(partner_id)) with check (owns_partner(partner_id));
create policy "counselor can delete own partner contacts" on referral_partner_contacts
  for delete using (owns_partner(partner_id));
