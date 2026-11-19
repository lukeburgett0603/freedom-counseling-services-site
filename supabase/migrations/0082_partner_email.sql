-- Referral partners upgrade, step 1 (2026-11-19; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): email partners
-- from the admin, and one timeline per partner.
--
-- Emails are sent by the send-partner-email Edge Function (service role),
-- which saves each sent email here with its text. Replies go to the
-- practice's own inbox for now; "They replied" logs that a reply came
-- (date only, never its text). Stage changes are recorded by trigger.

alter table referral_partner_activities
  drop constraint if exists referral_partner_activities_activity_type_check;
alter table referral_partner_activities
  add constraint referral_partner_activities_activity_type_check check (activity_type in (
    'email', 'call', 'visit', 'meeting', 'materials', 'thank_you', 'note', 'reply', 'stage'
  ));

alter table referral_partner_activities
  -- A sent email (send-partner-email only).
  add column subject text check (subject is null or char_length(subject) <= 200),
  add column body text check (body is null or char_length(body) <= 10000),
  add column sent_to text,
  add column resend_id text,
  -- A stage change: {"from": "prospect", "to": "contacted"}.
  add column detail jsonb;

alter table referral_partner_activities
  alter column created_by set default auth.uid();

create index referral_partner_activities_partner_idx
  on referral_partner_activities (partner_id, occurred_on desc, created_at desc);

-- People log calls, visits, notes and replies. Sent emails and stage
-- changes are written only by the system, so the timeline can be trusted.
drop policy if exists "admin can insert partner activities" on referral_partner_activities;
create policy "admin can insert partner activities" on referral_partner_activities
  for insert with check (
    (is_owner() or is_agency())
    and activity_type <> 'stage'
    and subject is null and body is null and sent_to is null and resend_id is null and detail is null
  );

create or replace function log_partner_stage_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into referral_partner_activities (partner_id, activity_type, occurred_on, detail, created_by)
    values (new.id, 'stage', current_date, jsonb_build_object('from', old.status, 'to', new.status), auth.uid());
  end if;
  return new;
end $$;

create trigger referral_partners_log_stage
  after update of status on referral_partners
  for each row execute function log_partner_stage_change();
