-- Full caseload per counselor (Luke, 2026-11-20). "Full" used to be the
-- weekly client target x 1.5 for everyone, but counselors' client mixes
-- differ a lot (on Freedom: 1.5x for one counselor, about 3.4x for another),
-- so one shared number can't fit. Each counselor can now set the number of
-- active clients that means full for them; blank keeps the default, which
-- rises to weekly target x 2.0 (lib/caseload.ts CASELOAD_MULTIPLIER).
alter table counselor_caseload
  add column full_caseload integer check (full_caseload between 1 and 200);
