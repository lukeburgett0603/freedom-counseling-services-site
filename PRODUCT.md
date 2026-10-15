# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two co-equal audiences:

- **Prospective counseling clients** — people in Louisville, KY (in-person + telehealth) and Southern Indiana (telehealth only) searching for a therapist/counselor for themselves, their couple, their family, or their child/teen. Entry points include organic local search ("therapist louisville ky," "grief counselors louisville ky," etc.), the Google Business Profile, referrals, and blog content. Many are evaluating a sensitive, personal decision (individual/couples/family therapy, grief, trauma, anxiety/depression, faith-integrated counseling) and may be anxious, in distress, or comparing several practices. A distinct sub-segment is actively in crisis and needs the 988 Suicide & Crisis Lifeline disclosure to be easy to find, not just present.
- **Practice staff using the admin CMS** — the practice owner/director (Tony Gore), other counselors (Rhonda Gore, Staci Harrub, Sophie Bowman, Luke Burgett, plus a 6th counselor joining October 2026), and the managing agency (Counselor Marketing Co., which builds and operates the site on the practice's behalf under a rented/managed model). They log into `/admin` to manage leads/CRM, publish blog posts, edit page copy and business info (tier-gated), and — for individual counselors — self-service their own status/telehealth/modalities on their own profile page.

## Product Purpose

A marketing-and-intake website plus a lightweight practice-management admin for a real, ~20-year-old counseling practice (Freedom Counseling Services). Its job is to help a prospective client understand the practice's counselors and specialties, decide it's a good fit, and take a low-friction next step (submit an appointment request, optionally choosing a specific counselor, or download a lead magnet). On the admin side, it lets the practice see and act on those leads, keep the public site current without touching code, and lets individual counselors manage their own public-facing availability. Success is measured in real appointment-request submissions and, for admin, in leads not going stale (the CRM's follow-up tracking exists specifically to prevent that).

## Positioning

A full-spectrum, faith-friendly counseling practice with real depth most solo-practice competitors can't match: 5 counselors covering individual, couples/marriage, family, child/teen, Christian/faith-based, grief, anxiety/depression, and trauma/EMDR — plus 20+ years in business, both in-person (Louisville) and telehealth (Louisville + Southern Indiana) options, and an existing domain with real organic authority (DA 15, already ranking position #4 for "christian counseling louisville ky") rather than a from-scratch new site. Its counselor-selection flow (an opt-in "pick your counselor / help me choose" step on the lead form) is a real differentiator most single-location competitor sites don't offer.

## Operating Context

- Static site (Astro) built at deploy time from content stored in a per-client Supabase project; content edits require a rebuild (automatic via `publish-site` Edge Function calls from the admin, or manual `gh workflow run`).
- Hosted on GitHub Pages, currently reachable at the repo's GitHub Pages subdomain; the practice's real, already-indexed domain (`freedomcounselingservices.org`, currently a sparse Squarespace site) is planned to be migrated to point here, with 301 redirects required to protect existing search rankings.
- The practice's own real Wix site (`freedom-co-bba0e1ef-luke5391.wix-site-host.com`) was the content source for this rebuild and remains the reference for anything not yet ported.
- No insurance billing — the practice provides a Superbill for clients to seek their own reimbursement; this is a real, stated business fact that shapes Contact/FAQ copy.
- A CAN-SPAM-governed nurture-email sequence (4 emails over 14 days) exists for lead-magnet downloads but is not yet sending live — pending the practice owner's sign-off on DNS/Resend setup.
- Google Business Profile and other citations (Psychology Today, Yelp, Facebook, Nextdoor) are a known, separate lever for local visibility, with one confirmed NAP phone-number mismatch on Psychology Today still unresolved.
- The admin CMS enforces role-based content-permission tiers (an `owner` login may be restricted from editing certain fields depending on the client's plan) and a `linked counselor` self-service scope (a counselor's login can only edit their own availability/telehealth/modalities fields) — both are real, live constraints on who can change what, independent of the public site's design.

## Capabilities and Constraints

- Visitors can: browse 8 service-hub pages (each simultaneously an informational pillar and a bookable service), 5 counselor profile pages, 2 service-area pages (Louisville, Southern Indiana), a blog (10 posts across 6 categories), submit an appointment-request lead (optionally choosing a counselor), and download a gated lead magnet ("5 Things to Know Before Your First Counseling Session").
- Practice staff can: manage leads/CRM (notes, follow-up dates, status, archive/delete), publish blog posts via a rich-text editor, edit business info and (tier-gated) page copy, and — for a linked counselor login — edit their own availability status, telehealth flag, and modalities tags.
- Constraint: all page content is markdown-backed and fetched at build time — there is no live/dynamic rendering of content changes without a rebuild.
- Constraint: image assets go through Supabase Storage (public bucket) or Unsplash search (requires `UNSPLASH_ACCESS_KEY`, not yet configured for this project — hero images have been sourced manually from unsplash.com in the meantime).
- Constraint: real clinical/licensure facts (credentials, supervision status, specialties) must be accurate, not invented or embellished — several counselor-page facts (e.g. a student counselor's supervision language) are flagged in project notes as needing the practice's own confirmation before being treated as final.
- Open/undecided: whether to keep the homepage's overlay Hero style (client turned it on independently; not treated as a final design decision), and whether/how to round out each counselor bio with a Success/Failure StoryBrand beat (currently blank on all 5, by design, not by omission).

## Brand Commitments

- Real logo: an open-padlock mark forming the "O" in "FREEDOM," wordmark in Fraunces (serif) for the practice name, Inter (sans) for "COUNSELING SERVICES."
- Primary brand color: deep brick/maroon `#7B2714`. Secondary/accent: warm gold `#D3B894` (drawn from the wordmark, not originally captured in the CMS field). Supporting neutrals from the approved 2026-09-04 visual design brief: deep ink `#2B211C`, warm cream `#FAF6F0`.
- Typography: Fraunces for headings, Inter for body — both loaded as real Google Fonts (not system-font fallback).
- A signature visual motif — an open-arch shape — echoes the logo's padlock shackle and recurs as a section marker across the site (approved, live per the visual design brief).
- Tone: warm, credentialed, non-clinical-jargon-heavy; explicit ACA-conscious care around crisis-resource disclosure (988 Suicide & Crisis Lifeline) on Contact, Terms of Service, and nurture emails.
- A full, approved visual design brief exists at [freedom-counseling-services-visual-design-brief.md](freedom-counseling-services-visual-design-brief.md) (client-approved 2026-09-04) — treat it as the current design-system authority pending `/impeccable document`.

## Evidence on Hand

- Real business facts: address (800 Lily Creek Road, Suite 202, Louisville, KY 40243), phone ((502) 523-2970), 5 named counselors with real credentials, 20+ years in business, no insurance billing (Superbill only).
- Real, live content: all planned pages are content-complete — Home, About, Services Overview, 8 Service Hub pages, Counselors Overview, 5 Counselor Profiles, Blog Index + 10 real posts, 2 Service Area pages, Contact, Privacy Policy, Terms of Service.
- Real photography: 5 counselor headshots supplied by the client; hero/blog images sourced and verified individually from Unsplash (title/description/photographer checked before use, per project discipline).
- Real testimonials: one publicly-attributed Google review (Jessica Maza) on the homepage; one anonymized client quote on the Louisville service-area page (rendered visibly, never fed into Review/AggregateRating schema per standing policy).
- Real keyword research (Mangools) resolved a per-page "therapist" vs. "counselor" split with real local search-volume data — this is binding evidence for any future copy or on-page emphasis work, not a guess.
- Real SEO standing: domain `freedomcounselingservices.org` has Domain Authority 15 and already ranks position #4 organically for "christian counseling louisville ky" — an existing asset to protect during the eventual domain migration, not a blank slate.
- Absence to respect: no insurance-billing relationships, no analytics/cookies currently in use (Privacy Policy states this honestly), no confirmed accessibility standard beyond general best practice, and several counselor bio facts (Sophie Bowman's exact title, supervision-disclosure wording) are flagged as needing the practice's own confirmation rather than being treated as settled.

## Product Principles

- Never invent or embellish clinical/licensure facts, testimonials, reviews, or availability — this is a healthcare-adjacent site where accuracy is a trust and possibly legal issue, not just a content-quality one.
- Treat the public marketing site and the internal admin CMS as one product with two real, different audiences — a change to one should be evaluated against both, not just the visitor-facing half.
- Protect the practice's real, hard-won SEO position (content depth, schema correctness, existing domain authority) over any purely aesthetic convenience.
- Never let two calls-to-action compete on one view, and keep the appointment-request path (with its optional counselor-selection step) the site's clearest, least-friction action throughout.
- Crisis-resource visibility (988 disclosure) is a non-negotiable safety feature, not decorative copy — it must stay easy to find wherever emotional distress is discussed (Contact, Terms, nurture emails).
