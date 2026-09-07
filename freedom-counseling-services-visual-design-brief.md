# Freedom Counseling Services — Visual Design Brief

Produced via the `counseling-website-designer` skill. **This is a revision
of the original brief approved 2026-09-04** (that brief's system choice,
color/type tokens, and the arch motif were implemented — see the commit
"Wire in the real approved brand: Fraunces, maroon/gold/cream, real
logo"). Updated in place per the skill's own rule, not replaced — the
original's real findings are preserved below, not discarded.

**Status: the 2026-09-07 additions are draft, pending approval.**
Everything under "§0 (2026-09-04, implemented)" through §7 is the
original, already-approved and already-built system. Section §8 onward is
this revision's new material from a live-site audit + your direct
feedback — that part needs sign-off before implementation.

---

## 0. The original headline finding (2026-09-04, implemented)

The site's real, already-approved brand had never actually been wired
into the live CSS — `global.css` was running generic placeholder tokens
(blue primary, orange accent) instead of the real recorded maroon and
Fraunces/Inter. Fixed as a near-pure bug fix, not a discretionary choice.

**Also found**: the logo uses **two** brand colors, not the one originally
recorded — `#7B2714` (maroon) and `#D3B894` (warm gold/tan, used in the
"COUNSELING SERVICES" wordmark, not previously in `business.brand_colors`).

**The real discovery that grounds everything else**: the logo's pictorial
mark is an **open padlock** replacing the "O" in "FREEDOM" — the open
shackle is literally an arch shape. The arch motif used sitewide isn't a
generic borrowed shape grafted on from the curated system's default — it's
a direct visual echo of a mark the practice already owns. Keep this as the
one fact every future revision of this brief should preserve; it's the
whole reason the motif works for this specific client rather than reading
as decoration.

## 1. Intake (2026-09-04)

- **Practice type**: group practice, 5 counselors, each with a profile
  page and a shared Counselors Overview grid.
- **Emotional register**: faith-based (Christian integration available,
  never forced), trauma-informed threads, family-focused, warm-but-
  clinically-credible — not corporate, not soft-focus wellness-brand.
- **Existing brand assets**: real logo (open-padlock mark + two-color
  wordmark), two real brand fonts. Fixed constraints, not proposals.

## 2. Chosen system: Grounded Sanctuary (2026-09-04, implemented)

Confirmed independently again during this revision's live-site audit —
the color choices already correctly implement this system; nothing about
the system choice itself needs to change.

**Type**: Fraunces (heading, 400/500, soft/optical-size variant) + Inter
(body, 400/500 — the client's real recorded brand font, kept over the
system's suggested Karla per the skill's "respect real brand fonts" rule).
Modular scale, ratio 1.25, from an 18px body base:

```
14.4px → micro-copy / labels / meta
18px   → body
22.5px → lead paragraph / hero subhead
28px   → H4
35px   → H3
44px   → H2
56px   → H1
```

**Color roles**:

| Role | Hex | Source |
|---|---|---|
| Background (dominant, ~60%) | `#FAF6F0` | New — warm cream |
| Surface (cards) | `#FFFFFF` / `#FDFBF8` | New |
| Secondary (~30% — nav, footer, bands) | `#2B211C` | New — deep warm ink |
| Secondary-light (light band alternative) | `#D3B894` | Real — logo gold |
| Accent (~10% — CTAs, links) | `#7B2714` | Real — logo maroon |
| Text-primary | `#2B211C` | Same as secondary |
| Text-on-accent | `#FAF6F0` | Cream on maroon |

**Contrast** (checked, not assumed): ink-on-cream, cream-on-ink, and
maroon-on-cream all clear WCAG AA by a wide margin. Ink-on-gold clears AA
for body-size text too (~7.4:1) — **the gold band was specifically
designed to carry real copy, not just serve as decoration**, which
matters for §9 below.

**The originally-specified band rhythm**: cream ↔ warm gold for most
section transitions (both light — warmth carries the contrast instead of
a light/dark swap), with **deep ink reserved for the footer and one
single high-contrast band per page that needs real weight** — deliberately
not used as the default alternating partner, "since two brand-light colors
reads calmer and more 'sanctuary' than a light/dark checkerboard would."
**This revision's live audit found the site has drifted from this** — see
§9.

## 3. Visual rhyming — the open-arch motif (2026-09-04, partially implemented)

| Point | Original spec | Live today (this revision's audit) |
|---|---|---|
| Hero | Soft arch top-crop on hero photography | **Not implemented** — hero photos are plain rectangles |
| Section intro | Small open-arch mark above **each major H2** | **Over-applied** — currently fires on every H3 too, not just H2 |
| Cards | Soft arch-topped cards (rounded top corners only) across Service/Counselor/Blog cards | **Not implemented** — cards use uniform 4-corner radius |
| Divider | Arch-shaped SVG divider between cream/gold bands | **Not implemented** |
| Icon style | One consistent thin-line (1.5px) outline set | Mostly N/A — site stays icon-light (numbers, `+`, a status dot), which is fine |
| Photo treatment | Arch-crop via CSS `clip-path`, consistent across counselor headshots | **Not implemented** — headshots use a plain circle crop, hero/scene photos are plain rectangles |
| Footer | A small, quiet open-arch watermark | **Not implemented** |

## 4. Imagery & art direction (2026-09-04)

Warm, slightly amber-graded color treatment across all photos — not yet
applied consistently (each hero photo was sourced independently, verified
for licensing/accuracy but not for a unified grade). Candid/environmental
for hero and service imagery; direct-camera and posed for counselor
headshots specifically. No literal religious iconography needed — the
arch motif and warm grade carry the "Freedom" theme without being literal
about it.

## 5. Layout & hierarchy by page type (2026-09-04, mostly implemented)

The "wall of text" problem this originally flagged on Service Hub and
Counselor Profile pages — flat `.prose` copy with no visual separation —
**has been substantially fixed since**: `plan_steps`/`faqs` are now real
structured columns rendered via `PlanSteps.astro`/`FAQ.astro` on both page
types (built in the Counselor Profile header card work and the Service
Hub build), and the StoryBrand section split (built 2026-09-07, see
`CLAUDE.md`) further broke Counselor Profile/Homepage/Service Page copy
into distinct fields. **Correction (2026-09-07): the one piece the original
brief called outstanding is actually already done.** `ServiceHub.astro`
line 77 already renders `<FeatureGrid items={page.concerns} heading="What
this can help with" tint />`, and every one of Freedom's 8 Service Hub
pages already has 6 real concerns populated — confirmed both in the
template source and by loading the live `individual-counseling` page,
where "What this can help with" renders as six real card entries (Anxiety
and depression, Grief and loss, Life transitions, Identity and
self-esteem, Perfectionism and overwhelm, Spiritual concerns), not a
bolded list. The original brief's "not wired in yet" note was stale by
the time this revision was written — it was true on 2026-09-04, but
`FeatureGrid`/`concerns` was wired into `ServiceHub.astro` sometime after
that, before this redesign pass started. No work needed here.

## 6. Recommended structural changes — pending approval (2026-09-04 list, current status)

1. Arch-crop hero/photo treatment — **not done, still recommended**.
2. Card grid for Service Hub's "what this can help with" content, via the
   now-existing `FeatureGrid`/`concerns` — **not done, still recommended**
   (superseded in approach: no new `ConcernGrid.astro` component needed,
   the generic one already exists).
3. Counselor Profile FAQ/PlanSteps wired to real components — **done**.
4. Cream↔gold band rhythm, dark ink reserved for footer + one band only —
   **drifted, see §9**.

## 7. Performance guardrails / niche differentiation (2026-09-04)

Google Fonts loading — superseded by `business.google_fonts_url`, built
later and already correctly wired (see `CLAUDE.md`'s "Real webfont
loading" section) — this specific original TODO is resolved, just via a
different, more general mechanism than originally proposed. Everything
else in the original checklist (no video hero, CSS-only motion, CSS-only
arch crops, one icon system, no brain/head-silhouette cliché, no forced
stock-photo cliché) still holds and needs no revision.

---

## 8. This revision (2026-09-07): live-site audit + real bugs found

Content & functional inventory re-confirmed against live Supabase data
(34 pages, 12 types) — no changes to the original's §... findings there;
full inventory detail was delivered in chat during this pass rather than
reproduced here a second time.

**Two real bugs found and already fixed** (template-level, synced to
Freedom + CMC, typechecked and built clean):

- `LeadGenerator.astro`'s default heading/button text was a generic
  leftover ("Let's talk about your project" / "Send") that leaked onto
  every bottom lead form except Homepage's, which was the only call site
  passing real overrides. Every template now passes the page's own
  `cta_button_text`.
- `PlanSteps.astro` hardcoded a 3-column grid regardless of item count,
  stranding a 4th step alone on its own row on every page with exactly 4
  steps (Homepage, most Service Hub pages, both Service Areas). Now uses
  a 4-column layout specifically when there are 4 steps.

## 9. The band-rhythm drift (new finding, ties directly to §2/§6 above)

Live audit of the Homepage found the section sequence runs: cream → cream
→ **tan** (testimonial, full-bleed) → cream → cream → **maroon** (CTA,
full-bleed) → **dark ink** (lead magnet, full-bleed) — three full-
saturation bands in fairly quick succession. This is a direct drift from
§2's own already-approved guidance ("deep ink reserved for the footer and
**one** single high-contrast band... not used as the default alternating
partner"). The fix isn't a new color decision — it's re-applying the
original rule: **recommended, pending approval** — constrain the
testimonial to an inset card (light gold tint, not full-bleed), reserving
genuine full-bleed treatment for the CTA and lead magnet only, the two
moments per page that should actually carry that much weight.

## 10. Arc motif — restore the original scope, don't invent a new one

Per your direct feedback that the arc reads as redundant on lighter pages:
this is the original spec reasserting itself, not a new restriction.
**Recommended, pending approval**: restrict `.prose h3::before` back to
`.prose h2::before` only, exactly as §3 originally specified — H3-level
sub-headings (like "Find Peace," "Gain Clarity," "Move Toward Hope" inside
one StoryBrand section) shouldn't each get their own arch; only genuine
major H2 section openings should.

## 11. The three-item benefit lists need a real card treatment

"Find Peace / Gain Clarity / Move Toward Hope" (Homepage's Success
section) is structurally identical to "Why families choose us"
(`FeatureGrid`, rendered directly above it) — a short list of 3–4 benefit
statements — but currently renders as three plain stacked paragraphs
instead of cards. Same underlying issue as §5/§6.2's Service Hub finding:
content that should get `FeatureGrid`'s card treatment is still sitting in
flowing prose. **Recommended, pending approval**: apply the same card
pattern here, and anywhere a similar short list appears inside a
`storybrand_success`/`storybrand_pitch` field.

## 12. Hero style: three inconsistent treatments across the site

Live audit found three different hero treatments in use with no
deliberate rule governing which page type gets which: the full-bleed
**overlay** style (Homepage, About), the plain stacked **default** style
(all 8 Service Hub pages, both Service Areas, and every overview/utility
page), and Counselor Profile's own bordered header card (a justified,
separate pattern, no change needed there). **Recommended, pending
approval**: keep overlay reserved for Homepage/About specifically — the
site's two "front door" pages — rather than extending it to all 8 Service
Hub pages, which would dilute the exact thing that makes it work as a
first impression. Instead, refine the *default* hero (arch photo-crop,
consistent base-8 spacing) so it reads as a deliberately lighter sibling,
not an unfinished older version of the overlay style.

## 13. Updated design-tokens summary

No changes to hex values or font families from §2/§10's original table —
this revision only touches CSS *scope* (arc selector, band widths, hero
refinement) and component wiring (`FeatureGrid` into Service Hub and the
Success-beat card treatment), not the underlying tokens themselves.

## Recommended structural changes — consolidated, pending approval

**Correction (2026-09-07, before implementation started):** the original
list's item 2 ("wire `FeatureGrid`/`concerns` into Service Hub") is
already done — see §5 above. Dropped from the active list below; approved
work proceeds on the remaining 7.

From the original brief, still outstanding:
1. Arch-crop CSS treatment for hero/scene photos and counselor headshots.
2. Arch-shaped divider between major section-color transitions.
3. A small footer arch watermark.

New from this revision:
4. Restrict the arc motif back to H2 only (restoring the original scope).
5. Constrain the testimonial to an inset card instead of full-bleed,
   restoring the original "one high-contrast band per page" rule.
6. Apply `FeatureGrid`'s card treatment to the Homepage Success section's
   3-item list (and any similar list inside a StoryBrand field).
7. Keep overlay hero reserved for Homepage/About; refine the default hero
   instead of extending overlay everywhere.

Nothing above is implemented yet except the two bug fixes in §8, which
were bugs, not design decisions, and didn't need separate sign-off.
