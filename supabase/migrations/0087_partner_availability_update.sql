-- Referral partners upgrade, step 6 (2026-11-20; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): a short
-- "who has openings" update for active partners, drafted from each
-- counselor's live availability and sent one partner at a time from the
-- partner's page (send-partner-email, logged with
-- detail = {"template": "availability_update"}). Never a mass email.
--
-- How often Today suggests it. 'off' hides the suggestion.
alter table business
  add column availability_update_cadence text not null default 'monthly'
    check (availability_update_cadence in ('monthly', 'quarterly', 'off'));
