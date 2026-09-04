# Freedom Counseling Services — Client Notes

This file is **this repo only** — client-specific decisions and findings
that don't belong in the shared template. Never synced in either
direction — see `CLAUDE.md`'s "Where client-specific decisions get
written down" note.

## Content build progress (2026-09-03)

**Live (`status: content-complete`)**: Home, About, Services Overview,
and all 8 Service Hub pages (Individual, Couples & Marriage, Family,
Child & Teen, Christian/Faith-Based, Grief, Anxiety & Depression,
Trauma & EMDR).

**Services Overview build note**: publishing this page (short intro
copy + CTA, no manually-curated list) was the last step to make the 8
hub pages actually reachable — `getAllPages()` only fetches
`content-complete` rows, so until this page itself was published, the
Services nav dropdown didn't render at all even though every hub page
underneath it was already live. Worth remembering for Counselors
Overview and Service Areas Overview too: those grids will stay
invisible in nav until their own overview page is published, even
after the pages that populate their grids are done.

**Service Hub build notes**: each page's real copy, "Reviewed by"
byline, 4 plan_steps, and 6 FAQs were ported from the real Wix source
(`https://freedom-co-bba0e1ef-luke5391.wix-site-host.com/services/...`)
and adapted into the schema — the numbered "how it works" box became
`plan_steps`, the "ON THIS PAGE" TOC headers became literal H3s in
`copy` (auto-extracted by `extractTableOfContents`), and the FAQ
accordion questions (visible) got genuinely-written answers grounded in
each page's real body content, since the old site's accordion answers
weren't extractable from collapsed markup. The resolved `focus_keyword`
was worked in naturally (bolded once) in every page. Real bylines:
- Individual Counseling — Staci Harrub, LPCA (EMDR Trained)
- Couples & Marriage Counseling — Tony Gore, LCSW (Owner/Director)
- Family Counseling — Rhonda Gore, MFT (Life Coach)
- Child & Teen Counseling — Sophie Bowman (Student Counselor — note:
  the About page's team section called her "Student Intern"; this
  service page's byline says "Student Counselor" — reconcile which is
  current before publishing her counselor profile)
- Christian/Faith-Based Counseling — Tony Gore, LCSW (Owner/Director)
- Grief Counseling — Staci Harrub, LPCA (EMDR Trained)
- Anxiety & Depression Counseling — Rhonda Gore, MFT (Life Coach)
- Trauma & EMDR Counseling — Staci Harrub, LPCA (EMDR Trained)

