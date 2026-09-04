# Freedom Counseling Services — Visual Design Brief

Produced via the `counseling-website-designer` skill, redesign mode. This
site is on the **Supabase / GitHub Pages stack**, not Wix — the skill's own
`existing-site-redesign.md` reference names Wix for this client, which is
stale; corrected here (Astro + Tailwind, content in `pages`/`business`
tables, fetched at build time, deployed via GitHub Actions).

**Status: draft, pending your approval.** Nothing in this document has been
implemented. Sections marked "Recommended — pending approval" need
explicit sign-off before any code changes; everything else describes the
proposed system itself, which still isn't final until you approve the
brief as a whole.

---

## 0. The headline finding

Before any new direction: **the site's real, already-approved brand was
never actually wired into the live CSS.** `business.brand_colors`
(`#7B2714`) and `business.brand_fonts` (`Fraunces`, `Inter`) have held the
real values since the logo was uploaded, but `src/styles/global.css` is
still running the **generic template placeholder tokens** —
`--color-brand-primary: #1d4ed8` (blue), `--color-brand-accent: #f97316`
(orange), and `--font-heading`/`--font-body` both set to `"Inter"` with no
actual Google Fonts `<link>` anywhere in `BaseLayout.astro` (so even the
"Inter" being used is whatever the visitor's system falls back to, not a
guaranteed real Inter render). This is why the live site currently shows
an orange CTA button and a bold sans-serif heading instead of your real
maroon and Fraunces serif.

This isn't a matter of taste — it's an unfinished step from the original
build. Fixing it is close to a pure bug fix, not a discretionary design
choice, but it's still a real visual change to a live client site, so it's
included here for your approval rather than done silently.

**Also found while pulling the real logo file directly** (rather than
trusting the single recorded brand color): the logo itself uses **two**
brand colors, not one. `#7B2714` (deep maroon — recorded) and `#D3B894`
(warm gold/tan, used for "COUNSELING SERVICES" in the wordmark — **not**
currently recorded in `business.brand_colors`). Recommend adding it there
once this brief is approved, so it's captured as real brand data going
forward, not just baked into one image file.

**And a genuinely nice discovery**: the logo's pictorial mark is an **open
padlock** replacing the "O" in "FREEDOM" — and the open shackle is
literally an arch shape. That's not a coincidence I'm importing from a
generic template motif; it means the arch-motif system below (see §2)
isn't a borrowed idea grafted onto your brand, it's a direct visual echo
of a mark you already own.

---

## 1. Intake

- **Practice type**: group practice, 5 counselors (Tony Gore, Rhonda Gore,
  Staci Harrub, Sophie Bowman, Luke Burgett), each with their own profile
  page and a shared Counselors Overview grid.
