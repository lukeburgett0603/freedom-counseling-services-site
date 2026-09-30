// Static exit export (scripts/export-static-site.mjs). When a practice
// leaves CMC it keeps its public website as plain static files, and those
// files must not depend on CMC's backend (Supabase functions, storage,
// analytics). The export script builds the site with PUBLIC_STATIC_EXPORT
// set, and every component that talks to CMC's backend checks this flag:
// LeadGenerator (swaps to a plain form or contact details), LeadMagnet
// (hidden), CTA (no click tracking), Footer (no Admin Login),
// BaseLayout (no Cloudflare beacon, no ad-click capture). Normal builds
// never set it.
export const STATIC_EXPORT = import.meta.env.PUBLIC_STATIC_EXPORT === 'true';

// Optional: where the exported contact form should post (e.g. a Formspree
// or Basin endpoint the practice sets up). Without it, the export shows
// the practice's phone and email instead of a form.
export const EXPORT_FORM_ACTION: string | null = import.meta.env.PUBLIC_EXPORT_FORM_ACTION || null;
