-- CollapsibleSection.astro's own trigger label ("Learn more about our
-- approach" by default) — admin-editable per page, since a generic
-- default won't fit every page's real content (e.g. a specific Counselor
-- Profile might want "Learn more about how I work" instead of the
-- generic default). Nullable: CollapsibleSection.astro's own triggerText
-- prop default covers the unset case, same "unset means use the
-- component default" pattern as every other optional per-page field.
alter table pages add column storybrand_pitch_label text;

-- Joins the same tier-gated group as storybrand_pitch itself in
-- enforce_content_permission() (0034_storybrand_sections.sql) — doesn't
-- make sense for a restricted-tier owner to be blocked from editing the
-- Pitch paragraph but freely able to change the label that introduces it,
-- or vice versa. Same "add it to the check from the start" discipline as
-- every other field added to this trigger's protected group.
create or replace function enforce_content_permission()
returns trigger as $$
declare
  tier text;
begin
  if new.page_type = 'Blog Post' then
    return new;
  end if;

  if is_agency() then
    return new;
  end if;

  if exists (
    select 1 from admin_users
    where id = auth.uid() and role = 'staff' and status = 'active' and linked_counselor_page_id = old.id
  ) then
    if (to_jsonb(new) - 'availability_status' - 'telehealth_available' - 'modalities' - 'updated_at')
      is distinct from (to_jsonb(old) - 'availability_status' - 'telehealth_available' - 'modalities' - 'updated_at')
    then
      raise exception 'linked counselor logins may only update their own availability_status, telehealth_available, and modalities';
    end if;
    return new;
  end if;

  if new.h1 is distinct from old.h1
    or new.meta_description is distinct from old.meta_description
    or new.focus_keyword is distinct from old.focus_keyword
  then
    raise exception 'h1, meta_description, and focus_keyword are protected on every plan — submit a suggestion instead';
  end if;

  if new.hero_subhead is distinct from old.hero_subhead
    or new.copy is distinct from old.copy
    or new.images is distinct from old.images
    or new.hero_style is distinct from old.hero_style
    or new.hero_overlay_color is distinct from old.hero_overlay_color
    or new.hero_overlay_opacity is distinct from old.hero_overlay_opacity
    or new.hero_image_focal_y is distinct from old.hero_image_focal_y
    or new.storybrand_problem is distinct from old.storybrand_problem
    or new.storybrand_guide_empathy is distinct from old.storybrand_guide_empathy
    or new.storybrand_pitch is distinct from old.storybrand_pitch
    or new.storybrand_pitch_label is distinct from old.storybrand_pitch_label
    or new.storybrand_success is distinct from old.storybrand_success
    or new.storybrand_failure is distinct from old.storybrand_failure
  then
    select content_permission_level into tier from business limit 1;
    if tier is distinct from 'full' then
      raise exception 'this field is protected on your current plan — submit a suggestion instead';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;
