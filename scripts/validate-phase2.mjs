import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';

const root = resolve(process.cwd());
const required = [
  'src/components/planner/PlannerApp.tsx',
  'src/components/planner/SpaceForm.tsx',
  'src/components/planner/ItemsForm.tsx',
  'src/components/planner/PreferencesForm.tsx',
  'src/components/planner/ProjectReview.tsx',
  'src/components/planner/DimensionPreview.tsx',
  'src/components/planner/FormFields.tsx',
  'src/components/planner/planner.css',
  'src/lib/project.ts',
  'src/lib/storage.ts',
  'src/lib/units.ts',
  'src/lib/validation.ts',
  'src/data/example-project.ts',
  'src/types/domain.ts',
];
const failures = [];
for (const file of required) {
  try { if (!(await stat(resolve(root, file))).isFile()) failures.push(`${file}: not a file`); }
  catch { failures.push(`${file}: missing`); }
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (!packageJson.scripts?.['validate:phase2']) failures.push('package.json missing validate:phase2');

const sourceFiles = [];
async function walk(dir) {
  for (const name of await readdir(dir)) {
    const path = resolve(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) await walk(path);
    else if (/\.(astro|ts|tsx|js|mjs)$/.test(name)) sourceFiles.push(path);
  }
}
await walk(resolve(root, 'src'));
for (const sourceFile of sourceFiles) {
  const text = await readFile(sourceFile, 'utf8');
  const label = relative(root, sourceFile);
  for (const match of text.matchAll(/(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.[^'\"]+)['\"]/g)) {
    const specifier = match[1];
    const base = resolve(sourceFile, '..', specifier);
    const candidates = [base, ...['.astro', '.ts', '.tsx', '.js', '.mjs', '.json', '.css'].map((extension) => base + extension), ...['index.astro', 'index.ts', 'index.tsx', 'index.js'].map((name) => resolve(base, name))];
    let found = false;
    for (const candidate of candidates) {
      try { if ((await stat(candidate)).isFile()) { found = true; break; } } catch {}
    }
    if (!found) failures.push(`${label}: unresolved relative import ${specifier}`);
  }
}

const planner = await readFile(resolve(root, 'src/components/planner/PlannerApp.tsx'), 'utf8');
for (const requiredToken of ['SpaceForm', 'ItemsForm', 'PreferencesForm', 'ProjectReview', 'loadProjectLocally', 'savePlannerSession']) {
  if (!planner.includes(requiredToken)) failures.push(`PlannerApp.tsx missing ${requiredToken}`);
}
const toolPage = await readFile(resolve(root, 'src/pages/tool.astro'), 'utf8');
const examplePage = await readFile(resolve(root, 'src/pages/example.astro'), 'utf8');
if (!toolPage.includes('<PlannerApp client:only="react"')) failures.push('tool.astro does not load PlannerApp as a React-only island');
if (!examplePage.includes('<PlannerApp example client:only="react"')) failures.push('example.astro does not load example mode');

const oldFoundation = resolve(root, 'src/components/planner/PlannerFoundation.tsx');
try { if ((await stat(oldFoundation)).isFile()) failures.push('obsolete PlannerFoundation.tsx still exists'); } catch {}

const storage = await readFile(resolve(root, 'src/lib/storage.ts'), 'utf8');
if (!storage.includes('localStorage')) failures.push('storage.ts does not use localStorage');
if (/fetch\(|axios|XMLHttpRequest/.test(storage)) failures.push('storage.ts contains an external network operation');

const limits = await readFile(resolve(root, 'src/lib/validation.ts'), 'utf8');
for (const token of ['maximumDimensionMm', 'maximumGapMm', 'itemDefinitions', 'quantity']) {
  if (!limits.includes(token)) failures.push(`validation.ts missing ${token} limit`);
}

if (failures.length) {
  console.error('Phase 2 validation failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Phase 2 source validation passed: ${required.length} required implementation files, relative imports, planner wiring, local storage, and validation limits checked.`);
