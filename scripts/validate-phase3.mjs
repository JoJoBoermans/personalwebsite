import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const root = resolve(process.cwd());
const required = [
  'src/lib/packing/engine.ts',
  'src/lib/packing/normalize.ts',
  'src/lib/packing/classify.ts',
  'src/lib/packing/scoring.ts',
  'src/lib/packing/metrics.ts',
  'src/lib/packing/explanations.ts',
  'src/lib/packing/messages.ts',
  'src/lib/packing/algorithms/maxrects.ts',
  'src/lib/packing/algorithms/shelf.ts',
  'src/lib/packing/__tests__/engine.test.ts',
  'src/components/planner/LayoutResults.tsx',
  'scripts/run-phase3-tests.mjs',
  'scripts/phase3-engine-check.cjs',
  'vitest.config.ts',
];
const failures = [];
for (const file of required) {
  try { if (!(await stat(resolve(root, file))).isFile()) failures.push(`${file}: not a file`); }
  catch { failures.push(`${file}: missing`); }
}
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
for (const script of ['validate:phase3', 'test', 'test:packing']) if (!packageJson.scripts?.[script]) failures.push(`package.json missing ${script}`);
if (!packageJson.devDependencies?.vitest) failures.push('package.json missing vitest');

const planner = await readFile(resolve(root, 'src/components/planner/PlannerApp.tsx'), 'utf8');
for (const token of ['packingEngine.generate', 'LayoutResults', 'Generate three layouts', "key: 'layouts'"]) if (!planner.includes(token)) failures.push(`PlannerApp.tsx missing ${token}`);
const engine = await readFile(resolve(root, 'src/lib/packing/engine.ts'), 'utf8');
for (const token of ['packMaxRects', 'packShelves', 'scoreForMode', "'compact'", "'easy-access'", "'balanced'"]) if (!engine.includes(token)) failures.push(`engine.ts missing ${token}`);
for (const file of ['src/lib/packing/engine.ts', 'src/lib/packing/algorithms/maxrects.ts', 'src/lib/packing/algorithms/shelf.ts']) {
  const text = await readFile(resolve(root, file), 'utf8');
  if (/fetch\(|axios|XMLHttpRequest|WebSocket/.test(text)) failures.push(`${file}: contains network access`);
}

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

if (failures.length) {
  console.error('Phase 3 validation failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
execFileSync('node', ['scripts/run-phase3-tests.mjs'], { cwd: root, stdio: 'inherit' });
console.log(`Phase 3 source validation passed: ${required.length} implementation/test files, planner wiring, local-only engine, imports, and executable engine scenarios checked.`);
