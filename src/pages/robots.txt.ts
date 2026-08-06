export const prerender = true;

export function GET({ site }: { site?: URL }) {
  const base = site ?? new URL('https://shelfsketch.example');
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /*?*',
    '',
    `Sitemap: ${new URL('/sitemap.xml', base).toString()}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