- **Emotional register**: faith-based (Christian integration available but
  never forced, consistently across every page's copy), trauma-informed
  threads (grief, anxiety, trauma & EMDR are dedicated Service Hub pages),
  family-focused, warm-but-clinically-credible tone throughout — not
  corporate, not soft-focus wellness-brand.
- **Existing brand assets**: real logo (open-padlock mark + wordmark, two
  colors as above), two real brand fonts (Fraunces heading, Inter body).
  Treated as fixed constraints per the skill's own rule — this brief
  designs *around* them, never over them.
- **Differentiation**: no explicit "don't look like X" from the client.
  Real local competitors (from this repo's own keyword research in
  `NOTES.md`) are almost all small local practices with unremarkable,
  templated sites — there's no single competitor site worth designing
  against specifically.

---

## 2. Chosen system: Grounded Sanctuary

Drawn from `references/design-systems.md`, which names this system as the
closest fit for a faith-based, trauma-informed, family-focused practice —
solo or group. Adapted to Freedom's real brand rather than the system's
suggested placeholder hexes.

**Personality kept as-is**: warm, welcoming, unhurried — a quiet room, not
a waiting room. This already matches the tone of every page's real copy in
this repo (e.g. Contact's "You don't have to keep trying to figure this
out alone," every hub page's empathy-first opening section).

### Type system

- **Heading — Fraunces**, soft/optical-size variant, weights 400/500. This
  is the client's own real brand font and happens to be Grounded
  Sanctuary's own default heading choice — no adaptation needed here, it's
  already correct on paper, just not implemented.
- **Body — Inter**, weights 400/500. Client's real brand font, used in
  place of the system's suggested Karla, per the skill's own rule: when a
  client's real brand fonts exist, respect them over the curated system's
  defaults.
- **Modular scale**, ratio 1.25 (calm/editorial — matches the "unhurried"
  personality), from an 18px body base:

  ```
  14.4px  → micro-copy / labels / meta (dates, "2 min read")
  18px    → body
  22.5px  → lead paragraph / hero subhead
  28px    → H4
  35px    → H3
  44px    → H2
  55px    → H1 (round to 56px in implementation)
  ```

- Body copy columns constrained to ~65ch max-width (currently `.prose
  max-w-none` — needs a real max-width, see §5).

### Color system

Two real brand colors substituted into Grounded Sanctuary's role
structure, plus one new neutral the system needs that neither brand color
can serve on its own (a dark enough tone for the nav/footer band and body
text — the real gold is too light for that role, the real maroon is too
saturated/heavy to use as a large-area background):

| Role | Hex | Source |
|---|---|---|
| `background` (dominant, ~60%) | `#FAF6F0` | New — warm cream, harmonizes with the real gold family at high lightness |
| `surface` (cards) | `#FFFFFF` or `#FDFBF8` | New — barely-there lift off the cream background |
| `secondary` (~30% — nav, footer, section bands) | `#2B211C` | New — deep warm ink/espresso, not literally either brand color, but the structural dark neutral the system requires |
| `secondary-light` (light band alternative, for the Grounded Sanctuary sand↔sage rhythm) | `#D3B894` | **Real** — the gold from the logo, used as a light warm band instead of a dark one, since it isn't dark enough to host light text |
| `accent` (~10% — CTAs, links) | `#7B2714` | **Real** — the maroon, already recorded |
| `accent-hover` | `#5E1D0F` | New — ~15% darker than accent, for hover/pressed states |
| `text-primary` | `#2B211C` | Same as `secondary` — one ink color doing double duty |
| `text-on-accent` | `#FAF6F0` | Cream, for text/icons on the maroon accent |
| `border` | `#E5DACB` | New — a light warm neutral between background and secondary-light |

**Contrast**: `#2B211C` text on `#FAF6F0` background clears WCAG AA by a
wide margin (both very high and very low luminance). `#7B2714` accent on
`#FAF6F0` also clears AA comfortably for buttons/links. `#2B211C` text on
`#D3B894` (the gold band) — checked and clears AA for body-size text
(~7.4:1), so the gold band can carry real copy, not just decoration.
Cream text (`#FAF6F0`) on the `#2B211C` ink band clears AA easily (this is
the pairing the footer and any dark section band should use).

This means the site's alternating-band rhythm is **cream ↔ warm gold**
for most section transitions (both light, warmth carries the contrast
instead of a light/dark swap), with the **deep ink** reserved for the
footer and any single high-contrast band that needs real visual weight
(e.g. a stat/credibility band) — not used as the default alternating
partner, since two brand-light colors reads calmer and more "sanctuary"
than a light/dark checkerboard would.

---

## 3. Visual rhyming — the open-arch motif

Directly instantiated from the logo's own open-padlock shackle, per
`references/visual-rhyming-and-motifs.md`'s recurrence table:

| Point | Instantiation |
|---|---|
| **Hero** | Hero photography (Homepage, Service Hub, Service Area heroes) gets a soft arch top-crop instead of a hard rectangle — echoes the padlock shackle directly. |
| **Section intro** | Each major H2 section gets a small, thin open-arch line-icon (not filled) sitting above the heading, in the accent maroon — a quiet, consistent "this is a new chapter" signal, replacing nothing that exists today (no section-intro treatment currently exists). |
| **Cards** | Service Hub cards (Services Overview grid), Counselor cards (Counselors Overview grid), and Blog cards all get a soft arch-topped card shape — rounded top corners only (not all four), flat bottom — one consistent silhouette across all three card types. |
| **Divider** | An arch-shaped SVG divider between the cream and gold bands, replacing a hard horizontal edge — same shape as the card tops and hero crop, so the whole page reads as one family. |
| **Icon style** | One consistent thin-line (1.5px stroke) icon set, outline not filled, in ink or accent color depending on background — explicitly avoiding the brain/head-silhouette cliché `counseling-niche-patterns.md` flags. |
| **Photo treatment** | Arch-crop, applied via CSS `clip-path` on normally-rectangular source images (per the performance guardrail against pre-cropped asset variants) — see §6, this is the fix for the counselor-photo mismatch problem below. |
| **Footer** | A single, small, quiet open-arch mark (not the full logo) as a watermark-level footer accent — the quietest instantiation of the motif, echoing without repeating the header logo. |

---

## 4. Imagery & art direction

- **Color grade**: warm, slightly amber-graded — apply consistently to
  every photo on the site, including the 8 existing Unsplash hero photos
  and 5 counselor headshots, which currently have no consistent grade
  applied at all (each was sourced independently this session, verified
  for licensing/accuracy but not for a unified visual treatment).
- **Crop shape**: the arch-crop from §3, applied via CSS to every hero
  and card image. Counselor headshots specifically get a **consistent
  arch or circle crop, same aspect ratio, same framing distance** across
  all 5 — see the real problem this fixes in §6.
- **Posed vs. candid**: hero/service imagery stays candid and
  environmental (already true of the current Unsplash sourcing); counselor
  headshots stay direct-camera and posed, per the niche guidance that
  profile photos specifically warrant direct eye contact even in an
  otherwise-candid system.
- **Faith-based note**: per `imagery-art-direction.md`, no literal
  religious iconography needed in stock photography — the warmth of the
  grade and the arch motif (itself echoing a padlock/release theme fitting
  "Freedom") carry the tone.

---

## 5. Layout & hierarchy by page type

One hierarchy note + one asymmetry note per page type actually in use on
this site (10 page types, 34 live pages):

- **Homepage**: Headline → hero subhead → CTA → hero image, in that rank —
  currently roughly correct already. Asymmetry: hero image offset to one
  side rather than the current pattern, text column genuinely off-center
  rather than a 50/50 split.
- **About**: Photo/narrative block offset (studio-mcgee.com pattern from
  `inspiration-sources.md`) rather than a centered single column.
- **Services Overview / Counselors Overview / Service Areas Overview**:
  card grid is already the right structure — needs the arch-card
  treatment from §3 and real spacing-scale discipline (currently ad hoc
  Tailwind spacing utilities, not derived from a base-8 scale).
- **Service Hub** (8 pages — the main "wall of text" concern, see §6):
  currently Hero → byline → KeyTakeaways → single long-form `copy` block →
  PlanSteps → BlogPreview → Related → FAQ → CTA. The structure is sound;
  the problem is the "single long-form `copy` block" being one
  undifferentiated slab of text with only H3s breaking it up. See §6 for
  the specific recommendation.
- **Counselor Profile** (5 pages): currently a centered
  headshot-name-credentials block, then the same long-form-copy pattern.
  See §6 — this is the other page type most affected by the wall-of-text
  issue.
- **Blog Post / Blog Index**: Blog Index's featured-post + category-pill +
  grid structure is already good and doesn't need structural change, just
  the arch-card treatment. Blog Post's single-column long-form body is
  appropriate for an article page — no card treatment needed there, that
  page type is supposed to read like an article.
- **Service Area / Contact**: shorter pages, wall-of-text is less of a
  concern, but both get the arch-crop hero treatment and real card
  treatment for the FAQ-in-copy content (see §6).
- **Other** (Privacy Policy, Terms of Service): plain, no card treatment —
  these are legal reference pages, dense text is expected and appropriate
  here, explicitly excluded from the "de-wall-of-text" recommendations
  below.

---

## 6. Recommended structural changes — pending approval

This is the section that needs your explicit sign-off, item by item,
before anything is implemented. None of this is treated as decided yet.

### 6.1 The wall-of-text problem — what's actually causing it

Every Service Hub page and Counselor Profile page renders its entire
`copy` field as one Tailwind Typography `.prose` block — a single long
scroll of paragraphs with only inline H3s and bold text to break it up.
The content itself is good (real, specific, well-organized around real
H3-headed subsections) — the problem is purely presentational: nothing
currently gives a first-time skimmer a way to *see* that structure at a
glance, the way a card or callout box would.

**Recommendation**: don't rewrite or shorten any copy (not this skill's
job, and not needed — the content is right-sized). Instead, extract
specific *already-existing* structural pieces out of the flat `.prose`
flow into their own visually distinct components:

- **The FAQ section** (already a separate `pages.faqs` field on Service
  Hub pages, rendered via a real accordion component) is already handled
  correctly — no change needed there.
- **The "What this counseling can help with" bolded-list section**
  (present in every Service Hub page's `copy`, e.g. "Generalized anxiety
  and worry. Persistent worry that's hard to turn off...") is currently
  just bolded paragraph text inside the prose flow. Recommend converting
  this into a real card grid (2-column, arch-topped per §3) — same
  content, same copy, verbatim, just given its own visual container
  instead of sitting in the paragraph flow. This is a genuinely new,
  reusable pattern (`ConcernGrid.astro` or similar), not something that
  exists in the codebase today.
- **Counselor Profile pages' "Frequently Asked Questions" section**
  (currently bolded-question paragraphs inside `copy`, per the earlier
  session note explaining `CounselorProfile.astro` doesn't render a
  structured FAQ component) — recommend actually wiring the real `faqs`
  column + `FAQ.astro` accordion into `CounselorProfile.astro`, the same
  component already used elsewhere, rather than leaving this content
  flat. This requires moving each counselor's FAQ content from `copy`
  into the `faqs` column (a data migration, not a copy rewrite — the
  Q&A text itself doesn't change).
- **Counselor Profile pages' "What to expect in your first session"
  list** — currently a plain markdown ordered list inside `copy`.
  Recommend wiring the real `plan_steps` column + `PlanSteps.astro`
  component (again, already exists, already used on Service Hub and
  Homepage) into `CounselorProfile.astro`, same reasoning as above.
- **Pull-quotes** (already their own blockquote, already gets real visual
  treatment via the just-fixed CSS) — no change needed.

**What this means on the code side**: `CounselorProfile.astro` gains two
new component imports (`FAQ`, `PlanSteps`) it doesn't currently have, plus
a new small `ConcernGrid.astro` component (or a similar name) that both
`ServiceHub.astro` and `CounselorProfile.astro` would use for the
concerns/specialties list. This is exactly the kind of code-side
accommodation you asked me to handle — I'd build these components and
wire them in once this direction is approved, then migrate the affected
`faqs`/`plan_steps` data for Luke's page (and retroactively for the other
4 counselors, so all 5 are consistent) via the same disposable-
agency-session pattern used throughout this build.

### 6.2 Section-band rhythm (Grounded Sanctuary's own pattern, not an ad
hoc addition)

Recommend applying the cream↔gold alternating band rhythm (§2) to break
up long Service Hub pages specifically — e.g. the "Who this helps" /
"Approach" content sits on cream, "What this counseling can help with"
(now a card grid, per 6.1) sits on a gold band, FAQ sits back on cream.
This is the system's own established pattern (see `existing-site-
redesign.md`'s note: section-to-section color banding is fine when it's
the chosen system's own identity, which Grounded Sanctuary's is) rather
than a one-off "make this section pop" request.

### 6.3 Nothing else changes structurally

No CTA consolidation, no form relocation, no section reordering
recommended — the inventory in §7 didn't turn up any competing-CTA or
orphaned-form issue like the ones `existing-site-redesign.md` warns about.
Every page's existing CTA/LeadGenerator/LeadMagnet placement stays exactly
where it is.

---

## 7. Content & functional inventory (redesign-mode requirement)

34 live pages across 10 page types, pulled fresh from Supabase, not from
memory. Full page-by-page copy text isn't reproduced here (it's all real,
already-published content — see each page live, or its `pages.copy`
row) — this section exists to confirm every *functional* element is
accounted for before any layout change, per the skill's preservation
rule.

**Page types and counts**: Homepage (1), About (1), Services Overview (1),
Service Hub (8), Counselors Overview (1), Counselor Profile (5), Service
Areas Overview (1), Service Area (2), Blog Index (1), Blog Post (10),
Contact (1), Other/legal (2).

**Forms** — every page type that renders `LeadGenerator` keeps it exactly
as-is; no page currently has a second/competing form. Homepage is the one
page with two lead-capture surfaces (a compact hero-embedded card + the
full form further down) — both stay, per the exact pattern this skill's
reference file calls out as a common thing to accidentally drop.

**CTAs** — every page's `cta_heading`/`cta_button_text` stays exactly as
authored (e.g. Luke's page's deliberately distinct "Schedule With Luke"
vs. the other 4 counselors' "Start Counseling" — already a real,
intentional exception per this repo's own `NOTES.md`, not something to
"fix" into consistency).

**Structured fields already in real use and already accounted for above**:
`plan_steps` (8 Service Hub pages + Homepage), `faqs` (8 Service Hub
pages), `testimonial_quote`/`author` (Homepage — Jessica Maza, publicly
attributed; Louisville Service Area — anonymized). Per
`counseling-niche-patterns.md`'s own note: flagging this plainly, as
instructed — these are real testimonials already vetted earlier in this
project as ethically appropriate (public review / anonymized), not
something this brief is deciding on, but worth a plain flag per the
skill's standing rule.

---

## 8. Performance guardrails — resolved

- [x] Exactly 2 font families (Fraunces, Inter) — both need actual Google
      Fonts `<link>` tags added to `BaseLayout.astro`'s `<head>` (currently
      missing entirely), with `font-display: swap` and preconnect, matching
      the pattern CMC's own site already uses correctly.
- [x] No video in any hero — not in use, not recommended.
- [x] Motion limited to CSS scroll-reveals/hover states — no JS animation
      library needed for anything in this brief.
- [x] Arch crop shapes achievable via CSS `clip-path` on the existing
      rectangular source images — no new image assets/re-cropping needed.
- [x] One consistent SVG icon system (thin-line, 1.5px stroke, outline) —
      named explicitly, not left open-ended.

---

## 9. Niche differentiation check

- **Avoids forced stock photography clichés**: existing hero images
  (sourced and individually verified this session) are already
  environmental/candid rather than staged hand-holding or window-gazing
  shots — just need the consistent grade from §4, not new sourcing.
- **Avoids sterile clinical blue/white**: directly fixes this — the
  current *unbranded* placeholder state is exactly this cliché (blue
  primary, white background), which this brief replaces with the real
  warm maroon/gold/cream system.
- **Avoids a wall of undifferentiated credentials**: counselor
  credentials already get a consistent badge-style treatment
  (`credentials` field, styled subtitle under each name) — no change
  needed there, already correct.
- **Avoids brain/head-silhouette iconography**: the icon system (§3) is
  arch-based and functional (not literal mental-health iconography) by
  design.
- **Avoids competing CTAs**: confirmed in §7 — no competing-CTA issue
  found on this site.
- **Real trust signal this design gives more weight to**: the practice's
  own real mark (the padlock) becoming the site's actual recurring visual
  language, rather than a generic borrowed motif — this is the single
  biggest differentiation lever available here, and it's free (the mark
  already exists).

---

## 10. Design tokens summary (for implementation)

```css
@theme {
  --color-brand-primary: #7B2714;   /* real maroon — now primary/accent */
  --color-brand-secondary: #2B211C; /* new deep warm ink */
  --color-brand-accent: #7B2714;    /* same as primary in this system */
  --color-brand-neutral: #FAF6F0;   /* new warm cream */
  --color-brand-tint: #D3B894;      /* real gold — light band alternative */
  --color-brand-ink: #2B211C;

  --font-heading: "Fraunces", ui-serif, Georgia, serif;
  --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

Plus: real Google Fonts `<link>` tags for both families in
`BaseLayout.astro`, an arch-crop CSS utility class, a `ConcernGrid.astro`
component, and `FAQ`/`PlanSteps` wired into `CounselorProfile.astro` —
all pending approval of §6 above.
