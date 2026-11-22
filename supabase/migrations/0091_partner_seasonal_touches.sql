-- Referral partners upgrade, step 9 (2026-11-21; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): seasonal
-- touches (back to school, holiday cards, Pastor Appreciation Month...).
-- The calendar lives in src/lib/seasonalTouches.ts; a touch marked done is
-- an ordinary activity row that also remembers which season it was for, so
-- the partners page and Today know who still needs one this year.
-- Example: 'holiday-card-2026'.
alter table referral_partner_activities
  add column seasonal_key text
    check (seasonal_key is null or seasonal_key ~ '^[a-z0-9-]{3,60}$');
create index referral_partner_activities_seasonal_idx
  on referral_partner_activities (seasonal_key) where seasonal_key is not null;