All 8 hero images were sourced by browsing unsplash.com directly (no
`search-unsplash` Edge Function — see below) and verifying each photo's
real title, full description, license, and photographer name/username
from its own permalink before use — never from a truncated username or
title alone. This caught two wrong photographer-name guesses (corrected
before publishing) and one genuinely misleading photo (titled "Mother
comforts upset child on the sofa," but its real description described a
punishment/discipline scene — rejected in favor of a verified,
appropriate replacement for Child & Teen's hero).

Each real Wix page also names 1-2 real existing blog posts under "Read
Next" and a real lead magnet title under its download form — useful
for porting blog posts with the right hub cross-links, and for scoping
each hub's own lead magnet later.

**Not yet gathered**: full content for Rhonda Gore, Staci Harrub, and
Sophie Bowman's own counselor profile pages (only Tony Gore's was read
in full); the 6 remaining real blog posts' full article text (only
titles/summaries known so far); Southern Indiana service area content
(doesn't exist on the old site — has to be written new).

**Counselor headshots (2026-09-03)**: all 5 real photos (Tony Gore,
Rhonda Gore, Staci Harrub, Luke Burgett, Sophie Bowman) supplied by the
client, uploaded to Supabase Storage (`site-images/counselors/`), and
wired into each Counselor Profile page's `images.headshot`. Luke's and
Sophie's originals were oversized (2.1-2.4MB) — resized to 900px wide
via `sharp` (already a project dependency, no new install needed) before
upload; the other three were already reasonably sized. **Sophie
Bowman's photo is a graduation cap-and-gown shot, not a traditional
headshot** — flagged to the client before using it; explicit call:
use it as-is. All 5 Counselor Profile pages are still `status:
placeholder` — headshots are in, but the real bio copy (from the Wix
site, same porting process as the Service Hub pages) hasn't been
written yet, so none of these pages are live.

**Unsplash API key configured (2026-09-03)**: `UNSPLASH_ACCESS_KEY` set
as an Edge Function secret for this project — was previously missing
(flagged above). Tested live end-to-end via a disposable admin session
calling `search-unsplash` directly (20 real results returned), not just
confirmed as set. Live Unsplash search now works in this site's admin
image pickers (blog posts, lead magnets).

**Homepage build notes**: focus keyword `therapist louisville ky`
worked in naturally (2 uses) while keeping "counselor"/"counseling"
as the dominant brand language elsewhere, per the resolved keyword
table. Testimonial uses a real, publicly-attributed Google review
(Jessica Maza — she posted under her own name, so this isn't the
anonymized-testimonial case). Hero image sourced directly from
unsplash.com (a father lifting his son, by Kelli McClintock) rather
than through the search-unsplash Edge Function, since
`UNSPLASH_ACCESS_KEY` was never set as a secret on this project — still
open, see below.

**About build notes**: condensed the real team roster (now redundant
with the live `/counselors` page) into a link instead of repeating it;
kept the Superbill/insurance note and the "who we serve" list, both
real and specific. Hero image sourced the same manual way (a cozy
two-chair counseling room, by Leuchtturm Entertainment).

## Site structure scaffolded (2026-09-03)

24 page rows created in Supabase, all `status = 'placeholder'` (not
live), plus the `business` row. Structure: Home, About, Services
(→ 8 Service Hub pages), Counselors (→ 5 Counselor Profiles), Service
Areas (→ Louisville + Southern Indiana), Blog, Contact, Privacy Policy,
Terms of Service. Every Service Hub page's `focus_keyword` and
`category` are set per the resolved keyword table below; every
Counselor Profile's `credentials` is set from the real Wix site.
`author_name`/`credentials`/`date_modified` (the Reviewed-by byline)
were deliberately left null on all 8 Service Hub pages — that's a
content-authoring decision (who actually reviewed each page), not a
structural one, and belongs in the next phase, not this one. Blog posts
not yet scaffolded — need their full real content pulled from the Wix
site first, not just the titles/summaries already gathered.

## Business facts

- **Real domain: `freedomcounselingservices.org`** (plural "services") —
  the client initially gave `freedomcounselingservice.org` (singular),
  confirmed a typo. The domain currently resolves to a sparse Squarespace
  site (About/Our Counselors/Services and Fees/Location/Schedule only —
  no individual service pages or blog); it will be migrated to point at
  this new site once it's ready.
- **The actual site being ported/rebuilt is a separate, richer Wix site
  the client maintains**, not the live Squarespace domain above:
  `https://freedom-co-bba0e1ef-luke5391.wix-site-host.com/`. This is
  where every Service Hub page's real copy, bylines, FAQs, plan steps,
  and blog post titles/summaries were sourced from — go back to this URL
  (not the `.org` domain) for any future content-porting work (blog
  posts, counselor profiles, Service Areas, etc.).
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

## Site architecture decision (2026-09-03, confirmed with client)

**Service pages function as content hub/pillar pages for this site**,
unlike CMC's own site where Service Pages and Content Pillars are
separate, distinct things. Freedom's 8 "services" (Individual, Couples &
Marriage, Family, Child & Teen, Christian/Faith-Based, Grief, Anxiety &
Depression, Trauma & EMDR) get built as `page_type = 'Service Hub'` —
**a new, distinct page type** (`ServiceHub.astro`,
`0024_service_hub_page_type.sql`), not a reuse of `Content Pillar`. The
client explicitly wanted the CMS to make "this is also a real bookable
service" fact explicit rather than implicit, so `Service Hub` exists as
its own type: `Content Pillar`'s full feature set (TOC, deep FAQ,
category-driven spoke posts, the Reviewed-by byline) plus `PlanSteps`
and a Hero CTA button. This mirrors what their own real, existing
Christian/Faith-Based Counseling page already did in practice (TOC, deep
FAQ, a blog cross-link, *and* a "Start Counseling" CTA button in the
hero) — the client had already arrived at this pattern before it was
named as a deliberate principle. See `CLAUDE.md`'s "Service Hub" section
— this pattern (and the page type itself) is now standard for every
future counseling-practice client, not just Freedom.

`PlanSteps` support was added to the new `ServiceHub.astro` template
directly (not retrofitted onto `ContentPillar.astro`, which stays for
CMC-style pure-informational pillars with no booking flow).

## Keyword research (2026-09-03, via Mangools MCP)

**"Therapist" vs. "counselor" — client decision: whichever term wins on
search volume, per page, use that; work the other in naturally
elsewhere.** Resolved with real head-to-head data for every page that
has one (not a blanket rule either direction):

