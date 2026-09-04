# Freedom Counseling Services — Client Notes

This file is **this repo only** — client-specific decisions and findings
that don't belong in the shared template. Never synced in either
direction — see `CLAUDE.md`'s "Where client-specific decisions get
written down" note.

## Content build progress (2026-09-03)

**Live (`status: content-complete`)**: Home, About, Services Overview,
all 8 Service Hub pages (Individual, Couples & Marriage, Family,
Child & Teen, Christian/Faith-Based, Grief, Anxiety & Depression,
Trauma & EMDR), Counselors Overview, 4 of 5 Counselor Profile pages
(Tony Gore, Rhonda Gore, Staci Harrub, Sophie Bowman), Blog Index, all
10 real Blog Posts, Service Areas Overview, and both Service Area pages
(Louisville, Southern Indiana).

**Service Area pages built (2026-09-03)**: Louisville's real copy
(office details, "how it works" 4-step list, real client testimonial)
ported from the Wix source's `/location` page. Southern Indiana has no
old-site equivalent — written new, honestly framed around telehealth-
only coverage (no physical office there) rather than inventing a local
presence. Real, well-known Southern Indiana cities (New Albany,
Jeffersonville, Clarksville) are named as genuine geography, not
fabricated landmarks — no specific claim beyond "these are the real
towns across the river" is made about them. **Reworked shortly after
first publish** — see below — to make the Kentucky-based framing even
more explicit and to anchor the page on real keyword data.

**Real template gap found and fixed while starting this page**:
`ServiceArea.astro` had no way to render `page.testimonial_quote`/
`testimonial_author`/`testimonial_role` at all, even though
`CLAUDE.md`'s own Service Area word-count guidance explicitly calls
for "local proof/testimonials" as expected content — the columns
already existed and `Homepage.astro` already rendered them via the
shared `Testimonial` component, `ServiceArea.astro` just never wired
it in. Fixed in the template repo, synced to this repo and CMC's
(CMC has no live Service Area pages yet, so no rebuild was needed
there — the fix just sits ready for whenever one exists).

**Word count note**: both pages ended up at ~700-725 words, short of
`CLAUDE.md`'s 800-1,500 Service Area range even after genuinely
expanding both with real content (who we see, first-visit logistics,
insurance/fees, a short local FAQ) rather than padding — a therapy
practice's location page just doesn't have as much genuinely unique
local material available as, say, a home-services business's would.
Chose real, non-repetitive substance over hitting the number exactly,
per `CLAUDE.md`'s own "don't pad to hit a number" rule.

**The real client testimonial used on Louisville's page is
anonymized** (`"— A Freedom Counseling Services client"` on the old
site, not a named individual) — stored as `testimonial_author: "A
Freedom Counseling Services Client"`, `testimonial_role: null`. Per
`CLAUDE.md`'s standing rule, this is rendered visibly but never fed
into `Review`/`AggregateRating` schema.

**Southern Indiana page reworked (2026-09-03), on explicit client
feedback**: the first draft read as if implying an Indiana presence
strongly enough that the client (who is also literally the practice's
real office location — Middletown, KY) flagged it directly: "the
Freedom office is located in Middletown, KY so it's not actually
located in Southern Indiana." Rewrote to lead every section with the
Louisville/Middletown-based framing explicit, added a dedicated closing
section explaining upfront why there's no Indiana office, and swapped
the vague `"telehealth counseling southern indiana"` focus_keyword for
the real, previously-researched `therapist new albany indiana`
(160/mo, KD 24 — see the resolved keyword table below) once double-
checked live via Mangools rather than trusted from memory.

**Real, re-verified finding**: `kwfinder_get_keyword_details` returned
no `search_volume` field at all for several of these hyper-local
phrases (`therapist new albany indiana`, `southern indiana therapist`)
— only `kwfinder_search_related_keywords` seeded on the *exact* phrase
surfaced the real number. Don't trust an empty/missing volume field
from `get_keyword_details` alone as proof a phrase has no volume for
small-town-level queries — cross-check with `search_related_keywords`
before concluding a term is unmeasurable. Jeffersonville and
Clarksville genuinely have no measurable volume either way (both tools
agree on that) — they're named in the page as real, accurate service
geography per the client's ask, but `therapist new albany indiana` is
the only one with real ranking data behind it, matching what the
already-resolved keyword table below already found.

**Also caught and fixed while re-verifying**: the Louisville page had
drifted from this same resolved table — it used `"counseling
louisville ky"` instead of the already-decided `"counselor louisville
ky"` (410/mo, deliberately distinct from the Homepage's `"therapist
louisville ky"` to avoid cannibalizing that stronger term — see the
cannibalization note below). Corrected `h1`/`meta_title`/
`focus_keyword` to match; the body copy already used "counselor"
naturally throughout, so no copy rewrite was needed there, just the
metadata.

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
- Child & Teen Counseling — Sophie Bowman (Student Counselor — resolved:
  her own Counselor Profile page confirms "Student Counselor" is
  current, see below)
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

**Not yet gathered**: Southern Indiana service area content (doesn't
exist on the old site — has to be written new).

