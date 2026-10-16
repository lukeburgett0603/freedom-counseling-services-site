import type { APIRoute } from 'astro';

// IndexNow key file (https://www.indexnow.org). Search engines that use
// IndexNow (Bing, which also feeds Copilot and ChatGPT search, plus
// Yandex and others) fetch this to confirm a change notice really came
// from this site. The key isn't secret; it lives in the INDEXNOW_KEY
// repository variable, and scripts/indexnow-changes.mjs plus the deploy
// workflow send the notices. Empty when no key is set (feature off).
export const GET: APIRoute = () =>
  new Response(process.env.INDEXNOW_KEY ?? import.meta.env.INDEXNOW_KEY ?? '', { headers: { 'Content-Type': 'text/plain' } });
