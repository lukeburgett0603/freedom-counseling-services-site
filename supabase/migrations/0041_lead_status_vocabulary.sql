-- `leads.status` used to be a generic 'new'/'contacted'/'closed' —
-- 'closed' was too vague: it collapsed "got scheduled" (a win), "referred
-- out" (not a fit here, but not a loss), and "decided against counseling"
-- (a real, distinct outcome worth tracking on its own) into one bucket.
-- Client request (2026-09-11): split into three specific outcomes.
--   - scheduled: the lead booked an appointment.
--   - referred: not a fit for this practice, sent elsewhere.
--   - withdrawn: the lead decided they no longer want counseling
--     services — their own decision, not the practice declining them.
-- Confirmed live before writing this: no existing lead on this project
-- had status = 'closed' at the time, so no data remapping was needed.
alter table leads drop constraint leads_status_check;
alter table leads add constraint leads_status_check
  check (status in ('new', 'contacted', 'scheduled', 'referred', 'withdrawn'));
