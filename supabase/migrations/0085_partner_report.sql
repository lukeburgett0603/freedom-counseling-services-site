-- Referral partners upgrade, step 4 (2026-11-20; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): the Referral
-- report (admin/analytics/referrals.astro). Adds each partner's first
-- outreach date to the health view, for "time from first outreach to first
-- referral". New column goes last, so `create or replace` keeps the view's
-- existing columns, grants and security_invoker setting.

create or replace view referral_partner_health
with (security_invoker = true) as
select
  p.id as partner_id,
  (select max(a.occurred_on) from referral_partner_activities a
    where a.partner_id = p.id and a.activity_type not in ('note', 'stage')) as last_contact_on,
  (select count(*) from leads l
    where l.referral_partner_id = p.id and l.lead_magnet_id is null) as referral_count,
  (select min(l.created_at) from leads l
    where l.referral_partner_id = p.id and l.lead_magnet_id is null) as first_referral_at,
  (select max(l.created_at) from leads l
    where l.referral_partner_id = p.id and l.lead_magnet_id is null) as last_referral_at,
  -- First outreach from the practice: not notes, stage changes, or their replies.
  (select min(a.occurred_on) from referral_partner_activities a
    where a.partner_id = p.id and a.activity_type not in ('note', 'stage', 'reply')) as first_contact_on
from referral_partners p;

grant select on referral_partner_health to authenticated;
revoke all on referral_partner_health from anon;
