// Design id → page component (site system v2). Kept apart from site.ts
// because it imports .astro files, which the admin's browser code can't.
import Home from './home.astro';

export const DESIGN_COMPONENTS: Record<string, typeof Home> = {
  home: Home,
};
