-- Price transparency (a system-wide standard since 2026-10-13): each
-- counselor's per-session rate, stored once on their Counselor Profile
-- page and shown everywhere a rate appears (counselor cards, profile,
-- fees page, the "$50 to $160" range). Whole US dollars. Null means the
-- rate isn't published (cards then show nothing, never a guess).
--
-- Not in enforce_content_permission's tier-gated list, so the practice
-- owner can update rates on any plan (a price change shouldn't wait on
-- the agency); a linked counselor login still can't (that carve-out is a
-- whitelist).
alter table pages add column session_rate_usd integer
  check (session_rate_usd is null or session_rate_usd between 0 and 2000);