| Page | Focus keyword | Volume | Winner vs. the alternative |
|---|---|---|---|
| Homepage | `therapist louisville ky` | 1,300/mo | beats `counselor louisville ky` (410/mo), 3x |
| Couples & Marriage Counseling | `couples counseling louisville ky` | 530/mo | beats `couples therapy louisville ky` (280/mo) |
| Christian/Faith-Based Counseling | `christian counseling louisville ky` | 110/mo | beats `christian therapist louisville ky` (20/mo), 5.5x |
| Grief Counseling | `grief counselors louisville ky` | 130/mo | no measurable `grief therapist` local equivalent found |
| Family Counseling | `family counseling louisville ky` | 40/mo | no measurable `family therapist` local equivalent found |
| Louisville Service Area | `counselor louisville ky` | 410/mo | deliberately not `therapist` here — see cannibalization note |
| Southern Indiana Service Area | `therapist new albany indiana` | 160/mo | only real option at this specificity |

**Cannibalization note**: Homepage and the Louisville Service Area page
are the two broadest local pages, so they're deliberately split across
the two strongest *distinct* local phrases (`therapist louisville ky` vs.
`counselor louisville ky`) rather than competing for the same one — this
is also a clean, real-data way to honor "work the other term in
naturally elsewhere" at the site-wide level, not just within a single
page's copy.

**Net result**: "counseling"/"counselor" actually wins the data on 3 of
the 4 pages with strong local volume (Couples, Christian, and by default
on Grief/Family where no therapist-equivalent has real volume) — only
the broadest, highest-value term (Homepage) favors "therapist." This
isn't a contradiction of the "highest volume wins" rule, it's the rule
applied honestly per page rather than assumed from the one broad
comparison.

**Weak/no local exact-match volume, real "near me" + problem-based
volume instead** — these four pages' own on-page keyword stays an
accurate local label (not a traffic driver); the real organic strategy
runs through GBP/Local Pack strength plus spoke blog posts targeting the
actual problem language:

These four lean "therapist" in their own on-page label too, since that's
the term the *real* near-me/national volume actually uses (unlike the
four above, nothing here validates "counseling" wording specifically):

- **Individual Counseling** — hub keyword `individual therapy louisville
  ky` (no local volume either way). Spoke opportunities: "how do i find
  a therapist" (13,600–14,300/mo — matches the existing lead magnet, "5
  Things to Know Before Your First Counseling Session," a well-chosen
  topic already), "what do therapists do" (3,500/mo, KD 35).
- **Child & Teen Counseling** — hub keyword `child and teen therapy
  louisville ky` (no local volume). Real "near me" demand is enormous:
  `child therapists near me` 42,800/mo, `children's psychologist near
  me` 22,300/mo, `child psychologist` 25,500/mo, `teenage counseling
  near me` 13,900/mo, `child counselor near me` 12,000/mo — this is
  genuinely one of the highest-demand categories on the whole site; GBP
  work matters most here. Spoke topics: "children with anxiety" /
  "child with anxiety" (8,700/mo each, competitive KD 54–57 but real
  authority value), "signs my teenager needs therapy" framing.
- **Anxiety & Depression Counseling** — hub keyword `anxiety and
  depression therapy louisville ky`. Best near-me opportunity of the
  four: `anxiety therapist near me` 7,400/mo, KD only 32 — genuinely
  winnable, and the reason this one leans therapist specifically (vs.
  `anxiety and depression counseling near me` at only 50/mo). Also
  `counselor near me for anxiety and depression` (90/mo) as a secondary,
  natural variant.
- **Trauma & EMDR Counseling** — hub keyword `trauma and emdr therapy
  louisville ky`. **Best single find of the whole session: "dangers of
  emdr therapy" — 3,300/mo, KD only 10.** A direct, honest "Is EMDR
  Safe? What the Research Actually Says" post is a near-free ranking
  opportunity. Also "symptoms of childhood trauma in adulthood"
  (980/mo, KD 15). `EMDR therapist near me` has no clean volume number
  but real winnable Map Pack intent — small individual practices (DA
  7–13) rank successfully for it nationally.

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
- 301 redirect mapping from the current Squarespace URL structure before
  the domain swap.
- `UNSPLASH_ACCESS_KEY` was never set as an Edge Function secret on this
  project (README.md's setup step is optional and was deferred) — the
  Lead Magnets admin screen's live Unsplash search won't work until it
  is. Hero images have been sourced manually from unsplash.com instead
  in the meantime, which works fine for now but is slower.
- Sophie Bowman's real title needs confirming — "Student Intern" on the
  About page's team section vs. "Student Counselor" on the Child & Teen
  Counseling page's byline. Same person, inconsistent title on their own
  old site.

**Resolved (2026-09-03)**: therapist-vs-counselor is decided per page
(see the keyword table above); the hub/pillar pages use a new, distinct
`Service Hub` page type rather than reusing `Content Pillar`;
`PlanSteps` support was added directly to the new `ServiceHub.astro`
template. All three were open questions as of the last note, now closed.
