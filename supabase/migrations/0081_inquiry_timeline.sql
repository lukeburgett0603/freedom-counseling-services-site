-- Inquiry upgrades (2026-11-19, plan: Counselor Marking Co./crm/client-platform-plan.md).
-- Timeline, log a call, next step, why they didn't book, came back, and
-- reply scripts. Nothing here sends or receives email, and nothing adds a
-- new place for health details: calls are logged by outcome only, and reply
-- scripts are copied into the practice's own email.

-- ------------------------------------------------------------- leads
alter table leads
  add column next_step text check (next_step is null or char_length(next_step) <= 200),
  add column outcome_reason text check (outcome_reason in (
    'insurance', 'cost', 'no_opening', 'specialty', 'no_response', 'chose_elsewhere', 'not_ready', 'other'
  )),
  add column outcome_note text check (outcome_note is null or char_length(outcome_note) <= 300),
  add column check_back_date date,
  -- The same person's earlier inquiry (same email or phone). Linked, never
  -- merged: a parent asking for a second child, or one partner and then the
  -- other, are separate records.
  add column previous_lead_id uuid references leads(id) on delete set null,
  add column last_activity_at timestamptz;

create index leads_previous_lead_idx on leads (previous_lead_id) where previous_lead_id is not null;
create index leads_email_lower_idx on leads (lower(email)) where email is not null;

-- ------------------------------------------------------------- timeline
-- What happened and when. `detail` holds small facts only (from/to status,
-- a call's outcome, a linked inquiry id), never message text.
create table lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  kind text not null check (kind in ('stage', 'assigned', 'call', 'came_back', 'came_back_later')),
  detail jsonb not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index lead_events_lead_idx on lead_events (lead_id, created_at desc);

alter table lead_events enable row level security;

create policy "admin can read lead events" on lead_events
  for select using (is_owner() or is_agency());
create policy "linked counselor can read events on assigned leads" on lead_events
  for select using (
    exists (
      select 1 from leads
      where leads.id = lead_events.lead_id
        and leads.assigned_counselor_page_id is not null
        and leads.assigned_counselor_page_id = linked_counselor_page_id()
    )
  );
-- People log calls only; status, counselor and came-back entries are
-- written by the database itself (triggers below, submit-lead).
create policy "admin can log calls" on lead_events
  for insert with check (
    kind = 'call' and created_by = auth.uid() and (is_owner() or is_agency())
  );
create policy "linked counselor can log calls on assigned leads" on lead_events
  for insert with check (
    kind = 'call' and created_by = auth.uid()
    and exists (
      select 1 from leads
      where leads.id = lead_events.lead_id
        and leads.assigned_counselor_page_id is not null
        and leads.assigned_counselor_page_id = linked_counselor_page_id()
    )
  );

-- Status and counselor changes land on the timeline by themselves,
-- whoever makes them. Runs before leads_zz_counselor_guard (alphabetical),
-- so last_activity_at is in the guard's allowed list.
create or replace function log_lead_changes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into lead_events (lead_id, kind, detail, created_by)
    values (new.id, 'stage', jsonb_build_object('from', coalesce(old.status, 'new'), 'to', coalesce(new.status, 'new')), auth.uid());
    new.last_activity_at := now();
    -- Back to an open status: the old outcome no longer applies.
    if coalesce(new.status, 'new') in ('new', 'contacted') then
      new.outcome_reason := null;
      new.outcome_note := null;
      new.check_back_date := null;
    end if;
  end if;
  if new.assigned_counselor_page_id is distinct from old.assigned_counselor_page_id then
    insert into lead_events (lead_id, kind, detail, created_by)
    values (new.id, 'assigned', jsonb_build_object('from', old.assigned_counselor_page_id, 'to', new.assigned_counselor_page_id), auth.uid());
    new.last_activity_at := now();
  end if;
  if new.next_step is distinct from old.next_step or new.follow_up_date is distinct from old.follow_up_date then
    new.last_activity_at := now();
  end if;
  return new;
end $$;

create trigger leads_log_changes
  before update on leads
  for each row execute function log_lead_changes();

-- A logged call is first contact: a Waiting inquiry becomes Contacted
-- (which sets first_contacted_at through leads_first_contacted_at).
create or replace function apply_lead_call() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'call' then
    update leads
      set status = case when coalesce(status, 'new') = 'new' then 'contacted' else status end,
          first_contacted_at = coalesce(first_contacted_at, now()),
          last_activity_at = now()
      where id = new.lead_id;
  end if;
  return new;
end $$;

create trigger lead_events_apply_call
  after insert on lead_events
  for each row execute function apply_lead_call();

create or replace function touch_lead_from_note() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update leads set last_activity_at = now() where id = new.lead_id;
  return new;
end $$;

create trigger lead_notes_touch_lead
  after insert on lead_notes
  for each row execute function touch_lead_from_note();

-- Counselors may now also set the next step and the outcome (0073 widened).
create or replace function enforce_counselor_lead_update()
returns trigger
language plpgsql
as $$
declare
  allowed text[] := array[
    'status', 'follow_up_date', 'scheduled_at', 'first_contacted_at',
    'next_step', 'outcome_reason', 'outcome_note', 'check_back_date', 'last_activity_at'
  ];
begin
  if is_owner() or is_agency() or auth.uid() is null then
    return new;
  end if;
  if linked_counselor_page_id() is not null
     and (to_jsonb(new) - allowed) is distinct from (to_jsonb(old) - allowed) then
    raise exception 'Counselors can change only an inquiry''s status, next step, follow-up and outcome.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- The same person's most recent earlier inquiry, by email or by the last
-- 10 digits of a phone number. Guide downloads don't count. Used by
-- submit-lead (service role) only.
create or replace function find_previous_lead(p_email text, p_phone text, p_exclude uuid)
returns uuid
language sql stable security definer set search_path = public as $$
  select id from leads
  where id <> p_exclude
    and lead_magnet_id is null
    and (
      (nullif(btrim(p_email), '') is not null and lower(email) = lower(btrim(p_email)))
      or (
        length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 10
        and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 10)
          = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
      )
    )
  order by created_at desc
  limit 1
