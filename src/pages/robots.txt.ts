import type { APIRoute } from 'astro';
import { indexingEnabled } from '../data/production';
export const prerender = true;
export const GET: APIRoute = ({ site }) => new Response(indexingEnabled
  ? `User-agent: *\nAllow: /\nDisallow: /evidence/\nSitemap: ${new URL('sitemap.xml', site)}\n`
  : 'User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
