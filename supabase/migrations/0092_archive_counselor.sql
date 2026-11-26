-- Archive a counselor who leaves the practice (Luke, 2026-11-25; first
-- used for Sophie Bowman at Freedom Counseling Services).
--
-- An archived page is off the public site: the build skips it, so every
-- derived section (counselor cards, service-page teams, the rate range,
-- the fees table, the request form's counselor list, structured data)
-- drops the counselor on the next publish, and the remaining counselors
-- carry on as they are. The old address becomes a redirect page (a
-- profile to the counselors page, a service to the services page), and
-- links to it in page text are unlinked, so nothing points at it. Blog
-- posts they wrote stay, under their name. Nothing is deleted: their page,
-- its text and their caseload history stay in the database, and
-- restore_counselor() brings it all back.
--
-- A service page only the leaving counselor provides can be archived in
-- the same step (archived_with points at the counselor, so a restore
-- brings it back too). The admin screen (Counselor settings, "Leaving
-- the practice") shows the full effect before anything changes.

alter table pages drop constraint pages_status_check;
alter table pages add constraint pages_status_check
  check (status in ('placeholder', 'in-progress', 'content-complete', 'archived'));

alter table pages
  add column archived_at timestamptz,
  -- A service page archived along with a counselor: restored with them.
  add column archived_with uuid references pages(id) on delete set null,
  -- The login turned off at archive time (its admin_users row is removed,
  -- the same as Team -> Remove), kept so a restore can offer a re-invite.
  add column archived_login_email text;

-- Archive a counselor, optionally with service pages only they provide,
-- and optionally turn off their login. Owner or agency only.
create or replace function archive_counselor(
  p_page_id uuid,
  p_service_page_ids uuid[] default '{}',
  p_remove_login boolean default true
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_page pages%rowtype;
  v_email text;
  v_services int := 0;
begin
  if not (is_owner() or is_agency()) then
    raise exception 'Only the practice owner can archive a counselor.';
  end if;

  select * into v_page from pages where id = p_page_id;
  if not found or v_page.page_type <> 'Counselor Profile' then
    raise exception 'That page is not a counselor profile.';
  end if;
  if v_page.status = 'archived' then
    raise exception '% is already archived.', v_page.title;
  end if;

  if p_remove_login then
    select email into v_email from admin_users
      where linked_counselor_page_id = p_page_id and role <> 'agency'
      order by created_at limit 1;
    delete from admin_users where linked_counselor_page_id = p_page_id and role <> 'agency';
  end if;

  update pages
     set status = 'archived', archived_at = now(), archived_with = null, archived_login_email = v_email
   where id = p_page_id;

  update pages
     set status = 'archived', archived_at = now(), archived_with = p_page_id
   where id = any(coalesce(p_service_page_ids, '{}'))
     and page_type in ('Service Hub', 'Service Page')
     and status = 'content-complete';
  get diagnostics v_services = row_count;

  return jsonb_build_object('archived', v_page.title, 'services', v_services, 'login_removed', v_email);
end;
$$;

-- Bring an archived counselor back, with any service pages archived
-- with them. Returns the login email that was turned off, if any, so the
-- admin can offer to re-invite it.
create or replace function restore_counselor(p_page_id uuid) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_page pages%rowtype;
begin
  if not (is_owner() or is_agency()) then
    raise exception 'Only the practice owner can restore a counselor.';
  end if;

  select * into v_page from pages where id = p_page_id;
  if not found or v_page.page_type <> 'Counselor Profile' or v_page.status <> 'archived' then
    raise exception 'That counselor is not archived.';
  end if;

  update pages
     set status = 'content-complete', archived_at = null, archived_with = null
   where archived_with = p_page_id and status = 'archived';

  update pages
     set status = 'content-complete', archived_at = null, archived_login_email = null
   where id = p_page_id;

  return jsonb_build_object('restored', v_page.title, 'login_email', v_page.archived_login_email);
end;
$$;

revoke all on function archive_counselor(uuid, uuid[], boolean) from public, anon;
revoke all on function restore_counselor(uuid) from public, anon;
grant execute on function archive_counselor(uuid, uuid[], boolean) to authenticated;
grant execute on function restore_counselor(uuid) to authenticated;
