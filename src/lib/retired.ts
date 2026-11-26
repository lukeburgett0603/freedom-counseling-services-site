// Archived pages (status 'archived', migration 0092): a counselor who
// left the practice, or a service only they provided. getPublishedPages()
// fills this registry on its first call each build, so every component
// can drop or unlink anything that still points at one. Nothing on the
// public site should ever link to an archived page; its old address
// renders a redirect page instead ([...slug].astro).
import type { Page } from './pages';

let retired: Page[] = [];
let paths = new Set<string>();

const norm = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}/`;

export function setRetiredPages(pages: Page[]): void {
  retired = pages;
  paths = new Set(pages.map((p) => norm(p.slug)));
}

export function retiredPages(): Page[] {
  return retired;
}

// Where an archived page's old address sends visitors: a counselor to the
// counselors page, a service to the services page, when those exist.
export function retiredRedirect(page: Page, published: Page[]): string {
  const overview = page.page_type === 'Counselor Profile' ? 'Counselors Overview' : 'Services Overview';
  const target = published.find((p) => p.page_type === overview);
  return target ? `/${target.slug}/` : '/';
}

// True for a site-relative link (with or without a #hash or ?query) to an
// archived page. External links and anchors are never retired.
export function isRetiredHref(href: string | null | undefined): boolean {
  if (!href || !paths.size || !/^\/(?!\/)/.test(href)) return false;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = href.split(/[?#]/)[0];
  return paths.has(norm(base && path.startsWith(`${base}/`) ? path.slice(base.length) : path));
}

// Rendered HTML with every link to an archived page reduced to its text,
// so a sentence still reads but leads nowhere that no longer exists. The
// sentence itself (often naming the person) is for the practice to
// rewrite; the admin's archive screen lists each one.
export function unlinkRetired(html: string): string {
  if (!paths.size) return html;
  return html.replace(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (whole, href: string, inner: string) =>
    isRetiredHref(href) ? inner : whole,
  );
}
