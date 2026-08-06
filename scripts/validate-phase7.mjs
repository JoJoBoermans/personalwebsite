import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = resolve(process.cwd());
const failures = [];
const warnings = [];
const required = [
  'playwright.config.ts',
  'tests/e2e/helpers.ts',
  'tests/e2e/core-flow.spec.ts',
  'tests/e2e/consent.spec.ts',
  'tests/e2e/accessibility.spec.ts',
  'tests/e2e/responsive.spec.ts',
  'scripts/check-built-site.mjs',
  'scripts/run-lighthouse.mjs',
  'scripts/validate-phase7.mjs',
  'src/components/planner/PlannerApp.tsx',
  'src/lib/storage.ts',
  'public/social/shelfsketch-og.png',
  'public/site.webmanifest',
  'netlify.toml',
  '.env.example',
];
for (const file of required) {
  try { if (!(await stat(resolve(root, file))).isFile()) failures.push(`${file}: not a file`); }
  catch { failures.push(`${file}: missing`); }
}

const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (!/^1\.0\.\d+$/.test(pkg.version)) failures.push('package.json must use a stable 1.0.x version');
for (const script of ['validate:phase7','check:dist','test:e2e','test:e2e:chromium','test:a11y','test:all','qa','lighthouse']) {
  if (!pkg.scripts?.[script]) failures.push(`package.json missing ${script}`);
}
for (const dependency of ['@astrojs/check','@axe-core/playwright','@playwright/test','chrome-launcher','lighthouse','typescript','vitest']) {
  if (!pkg.devDependencies?.[dependency]) failures.push(`package.json missing dev dependency ${dependency}`);
}
if (pkg.engines?.node !== '>=22.12.0') failures.push('Node engine must stay at >=22.12.0');
const nvm = (await readFile(resolve(root, '.nvmrc'), 'utf8')).trim();
if (!nvm.startsWith('22.')) failures.push('.nvmrc must pin Node 22 LTS');

