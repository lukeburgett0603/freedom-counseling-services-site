# Site system v2: designs

A **hybrid build**: each page's layout is designed in code here, from the
section library in `src/components/site/`, while its words live in the
database by named block (`content_blocks`, migration 0078), so a practice
can edit text in the admin (Get chosen → Page text) without touching the
design. Decided 2026-10-12; first built for Freedom Counseling Services
(2026-10-13). Plan and quality gates: CMC folder,
`client-site-system/plan.md`.

## How a page gets a design

1. `site.ts`: map a page type (`DESIGN_BY_PAGE_TYPE`) or one slug
   (`DESIGN_BY_SLUG`) to a design id. Pages not mapped keep the older
   templates (`src/templates/`), unchanged. The template ships with
   nothing mapped.
2. `<id>.blocks.ts`: the design's text blocks (key, label, admin section,
   kind: text / rich / list / image, optional help, length hint,
   fallback). Register it in `DESIGN_BLOCKS` (site.ts).
3. `<id>.astro`: the design, reading blocks with `blockReader`. Register
   it in `components.ts`.
4. `content/blocks/<slug>.json`: the approved copy, loaded with
   `npm run blocks:seed` (fills empty blocks only; `--overwrite` before
   launch only). Service role key from the environment for that run only.

`DesignedPage.astro` picks the design and warns in the build log about
blocks with no stored text.

## What stays on `pages`

H1, meta title, meta description, focus keyword (search settings, with
their locks), FAQs (they feed FAQ structured data), counselor
credentials, headshot (`images.headshot`, with `focus` for crops), and
`session_rate_usd` (0079). Designs compute derived text from data, never
retype it: rate range (`{rate_range}` in block text), phone (`{phone}`),
hours and address (from `business`, the same values as the structured
data).

## Theme

`src/styles/site.css`: base styles and neutral default tokens.
`src/styles/theme.css`: this client's tokens (colors, fonts with
self-hosted `@font-face`, radii), from its approved design direction.
Fonts to preload go in `THEME_FONT_PRELOADS` (site.ts).

## Rules every design follows (taste skill, applied)

- Hero: eyebrow, H1 (2 lines on desktop), one short subhead, up to two
  buttons. No tagline under the buttons; facts go in a `FactsStrip`.
- No layout family twice on a page; never 3 image/text splits in a row;
  at most one small uppercase label per 3 sections.
- One accent color; one radius rule (buttons pill, cards 16 to 18px,
  inputs 10px); one light theme.
- Zero em-dashes in any text, code defaults included.
- Every page ends with `RequestPanel` (id `request`); every "Request an
  appointment" button links to `#request`.
- Real photos only (headshots, chosen stock); no client testimonials;
  the crisis line in the request panel and footer.
- Icons: Phosphor via `Ph.astro` only.
