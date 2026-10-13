// Design id → page component (site system v2). Kept apart from site.ts
// because it imports .astro files, which the admin's browser code can't.
import Home from './home.astro';
import Service from './service.astro';
import PageDesign from './page.astro';
import Profile from './profile.astro';
import Contact from './contact.astro';
import Article from './article.astro';
import Articles from './articles.astro';
import Legal from './legal.astro';

export const DESIGN_COMPONENTS: Record<string, typeof Home> = {
  home: Home,
  service: Service,
  page: PageDesign,
  profile: Profile,
  contact: Contact,
  article: Article,
  articles: Articles,
  legal: Legal,
};
