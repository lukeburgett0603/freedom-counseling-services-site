-- Referral partners upgrade, step 2 (2026-11-19; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): a priority per
-- partner that sets how often to be in touch, and the facts the admin needs
-- to flag partners who are due, going cold, or have stopped referring.
--
-- The rhythm itself (Key every 30 days, Regular 60, Occasional 90) and the
-- flag rules live in src/lib/referralPartners.ts (partnerHealth), so the
-- page and Today agree.

alter table referral_partners
  add column priority text not null default 'regular'
    check (priority in ('key', 'regular', 'occasional'));

-- One row per partner, computed in the database so screens never page
-- through the whole activity history (Supabase returns at most 1,000 rows
-- per request). security_invoker: each person sees only the partners and
-- inquiries their own access allows.
create view referral_partner_health
with (security_invoker = true) as
select
  p.id as partner_id,
  -- Real contact only: not internal notes, not stage bookkeeping.
  (select max(a.occurred_on) from referral_partner_activities a
    where a.partner_id = p.id and a.activity_type not in ('note', 'stage')) as last_contact_on,
  (select count(*) from leads l
    where l.referral_partner_id = p.id and l.lead_magnet_id is null) as referral_count,
  (select min(l.created_at) from leads l
    where l.referral_partner_id = p.id and l.lead_magnet_id is null) as first_referral_at,
  (select max(l.created_at) from leads l
    where l.referral_partner_id = p.id and l.lead_magnet_id is null) as last_referral_at
from referral_partners p;

grant select on referral_partner_health to authenticated;
revoke all on referral_partner_health from anon;
