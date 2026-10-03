import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// `site` gets overwritten per client repo once a domain is known
// (site: 'https://clientdomain.com'). Needed for correct canonical URLs,
// the generated sitemap, and the schema.org @id base used throughout
// src/lib/schema.ts.
//
// `base`: GitHub Pages serves a repo without a custom domain at
// `username.github.io/repo-name/`, not the root. Until this client has a
// custom domain, set `site` to `https://<username>.github.io` and `base`
// to `/<repo-name>` — every internal link already goes through
// src/lib/url.ts's withBase() to pick this up automatically. Once a custom
// domain is added, set `site` to that domain and `base` back to '/'.
//
// Freedom Counseling Services' real, already-indexed domain
// (freedomcounselingservices.org, DA 15, already ranking #4 for "christian
// counseling louisville ky") replaced the github.io placeholder 2026-09-09,
// migrating off the client's old Squarespace site. `site` is the **www**
// subdomain specifically, not the bare apex — every URL in the old
// Squarespace site's own sitemap.xml was under `www.`, so matching that
// exactly (rather than switching canonical forms on top of the whole
// platform migration) is what actually protects the existing ranking.
// GitHub Pages' `cname` setting (repo Settings → Pages) is set to the same
// www value — that's what makes GitHub issue the real cert for `www` and
// auto-redirect the bare apex to it with a true 301, not something this
// file controls.
//
// `redirects` below covers every old Squarespace URL that doesn't share
// this site's slug — GitHub Pages can't serve real server-side 301s (pure
// static hosting), so these render as Astro's static meta-refresh + JS
// redirect pages instead. If the domain is later put behind Cloudflare,
// add true 301 Redirect Rules there for the same paths (stronger
// ranking-equity signal); until then these are what protect the existing
// ranking from a hard 404 after cutover.
export default defineConfig({
  site: 'https://www.freedomcounselingservices.org',
  base: '/',
  trailingSlash: 'never',
  // Astro 7 changed the default to 'jsx' (React-style whitespace stripping),
  // which drops the space between adjacent inline elements (e.g. a word
  // and a following <a>/<strong>). `true` keeps Astro 5's HTML-aware
  // behavior — verified by diffing every page's visible text across the
  // v5 → v7 upgrade.
  compressHTML: true,
  redirects: {
    '/home': '/',
    '/our-counselors': '/counselors',
    '/services-and-fees': '/services',
    '/schedule-an-appointment': '/contact',
    '/appointment-inquiry': '/contact',
    '/location': '/contact',
    '/careers': '/contact',
    '/read-me-five': '/',
    // This one blog post's slug had a stray "blog/" prefix baked into it
    // (every other Blog Post row is a bare slug — see CLAUDE.md's "Blog
    // post slug typo" entry) — fixed at the data level, this redirect
    // just protects the ~2 months this URL was already live/indexable.
    '/blog/repairing-after-a-fight': '/repairing-after-a-fight',
    // Retired 2026-10-03 with the waiting-room review sign whose QR code
    // pointed here (see admin/review-program.astro). A sign still up in
    // the office lands on the homepage, with no review ask, instead of a
    // 404. Astro's static redirect page is noindex.
    '/share-your-experience': '/',
  },
  integrations: [
    sitemap({
      // /admin/* is the internal, auth-gated admin area — never
      // public/indexable pages. /share-your-experience is a redirect (see
      // `redirects` below), kept out explicitly in case a build lists it.
      filter: (page) => !page.includes('/admin') && !page.includes('/share-your-experience'),
    }),
  ],
  image: {
    // Stock photos (Unsplash) and any client-hosted logo/photo URLs are
    // fetched and optimized by astro:assets at build time rather than
    // linked to directly — see src/components/OptimizedImage.astro.
    remotePatterns: [{ protocol: 'https' }],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