$$;
revoke all on function find_previous_lead(text, text, uuid) from public, anon, authenticated;

-- ------------------------------------------------------------- reply scripts
-- Saved wording a practice copies into its own email or reads on the phone.
-- Fill-ins: {first_name} {practice} {phone} {my_name} {counselor}.
create table reply_scripts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  body text not null check (char_length(body) between 1 and 4000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reply_scripts enable row level security;

create policy "admin and counselors can read reply scripts" on reply_scripts
  for select using (is_owner() or is_agency() or linked_counselor_page_id() is not null);
create policy "admin can manage reply scripts" on reply_scripts
  for all using (is_owner() or is_agency()) with check (is_owner() or is_agency());

create trigger reply_scripts_updated_at
  before update on reply_scripts
  for each row execute function set_updated_at();

insert into reply_scripts (name, body, sort_order) values
('First reply',
'Hi {first_name}, thank you for reaching out to {practice}. I''d be glad to help you find a time. What days and times usually work best for you? If it''s easier to talk, you can call us at {phone}. To protect your privacy, please don''t share details about what''s going on by email; we can talk about that when we connect.',
1),
('Voicemail',
'Hi {first_name}, this is {my_name} from {practice}, returning your message about counseling. You can reach us at {phone}. I''ll also send you a short email in case that''s easier. Talk soon.',
2),
('Second follow-up',
'Hi {first_name}, I wanted to follow up on your message to {practice}. If you''re still looking for a counselor, I''d be glad to help you find a time. If now isn''t the right time, that''s completely okay; you''re welcome to reach out whenever you''re ready.',
3),
('No opening that fits',
'Hi {first_name}, thank you for reaching out to {practice}. Right now we don''t have an opening that fits what you''re looking for, and I don''t want you to have to wait. Here are a few counselors I''d recommend: [names and how to reach them]. If something opens up on our end, I''ll let you know.',
4);