**Blog posts published (2026-09-03)**: all 10 real posts ported from
`https://freedom-co-bba0e1ef-luke5391.wix-site-host.com/blog/...` —
title, full body copy, real author, and real `date_published` for
every one. Each post's "Read Next"/lead-magnet footer material was
dropped (handled dynamically by `BlogPost.astro`/`LeadMagnet.astro`,
not part of the ported copy). `category` was set to match each hub
page's `category` field exactly (`Couples & Marriage Counseling`,
`Child & Teen Counseling`, `Anxiety & Depression Counseling`, `Grief
Counseling`, `Trauma & EMDR Counseling`, `Christian / Faith-Based
Counseling` — 2 posts each in 5 of the 6 categories, 0 posts yet in
`Individual Counseling`/`Family Counseling`, matching the real site).
Hero images sourced and verified the same way as the Service Hub
batch — one candidate was rejected here too for inconsistent/
mismatched metadata (title said "man," tags said "woman," scene
unclear), not just misleading content, another real reason to always
read the full listing before using an Unsplash photo, not just the
filename-derived title.

**Real bug found and fixed while starting this batch, before writing
any post content**: `BlogPost.astro`'s "back to hub" link and
`schema.ts`'s Article/BlogPosting schema dispatch both only matched
`page_type === 'Content Pillar'` — since every one of this site's
category-owning pages is `Service Hub`, every post would have linked
back to nothing and none of the 8 hub pages would have gotten
Article/BlogPosting schema at all. Fixed in the template repo first,
then synced to this repo and CMC's (CMC doesn't use Service Hub today,
but keeping template code in sync everywhere is the standing
discipline) — see `CLAUDE.md`'s real-bugs list for the full writeup.
Also caught and backfilled a second, unrelated gap while syncing: CMC's
`BaseLayout.astro` was missing a `hasBlog` fix (BlogPosting vs. Article
schema type) that the template already had — a stale sync gap from
before this session, not something this batch introduced.

**Blog Index build note**: same nav-visibility gotcha as Services/
Counselors Overview — the page itself needed `h1`/`meta_description`/
`copy` and `content-complete` status before the featured post, category
pills, and post grid (all fully dynamic off `page_type = 'Blog Post'`,
no manual list) would render at all.

**Counselor headshots (2026-09-03)**: all 5 real photos (Tony Gore,
Rhonda Gore, Staci Harrub, Luke Burgett, Sophie Bowman) supplied by the
client, uploaded to Supabase Storage (`site-images/counselors/`), and
wired into each Counselor Profile page's `images.headshot`. Luke's and
Sophie's originals were oversized (2.1-2.4MB) — resized to 900px wide
via `sharp` (already a project dependency, no new install needed) before
upload; the other three were already reasonably sized. **Sophie
Bowman's photo is a graduation cap-and-gown shot, not a traditional
headshot** — flagged to the client before using it; explicit call:
use it as-is.

**Counselor bios published (2026-09-03)**: Tony, Rhonda, Staci, and
Sophie's full profile copy ported from each counselor's own real page at
`https://freedom-co-bba0e1ef-luke5391.wix-site-host.com/counselors/...`
— intro, specialties list, pull-quote, "Who X works with," "X's
approach," the 5-step "What to expect in your first session" list, and
the FAQ questions (with genuinely-written answers grounded in each
page's real body content, same reason as the Service Hub FAQs — the old
site's accordion answers weren't extractable from collapsed markup).
**`CounselorProfile.astro` doesn't render a FAQ or PlanSteps component**
(unlike Service Hub/Content Pillar) — so the FAQ content was folded
directly into `copy` as bolded-question paragraphs rather than written
to the structured `faqs` column, specifically to avoid generating
invisible `FAQPage` JSON-LD schema for content nobody can see (the same
class of bug flagged in `CLAUDE.md`'s real-bugs list) — check this same
thing before populating `faqs` or `plan_steps` on any other page type.
`credentials` was also normalized across all 4 to match the comma-
separated format already used in the Service Hub bylines (e.g. "MFT,
Life Coach" instead of the originally-scaffolded "Life Coach (MFT
trained)"). **Sophie Bowman's title is confirmed "Student Counselor"**
— her own real profile page uses this (resolving the earlier "Student
Intern" vs. "Student Counselor" flag in favor of the more specific,
authoritative source); her FAQ answer to "Are you a licensed counselor?"
states she's completing her clinical training under the practice's
licensed counseling staff's supervision — this specific supervision
language wasn't stated verbatim on the source site and should be
double-checked against the practice's actual real supervision structure
before this page is treated as final, since it's a genuine licensure
disclosure matter, not just marketing copy.

**Luke Burgett's own profile deliberately held back** — the source
site's real `/counselors` page itself lists his entry as "Counselor
profile coming soon," so this isn't inventing a gap, it's porting one
that already exists. Waiting on a real brandscript from Luke before
writing his page; his headshot is already uploaded and wired in
(`images.headshot`), so publishing his page later only needs `copy`/
`credentials`/`status` — no image work left to do.

**Counselors Overview build note**: same nav-visibility gotcha as
Services Overview — publishing this page (short intro + CTA, no
manually-curated list) was necessary for the 4 live Counselor Profile
pages to actually show up in the Counselors nav dropdown/grid. Luke's
still-placeholder page correctly does not appear in the grid — no code
change needed, since it's already filtered by `getAllPages()`'s
content-complete-only fetch, the same self-maintaining behavior as every
other dynamic grid on this site.

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
