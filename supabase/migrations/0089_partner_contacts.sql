-- Referral partners upgrade, step 7 (2026-11-21; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): more than one
-- contact per partner (the doctor, and the office manager who actually
-- makes the referrals). The partner's existing contact_name / email /
-- phone stay as the main contact (everything built on them keeps working)
-- and gain a role; other people live in referral_partner_contacts. Emails
-- from the admin pick a recipient from either (send-partner-email).

alter table referral_partners
  add column contact_role text check (contact_role is null or char_length(contact_role) <= 80);

create table referral_partner_contacts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references referral_partners(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  role text check (role is null or char_length(role) <= 80),
  email text check (email is null or char_length(email) <= 200),
  phone text check (phone is null or char_length(phone) <= 40),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index referral_partner_contacts_partner_idx on referral_partner_contacts (partner_id);

alter table referral_partner_contacts enable row level security;
create policy "admin can read partner contacts" on referral_partner_contacts
  for select using (is_owner() or is_agency());
create policy "admin can add partner contacts" on referral_partner_contacts
  for insert with check (is_owner() or is_agency());
create policy "admin can update partner contacts" on referral_partner_contacts
  for update using (is_owner() or is_agency()) with check (is_owner() or is_agency());
create policy "admin can delete partner contacts" on referral_partner_contacts
  for delete using (is_owner() or is_agency());

create trigger referral_partner_contacts_updated_at
  before update on referral_partner_contacts
  for each row execute function set_updated_at();
