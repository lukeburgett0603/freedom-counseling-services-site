-- Referral partners upgrade, step 5 (2026-11-20; plan:
-- Counselor Marking Co./referral-partners/upgrade-plan.md): a weekly email
-- to the practice owner about referral partners (send-partner-digest,
-- Mondays). Opt-in, off by default; nothing is sent on a week with nothing
-- to report. The schedule itself is a per-project pg_cron job (it carries
-- this project's URL and DIGEST_CRON_SECRET), set up at launch like the
-- other scheduled functions, not here.

alter table business
  add column partner_digest_enabled boolean not null default false,
  -- Optional; blank means the inquiry notification address(es).
  add column partner_digest_email text
    check (partner_digest_email is null or char_length(partner_digest_email) <= 500),
  add column partner_digest_last_sent_at timestamptz;
