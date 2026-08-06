import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, dirname, join, extname } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist');
const failures = [];

try {
  if (!(await stat(dist)).isDirectory()) failures.push('dist does not exist. Run npm run build first.');
} catch {
  failures.push('dist does not exist. Run npm run build first.');
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

if (!failures.length) {
  const files = await walk(dist);
  const available = new Set(files.map((file) => '/' + relative(dist, file).replaceAll('\\', '/')));
  const htmlFiles = files.filter((file) => extname(file) === '.html');
  if (!htmlFiles.length) failures.push('No HTML files were built.');

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const page = '/' + relative(dist, file).replaceAll('\\', '/');
    if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${page}: missing title`);
    if (!/<meta name="description" content="[^"]+"/.test(html)) failures.push(`${page}: missing meta description`);
    if (!/<link rel="canonical" href="https?:\/\//.test(html)) failures.push(`${page}: missing absolute canonical`);
    if (html.includes('shelfsketch.example')) failures.push(`${page}: placeholder site URL remains in production build`);
    if (/\[(Company|contact|operator|address|registration|privacy)/i.test(html)) failures.push(`${page}: unresolved launch placeholder`);

    const links = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map((match) => match[1]);
    for (const link of links) {
      if (/^(?:https?:|mailto:|tel:|data:|blob:)/.test(link)) continue;
      const clean = link.split('?')[0];
      if (!clean?.startsWith('/')) continue;
      const candidates = clean.endsWith('/') ? [`${clean}index.html`] : [clean, `${clean}.html`, `${clean}/index.html`];
      if (!candidates.some((candidate) => available.has(candidate))) failures.push(`${page}: unresolved built asset or link ${link}`);
    }
  }
}

if (failures.length) {
  console.error('Built-site validation failed:\n- ' + [...new Set(failures)].join('\n- '));
  process.exit(1);
}
console.log('Built-site validation passed: HTML metadata, internal links, assets and launch placeholders checked.');
