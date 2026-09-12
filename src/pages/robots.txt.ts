import type { APIRoute } from 'astro';
import { withBase } from '../paths';

export const GET: APIRoute = ({ site }) => {
  const productionSite = site && !['example.com', 'localhost', '127.0.0.1'].includes(site.hostname) ? site : undefined;
  const sitemap = productionSite ? `\nSitemap: ${new URL(withBase('/sitemap.xml'), productionSite).href}\n` : '';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
