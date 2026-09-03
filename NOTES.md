# Freedom Counseling Services — Client Notes

This file is **this repo only** — client-specific decisions and findings
that don't belong in the shared template. Never synced in either
direction — see `CLAUDE.md`'s "Where client-specific decisions get
written down" note.

## Business facts

- **Real domain: `freedomcounselingservices.org`** (plural "services") —
  the client initially gave `freedomcounselingservice.org` (singular),
  confirmed a typo. Currently live on Squarespace; will be migrated to
  point at this new site once it's ready.
- Address: 800 Lily Creek Rd Unit 202, Louisville, KY 40243. Phone:
  (502) 523-2970. Office near Southeast Christian Church, off
  Blankenbaker Parkway, behind Heine Brothers Coffee.
- Serves Louisville, KY (physical office, in-person + telehealth) and
  Southern Indiana (telehealth only, no physical office there).
- 5 counselors as of 2026-09-03: Tony Gore (LCSW, Owner/Director),
  Rhonda Gore (Life Coach, MFT-trained), Staci Harrub (LPCA,
  EMDR-trained), Luke Burgett (LPCA, ACT-trained — the founder of this
  agency is also literally one of Freedom's counselors), Sophie Bowman
  (Student Intern). A 6th counselor joining October 2026 — do not build
  their profile page yet, client will provide details closer to start
  date.
- No insurance billing — provides a Superbill for clients to seek their
  own reimbursement. 20+ years in business.
- Real logo uploaded to Supabase Storage:
  `business/logo-1788449698.webp` in the `site-images` bucket (public
  URL: `https://shxtgmjbfojmwhrebjpr.supabase.co/storage/v1/object/public/site-images/business/logo-1788449698.webp`).
  Brand: heading font Fraunces (serif), body font Inter, primary accent
  `#7B2714` (deep brick/maroon).

## Domain authority & migration requirements (2026-09-03)

- `freedomcounselingservices.org`: **Domain Authority 15**, Page
  Authority 19, Trust Flow 24 (healthy — higher than Citation Flow's 28
  is close, not the spammy pattern seen on CMC's competitor audit), 47
  referring IPs. A real, non-zero starting position, unlike CMC's
  brand-new domain (DA 1) — this is an existing, ~20-year-old practice's
  site, not a from-scratch build.
- **Already ranking position #4 organically for "christian counseling
  louisville ky"** (their own Squarespace site, `/our-counselors` page) —
  ahead of several lower-DA competitors (positions 1, 3, and 6 are DA 6,
  7, and 3 respectively). #1 for this term looks genuinely winnable, not
  aspirational.
- **Migration requirement, not optional**: every currently-indexed URL on
  the Squarespace site needs a proper 301 redirect to its new equivalent
  on this site once it goes live at the real domain. Losing the existing
  ranking/authority by resetting to a fresh unindexed site would be a
  real, avoidable regression — map this out before the domain swap, not
  after.

## GBP + citation audit (2026-09-03)

- **Google Business Profile**: 3.8★, 10 reviews. Category is generic
  "Counselor" only, no secondary categories set. Review velocity is
  sparse — most reviews are 7 years old, only one in the last several
  years (5 months ago). Google's own "People also search for" on this
  listing shows real, direct competitors with meaningfully better
  numbers: Life Training Christian Counseling (4.9★, 51 reviews), Life's
  Journey Counseling (4.5★, 32 reviews), Grace Psychological Services
  (5.0★, 23 reviews). This is the real, prioritized competitive gap —
  not an abstract "get more reviews" note.
- **Review strategy needs care, not a generic push**: soliciting Google
  reviews from therapy clients raises a real confidentiality/disclosure
  question a normal local business doesn't have — defer to the client's
  own clinical/ethical judgment on how or whether to actively solicit
  them, rather than recommending a blanket "ask every client" tactic.
- **Real NAP mismatch found**: Psychology Today lists the practice phone
  as `(502) 878-7153` — every other source (GBP, the real website, the
  Location page) uses `(502) 523-2970`. Needs fixing directly on
  Psychology Today's own platform (requires their login, not something
  fixable from here) — flag to the client.
- **Not yet audited**: Yelp (blocked from the browser tool used for this
  research), Facebook (`facebook.com/freedomcounselinglouisville`),
  Nextdoor, CounsellingUp, and the Quality Business Awards listing found
  via search — a full NAP consistency pass across these still needs to
  happen before the citation audit is complete.
- **GBP "About" section** (business description, attributes) wasn't
  confirmed either way during this pass — the browser-based check
  couldn't fully load it. Worth confirming directly once someone has
  dashboard access to the actual GBP listing.

## Site architecture decision (2026-09-03)

**Service pages function as content hub/pillar pages for this site**,
unlike CMC's own site where Service Pages and Content Pillars are
separate, distinct things. Freedom's 8 "services" (Individual, Couples &
Marriage, Family, Child & Teen, Christian/Faith-Based, Grief, Anxiety &
Depression, Trauma & EMDR) get built as `page_type = 'Content Pillar'`
with `category` set to match their blog category, not `'Service Page'` —
reusing the existing hub-and-spoke mechanism rather than building
something new. This mirrors what their own real, existing
Christian/Faith-Based Counseling page already does (table of contents,
deep FAQ, a real blog post cross-linked via "Related reading") — the
client had already arrived at this pattern in practice before it was
named as a deliberate principle. See `CLAUDE.md`'s "Where client-specific
decisions get written down" — this pattern is now standard for every
future counseling-practice client, not just Freedom, but the specific
page-by-page application below is Freedom's own.

