const ROUTES = [
  '/',
  '/tool/',
  '/example/',
  '/how-it-works/',
  '/measurement-guide/',
  '/guides/',
  '/guides/shelf-space-calculator/',
  '/guides/pantry-bin-planner/',
  '/guides/how-many-storage-bins-fit/',
  '/guides/storage-bin-size-guide/',
  '/guides/cabinet-storage-layout-planner/',
  '/about/',
  '/privacy/',
  '/cookies/',
  '/contact/',
  '/changelog/',
] as const;

export const prerender = true;

export function GET({ site }: { site?: URL }) {
  const base = site ?? new URL('https://shelfsketch.example');
  const lastmod = '2026-08-06';
  const urls = ROUTES.map((route) => `  <url>\n    <loc>${new URL(route, base).toString()}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
