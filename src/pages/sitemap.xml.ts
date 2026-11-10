import type { APIRoute } from 'astro';
import { getSiteCollections } from '../lib/content';

// Public, indexable routes only. /styleguide is noindex and /call is a redirect, so both stay out.
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://jplepecki.tech');
  const data = await getSiteCollections();
  const paths = ['/', '/posts/', '/projects/', '/loop/', ...data.posts.map((post) => `/posts/${post.data.slug}/`)];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, base).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