**Open question, not yet decided**: whether this needs its own distinct
`page_type` (e.g. `'Service Hub'`) to make the "this is also a real,
bookable service" fact explicit in the CMS, or whether reusing
`'Content Pillar'` as-is (distinguished only by having a matching nav
entry) is good enough. Leaning toward reusing `Content Pillar` since the
underlying mechanics are identical either way, but this hasn't been
confirmed with the client yet.

**Known template gap to close before building these pages**:
`ContentPillar.astro` doesn't currently render `PlanSteps` — the "Reach
out → Get matched → Begin sessions → Find Freedom" process is real,
present on the existing site, and valuable, but `ServicePage.astro` is
the only template that renders `plan_steps` today. Needs adding to
`ContentPillar.astro` as a generic template enhancement before Freedom's
8 hub pages get scaffolded.

## Keyword research (2026-09-03, via Mangools MCP)

**Strong local exact-match keywords found** — the page's own on-page
keyword is a real ranking lever here:

| Page | Focus keyword | Volume |
|---|---|---|
| Homepage | `therapist louisville ky` | 1,300/mo |
| Couples & Marriage Counseling | `couples counseling louisville ky` | 530/mo |
| Grief Counseling | `grief counselors louisville ky` | 130/mo |
| Christian/Faith-Based Counseling | `christian counseling louisville ky` | 110/mo |
| Family Counseling | `family counseling louisville ky` | 40/mo |
| Louisville Service Area | `counselor louisville ky` | 410/mo |
| Southern Indiana Service Area | `therapist new albany indiana` | 160/mo |

Cannibalization note: Homepage and the Louisville Service Area page were
deliberately split across the two strongest distinct local phrases
(`therapist louisville ky` vs. `counselor louisville ky`) rather than
competing for the same one.

**A real, unresolved brand-voice tension**: `therapist louisville ky`
(1,300/mo) outperforms `counselor louisville ky` (410/mo) by ~3x, even
though Freedom's own brand and staff titles consistently say "counselor."
Recommendation (not yet confirmed with client): keep "counselor" for
brand identity/H1s/staff titles (accurate to their real professional
titles), work "therapist" naturally into meta descriptions/alt
text/body copy where accurate, to capture both search vocabularies
without misrepresenting how the practice actually describes itself.

**Weak/no local exact-match volume, real "near me" + problem-based
volume instead** — these four pages' own on-page keyword stays an
accurate local label (not a traffic driver); the real organic strategy
runs through GBP/Local Pack strength plus spoke blog posts targeting the
actual problem language:

- **Individual Counseling** — hub keyword `individual counseling
  louisville ky` (no volume). Spoke opportunities: "how do i find a
  therapist" (13,600–14,300/mo — matches the existing lead magnet, "5
  Things to Know Before Your First Counseling Session," a well-chosen
  topic already), "what do therapists do" (3,500/mo, KD 35).
- **Child & Teen Counseling** — hub keyword `child and teen counseling
  louisville ky` (no local volume). Real "near me" demand is enormous:
  `child therapists near me` 42,800/mo, `children's psychologist near
  me` 22,300/mo, `child psychologist` 25,500/mo, `teenage counseling
  near me` 13,900/mo, `child counselor near me` 12,000/mo — this is
  genuinely one of the highest-demand categories on the whole site; GBP
  work matters most here. Spoke topics: "children with anxiety" /
  "child with anxiety" (8,700/mo each, competitive KD 54–57 but real
  authority value), "signs my teenager needs therapy" framing.
- **Anxiety & Depression Counseling** — hub keyword `anxiety and
  depression counseling louisville ky` (50/mo, small but real exact
  match). Best near-me opportunity of the four: `anxiety therapist near
  me` 7,400/mo, KD only 32 — genuinely winnable. Also `counselor near me
  for anxiety and depression` (90/mo).
- **Trauma & EMDR Counseling** — hub keyword `trauma and emdr counseling
  louisville ky` (no volume). **Best single find of the whole session:
  "dangers of emdr therapy" — 3,300/mo, KD only 10.** A direct, honest
  "Is EMDR Safe? What the Research Actually Says" post is a
  near-free ranking opportunity. Also "symptoms of childhood trauma in
  adulthood" (980/mo, KD 15). `EMDR therapist near me` has no clean
  volume number but real winnable Map Pack intent — small individual
  practices (DA 7–13) rank successfully for it nationally.

**Modality/treatment terms alone (no "near me," no city) are not
winnable and shouldn't be chased**: "individual counseling," "teen
counseling," "EMDR therapy" all showed no measurable volume and SERPs
dominated by massive institutional authority (Cleveland Clinic DA89, APA
DA91, Wikipedia DA97) or venture-funded telehealth brands
(TeenCounseling.com, BetterHelp). Real people search by problem or by
"near me," not by clinical modality name.

**Blog categories**: the existing 8 categories map 1:1 to the 8
services — normally a red flag (see `CLAUDE.md`'s hub-and-spoke section)
but lower-risk here since these are real, already-published categories
with real content and named authors, not a guessed-from-scratch
taxonomy, and the volume data above validates at least three of them
directly (Couples/Marriage, Christian, Grief). Client confirmed: port
existing blog posts as-is, keep the category structure.

## Open action items

- Fix the Psychology Today phone number mismatch (client needs to do
  this directly on PT's platform).
- Full NAP audit pass on Yelp, Facebook, Nextdoor, CounsellingUp, Quality
  Business Awards.
- GBP category optimization (add relevant secondary categories beyond
  generic "Counselor").
- Confirm with client: brand-voice call on "counselor" vs. "therapist"
  language; whether the hub/pillar pages need a distinct `page_type` or
  can reuse `Content Pillar` as-is.
- Add `PlanSteps` rendering to `ContentPillar.astro` before scaffolding
  the 8 hub pages.
- 301 redirect mapping from the current Squarespace URL structure before
  the domain swap.
