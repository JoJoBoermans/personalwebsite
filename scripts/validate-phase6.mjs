import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const required = [
  'src/components/astro/ConsentManager.astro',
  'src/lib/analytics.ts',
  'src/pages/robots.txt.ts',
  'src/pages/sitemap.xml.ts',
  'src/pages/privacy.astro',
  'src/pages/cookies.astro',
  'src/pages/contact.astro',
  'src/pages/changelog.astro',
  'src/pages/how-it-works.astro',
  'src/pages/measurement-guide.astro',
  'src/pages/guides/shelf-space-calculator.astro',
  'src/pages/guides/pantry-bin-planner.astro',
  'src/pages/guides/how-many-storage-bins-fit.astro',
  'src/pages/guides/storage-bin-size-guide.astro',
  'src/pages/guides/cabinet-storage-layout-planner.astro',
];
const failures = [];
for (const file of required) {
  try { if (!(await stat(resolve(root, file))).isFile()) failures.push(`${file}: not a file`); }
  catch { failures.push(`${file}: missing`); }
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (!packageJson.scripts?.['validate:phase6']) failures.push('package.json missing validate:phase6');
if (!/^1\.0\.\d+$/.test(packageJson.version)) failures.push('package.json version must be a stable 1.0.x release');

const consent = await readFile(resolve(root, 'src/components/astro/ConsentManager.astro'), 'utf8');
for (const token of ['Reject analytics', 'Accept analytics', 'Manage preferences', 'shelfsketch.analytics-consent.v1', 'PUBLIC_GA4_ID', 'readConsent() !== \'granted\'', 'googletagmanager.com/gtag/js']) {
  if (!consent.includes(token)) failures.push(`ConsentManager.astro missing ${token}`);
}
const inlineScript = consent.match(/<script define:vars=\{\{ measurementId \}\}>([\s\S]*?)<\/script>/)?.[1] ?? '';
for (const forbidden of [' as HTMLElement', ' as HTMLDialogElement', 'type ConsentValue', ': string', 'unknown[]']) {
  if (inlineScript.includes(forbidden)) failures.push(`ConsentManager inline browser script contains TypeScript-only syntax: ${forbidden}`);
}
const acceptIndex = consent.indexOf('data-consent-accept');
const rejectIndex = consent.indexOf('data-consent-reject');
if (acceptIndex < 0 || rejectIndex < 0) failures.push('Consent manager must expose both accept and reject controls');

const baseLayout = await readFile(resolve(root, 'src/layouts/BaseLayout.astro'), 'utf8');
if (!baseLayout.includes('<ConsentManager />')) failures.push('BaseLayout does not include ConsentManager');
const footer = await readFile(resolve(root, 'src/components/astro/SiteFooter.astro'), 'utf8');
if (!footer.includes('Cookie settings') || !footer.includes('shelfsketch:open-cookie-settings')) failures.push('Footer cannot reopen cookie preferences');

const analytics = await readFile(resolve(root, 'src/lib/analytics.ts'), 'utf8');
const events = ['tool_viewed','tool_started','space_dimensions_completed','item_added','layout_generated','alternative_layout_viewed','item_rotated','layout_manually_edited','layout_exported','project_saved','project_imported','second_project_started','no_fit_result','measurement_error_shown','example_opened'];
for (const event of events) if (!analytics.includes(`'${event}'`)) failures.push(`analytics.ts missing ${event}`);
const plannerSources = [
  await readFile(resolve(root, 'src/components/planner/PlannerApp.tsx'), 'utf8'),
  await readFile(resolve(root, 'src/components/planner/LayoutResults.tsx'), 'utf8'),
  await readFile(resolve(root, 'src/components/planner/LayoutExportPanel.tsx'), 'utf8'),
].join('\n');
for (const event of events) if (!plannerSources.includes(`'${event}'`)) failures.push(`Planner components do not emit ${event}`);
const trackingCalls = [...plannerSources.matchAll(/trackEvent\([\s\S]*?\);/g)].map((match) => match[0]);
for (const prohibited of ['project.name', 'item.label', 'widthMm:', 'heightMm:', 'depthMm:']) {
  if (trackingCalls.some((call) => call.includes(prohibited))) failures.push(`Analytics call contains prohibited exact project data: ${prohibited}`);
}

const contentFiles = [
  ['measurement guide','src/pages/measurement-guide.astro',450],
  ['how it works','src/pages/how-it-works.astro',500],
  ['shelf space','src/pages/guides/shelf-space-calculator.astro',350],
  ['pantry planner','src/pages/guides/pantry-bin-planner.astro',350],
  ['bin quantity','src/pages/guides/how-many-storage-bins-fit.astro',350],
  ['size guide','src/pages/guides/storage-bin-size-guide.astro',350],
  ['cabinet planner','src/pages/guides/cabinet-storage-layout-planner.astro',350],
];
for (const [label, file, minimum] of contentFiles) {
  const text = await readFile(resolve(root, file), 'utf8');
  const plain = text.replace(/^---[\s\S]*?---/, '').replace(/<[^>]+>/g, ' ').replace(/\{[^}]*\}/g, ' ');
  const count = plain.trim().split(/\s+/).filter(Boolean).length;
  if (count < minimum) failures.push(`${label} is too thin: ${count} words, expected at least ${minimum}`);
  if (!text.includes('href="/tool/"') && !file.endsWith('how-it-works.astro')) failures.push(`${label} does not link to the tool`);
}

const privacy = await readFile(resolve(root, 'src/pages/privacy.astro'), 'utf8');
for (const token of ['Project measurements stay on the device', 'Optional analytics', 'Operator details pending configuration', 'Contact address pending configuration', 'Last updated']) if (!privacy.includes(token)) failures.push(`privacy.astro missing ${token}`);
const cookies = await readFile(resolve(root, 'src/pages/cookies.astro'), 'utf8');
for (const token of ['data-open-cookie-settings', 'Functional browser storage', 'No advertising cookies in the MVP']) if (!cookies.includes(token)) failures.push(`cookies.astro missing ${token}`);

const tool = await readFile(resolve(root, 'src/pages/tool.astro'), 'utf8');
for (const token of ["'WebApplication'", "'SoftwareApplication'", "'BreadcrumbList'", 'offers:']) if (!tool.includes(token)) failures.push(`tool.astro missing structured data token ${token}`);
const guideLayout = await readFile(resolve(root, 'src/layouts/GuideLayout.astro'), 'utf8');
for (const token of ["'Article'", "'BreadcrumbList'", 'dateModified']) if (!guideLayout.includes(token)) failures.push(`GuideLayout.astro missing ${token}`);

const sitemap = await readFile(resolve(root, 'src/pages/sitemap.xml.ts'), 'utf8');
for (const route of ['/tool/','/measurement-guide/','/guides/pantry-bin-planner/','/privacy/','/cookies/']) if (!sitemap.includes(`'${route}'`)) failures.push(`sitemap missing ${route}`);
const robots = await readFile(resolve(root, 'src/pages/robots.txt.ts'), 'utf8');
if (!robots.includes("Disallow: /*?*") || !robots.includes("'/sitemap.xml'")) failures.push('robots endpoint missing query exclusion or sitemap');

if (failures.length) {
  console.error('Phase 6 validation failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
execFileSync('tsc', ['-p', 'tsconfig.phase4-components.json'], { cwd: root, stdio: 'inherit' });
console.log(`Phase 6 source validation passed: ${required.length} required files, substantive content, consent gating, analytics contracts, structured data, sitemap, robots and strict planner TypeScript checked.`);
