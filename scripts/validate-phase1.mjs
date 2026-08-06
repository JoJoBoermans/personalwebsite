import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';

const root = resolve(process.cwd());
const required = [
  'package.json','astro.config.mjs','tsconfig.json','netlify.toml','.nvmrc',
  'public/favicon.svg','public/site.webmanifest','public/social/shelfsketch-og.png','src/pages/robots.txt.ts','src/pages/sitemap.xml.ts',
  'src/layouts/BaseLayout.astro','src/layouts/GuideLayout.astro','src/layouts/ToolLayout.astro',
  'src/components/astro/SiteHeader.astro','src/components/astro/SiteFooter.astro','src/components/astro/SeoHead.astro',
  'src/components/planner/PlannerApp.tsx','src/pages/index.astro','src/pages/tool.astro','src/pages/example.astro',
  'src/pages/how-it-works.astro','src/pages/measurement-guide.astro','src/pages/guides/index.astro','src/pages/about.astro',
  'src/pages/privacy.astro','src/pages/cookies.astro','src/pages/contact.astro','src/pages/changelog.astro','src/pages/404.astro'
];
const failures = [];
for (const file of required) {
  try { if (!(await stat(resolve(root,file))).isFile()) failures.push(`${file}: not a file`); }
  catch { failures.push(`${file}: missing`); }
}

for (const jsonFile of ['package.json','public/site.webmanifest','examples.project.json','schemas/shelfsketch-project.schema.json']) {
  try { JSON.parse(await readFile(resolve(root,jsonFile),'utf8')); }
  catch (error) { failures.push(`${jsonFile}: invalid JSON (${error.message})`); }
}

const packageJson = JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
for (const script of ['dev','build','check','validate:phase1']) {
  if (!packageJson.scripts?.[script]) failures.push(`package.json missing script ${script}`);
}
for (const dependency of ['astro','@astrojs/react','react','react-dom']) {
  if (!packageJson.dependencies?.[dependency]) failures.push(`package.json missing dependency ${dependency}`);
}

const pages=[];
async function walk(dir){
  for(const name of await readdir(dir)){
    const p=resolve(dir,name); const s=await stat(p);
    if(s.isDirectory()) await walk(p); else if(extname(name)==='.astro') pages.push(p);
  }
}
await walk(resolve(root,'src/pages'));

const expectedRoutes = [
  'index.astro','tool.astro','example.astro','how-it-works.astro','measurement-guide.astro','guides/index.astro',
  'guides/shelf-space-calculator.astro','guides/pantry-bin-planner.astro','guides/how-many-storage-bins-fit.astro',
  'guides/storage-bin-size-guide.astro','guides/cabinet-storage-layout-planner.astro','about.astro','privacy.astro',
  'cookies.astro','contact.astro','changelog.astro','404.astro'
];
for(const route of expectedRoutes){
  if(!pages.some(p=>relative(resolve(root,'src/pages'),p)===route)) failures.push(`missing route source ${route}`);
}

const knownRoutes = new Set(expectedRoutes.map((route) => {
  if (route === 'index.astro') return '/';
  if (route === '404.astro') return '/404.html';
  const clean = route.replace(/index\.astro$/, '').replace(/\.astro$/, '');
  return `/${clean}`.replace(/\/+/g,'/').replace(/([^/])$/, '$1/');
}));
const publicFiles = new Set();
async function walkPublic(dir){
  for(const name of await readdir(dir)){
    const p=resolve(dir,name); const s=await stat(p);
    if(s.isDirectory()) await walkPublic(p); else publicFiles.add('/'+relative(resolve(root,'public'),p).replaceAll('\\','/'));
  }
}
await walkPublic(resolve(root,'public'));

for (const page of pages) {
  const text=await readFile(page,'utf8');
  const label=relative(root,page);
  if (!text.startsWith('---')) failures.push(`${label}: missing Astro frontmatter opening`);
  if ((text.match(/^---$/gm) ?? []).length < 2) failures.push(`${label}: incomplete Astro frontmatter`);
  if (text.includes('href=""') || text.includes("href=''")) failures.push(`${label}: contains an empty href`);
  if (text.includes('href="#"')) failures.push(`${label}: contains placeholder href="#"`);
  for (const match of text.matchAll(/href=["'](\/[A-Za-z0-9_\-./]+)["']/g)) {
    const href=match[1];
    if (href.startsWith('/social/') || href.startsWith('/favicon') || href.startsWith('/site.webmanifest')) {
      if (!publicFiles.has(href)) failures.push(`${label}: unresolved public href ${href}`);
    } else if (!knownRoutes.has(href) && !publicFiles.has(href)) {
      failures.push(`${label}: unresolved internal href ${href}`);
    }
  }
}



const sourceFiles=[];
async function walkSource(dir){
  for(const name of await readdir(dir)){
    const p=resolve(dir,name); const s=await stat(p);
    if(s.isDirectory()) await walkSource(p); else if(/\.(astro|ts|tsx|js|mjs)$/.test(name)) sourceFiles.push(p);
  }
}
await walkSource(resolve(root,'src'));
for (const sourceFile of sourceFiles) {
  const text=await readFile(sourceFile,'utf8');
  const label=relative(root,sourceFile);
  for (const match of text.matchAll(/(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.[^'\"]+)['\"]/g)) {
    const specifier=match[1];
    const base=resolve(sourceFile,'..',specifier);
    const candidates=[base, ...['.astro','.ts','.tsx','.js','.mjs','.json'].map(ext=>base+ext), ...['index.astro','index.ts','index.tsx','index.js'].map(name=>resolve(base,name))];
    let found=false;
    for (const candidate of candidates) { try { if ((await stat(candidate)).isFile()) { found=true; break; } } catch {} }
    if (!found) failures.push(`${label}: unresolved relative import ${specifier}`);
  }
}

const config = await readFile(resolve(root,'astro.config.mjs'),'utf8');
if (!config.includes("output: 'static'")) failures.push('astro.config.mjs must use static output');
if (!config.includes('react()')) failures.push('astro.config.mjs must register the React integration');
const netlify = await readFile(resolve(root,'netlify.toml'),'utf8');
if (!netlify.includes('command = "npm run build"') || !netlify.includes('publish = "dist"')) failures.push('netlify.toml has incorrect build settings');

if(failures.length){
  console.error('Phase 1 validation failed:\n- '+failures.join('\n- '));
  process.exit(1);
}
console.log(`Phase 1 source validation passed: ${required.length} required files, ${pages.length} Astro routes, internal links, JSON files, and deployment configuration checked.`);
