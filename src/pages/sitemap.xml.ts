import type { APIRoute } from 'astro';
import { withBase } from '../paths';
import { searchEntries } from '../data/search';

const routes = searchEntries.map((entry) => entry.href);
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = ({ site }) => {
  const productionSite = site && !['example.com', 'localhost', '127.0.0.1'].includes(site.hostname) ? site : undefined;
  const urls = productionSite ? routes.map((route) => `<url><loc>${escapeXml(new URL(withBase(route), productionSite).href)}</loc></url>`).join('\n') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