const playwrightConfig = await readFile(resolve(root, 'playwright.config.ts'), 'utf8');
for (const token of ['chromium-desktop','firefox-desktop','webkit-mobile','trace:','screenshot:','webServer:']) if (!playwrightConfig.includes(token)) failures.push(`playwright.config.ts missing ${token}`);
const e2e = (await Promise.all(['helpers.ts','core-flow.spec.ts','consent.spec.ts','accessibility.spec.ts','responsive.spec.ts'].map((file) => readFile(resolve(root, 'tests/e2e', file), 'utf8')))).join('\n');
for (const file of ['playwright.config.ts','tests/e2e/helpers.ts','tests/e2e/core-flow.spec.ts','tests/e2e/consent.spec.ts','tests/e2e/accessibility.spec.ts','tests/e2e/responsive.spec.ts']) {
  const text = await readFile(resolve(root, file), 'utf8');
  const output = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }, fileName: file, reportDiagnostics: true });
  for (const diagnostic of output.diagnostics ?? []) if (diagnostic.category === ts.DiagnosticCategory.Error) failures.push(`${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
}
for (const token of ['Generate three layouts','Download project JSON','Reject analytics','AxeBuilder','horizontal overflow','Skip to main content']) {
  if (!e2e.includes(token)) failures.push(`E2E coverage missing ${token}`);
}

const planner = await readFile(resolve(root, 'src/components/planner/PlannerApp.tsx'), 'utf8');
const canvasSource = await readFile(resolve(root, 'src/components/planner/LayoutCanvas.tsx'), 'utf8');
if (!canvasSource.includes('role="group"') || canvasSource.includes('role="img"')) failures.push('Interactive SVG must expose a group role so its focusable children remain available to assistive technology');
if (!planner.includes('data-motion={project.preferences.reducedMotionOverride}')) failures.push('Planner does not apply the chosen motion preference');
const plannerCss = await readFile(resolve(root, 'src/components/planner/planner.css'), 'utf8');
for (const token of ['[data-motion="reduce"]','[data-motion="allow"]','prefers-reduced-motion: reduce']) if (!plannerCss.includes(token)) failures.push(`planner.css missing motion handling ${token}`);
if (/\.number-input-wrap > span[^}]+ink-500/s.test(plannerCss)) failures.push('Small unit labels use the low-contrast ink-500 token');

const storage = await readFile(resolve(root, 'src/lib/storage.ts'), 'utf8');
for (const token of ['parseProjectValue','try {','snapshotCompatible','clearShelfSketchStorage']) if (!storage.includes(token)) failures.push(`storage.ts missing ${token}`);
if (storage.includes('validateProject(parsed')) failures.push('Local project restoration bypasses strict project parsing');
const projectFile = await readFile(resolve(root, 'src/lib/io/project-file.ts'), 'utf8');
if (!projectFile.includes('export function parseProjectValue')) failures.push('project-file.ts does not expose the shared strict parser');

const netlify = await readFile(resolve(root, 'netlify.toml'), 'utf8');
for (const token of ['/_astro/*','Content-Security-Policy','X-Content-Type-Options','Permissions-Policy','Referrer-Policy']) if (!netlify.includes(token)) failures.push(`netlify.toml missing ${token}`);
const manifest = JSON.parse(await readFile(resolve(root, 'public/site.webmanifest'), 'utf8'));
if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) failures.push('web manifest must declare an icon');
if (manifest.start_url !== '/') failures.push('web manifest start_url must be /');

const og = await readFile(resolve(root, 'public/social/shelfsketch-og.png'));
if (og.length < 24 || og.toString('ascii', 1, 4) !== 'PNG') failures.push('social image is not a PNG');
else {
  const width = og.readUInt32BE(16);
  const height = og.readUInt32BE(20);
  if (width !== 1200 || height !== 630) failures.push(`social image is ${width}x${height}; expected 1200x630`);
}

const sourceFiles = [];
async function walk(dir) {
  for (const name of await readdir(dir)) {
    const path = resolve(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) await walk(path);
    else if (/\.(astro|ts|tsx|js|mjs|css)$/.test(name)) sourceFiles.push(path);
  }
}
await walk(resolve(root, 'src'));
const allSource = [];
for (const file of sourceFiles) {
  const text = await readFile(file, 'utf8');
  const label = relative(root, file);
  allSource.push(text);
  if (/console\.(?:log|debug)\s*\(|\bdebugger\b/.test(text)) failures.push(`${label}: debug output remains in production source`);
  if (/https?:\/\/(?!schema\.org|www\.googletagmanager\.com|www\.google-analytics\.com|region1\.google-analytics\.com|www\.w3\.org|www\.sitemaps\.org|shelfsketch\.example)/.test(text) && !label.includes('pages/privacy.astro')) warnings.push(`${label}: review external URL allowlist`);
}
const joined = allSource.join('\n');
if (/dangerouslySetInnerHTML/.test(joined)) failures.push('React source uses dangerouslySetInnerHTML');
if (/fetch\(|XMLHttpRequest|WebSocket|axios/.test(joined)) failures.push('Unexpected application network client detected');

const pages = sourceFiles.filter((file) => file.includes('/src/pages/') && extname(file) === '.astro');
const metadata = [];
for (const file of pages) {
  const text = await readFile(file, 'utf8');
  const title = text.match(/(?:BaseLayout|ToolLayout|GuideLayout)[^>]*\btitle="([^"]+)"/)?.[1];
  const description = text.match(/(?:BaseLayout|ToolLayout|GuideLayout)[^>]*\bdescription="([^"]+)"/)?.[1];
  if (!title) failures.push(`${relative(root, file)}: static page title not found`);
  if (!description) failures.push(`${relative(root, file)}: static meta description not found`);
  if (title && description) metadata.push({ file, title, description });
}
for (const field of ['title','description']) {
  const seen = new Map();
  for (const item of metadata) {
    const value = item[field];
    if (seen.has(value)) failures.push(`Duplicate ${field}: ${value}`);
    seen.set(value, item.file);
  }
}

const env = await readFile(resolve(root, '.env.example'), 'utf8');
for (const key of ['PUBLIC_SITE_URL','PUBLIC_GA4_ID','PUBLIC_OPERATOR_NAME','PUBLIC_OPERATOR_ADDRESS','PUBLIC_REGISTRATION_NUMBER','PUBLIC_CONTACT_EMAIL','PUBLIC_PRIVACY_EMAIL']) if (!env.includes(`${key}=`)) failures.push(`.env.example missing ${key}`);
if (env.includes('shelfsketch.example')) warnings.push('PUBLIC_SITE_URL still uses the documented non-production example domain');
const privacy = await readFile(resolve(root, 'src/pages/privacy.astro'), 'utf8');
for (const key of ['PUBLIC_OPERATOR_NAME','PUBLIC_OPERATOR_ADDRESS','PUBLIC_CONTACT_EMAIL','PUBLIC_PRIVACY_EMAIL']) if (!privacy.includes(key)) failures.push(`privacy.astro missing ${key}`);
if (privacy.includes('[Company') || privacy.includes('[contact')) failures.push('Bracketed legal placeholders remain in privacy page');

// Fixed palette pairs used for normal body text and controls.
function luminance(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map((part) => parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a, b) { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); }
for (const [label, fg, bg, threshold] of [
  ['body', '#53665f', '#f8f5ee', 4.5],
  ['heading', '#17241f', '#f8f5ee', 4.5],
  ['button', '#fffdf8', '#365f4d', 4.5],
  ['danger', '#9c3d2d', '#fffdf8', 4.5],
]) if (contrast(fg, bg) < threshold) failures.push(`${label} contrast is below ${threshold}:1`);

if (failures.length) {
  console.error('Phase 7 validation failed:\n- ' + [...new Set(failures)].join('\n- '));
  process.exit(1);
}
for (const phase of [1,2,3,4,5,6]) execFileSync('node', [`scripts/validate-phase${phase}.mjs`], { cwd: root, stdio: 'inherit' });
if (warnings.length) console.warn('Phase 7 launch notes:\n- ' + [...new Set(warnings)].join('\n- '));
console.log(`Phase 7 source QA passed: ${required.length} final QA files, release scripts, motion behavior, strict local restoration, security headers, metadata, social assets, consent/privacy configuration and colour contrast checked.`);
