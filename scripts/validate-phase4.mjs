import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = resolve(process.cwd());
const required = [
  'src/components/planner/LayoutCanvas.tsx',
  'src/components/planner/LayoutEditorControls.tsx',
  'src/components/planner/LayoutTextSummary.tsx',
  'src/components/planner/LayoutResults.tsx',
  'src/lib/editor/contracts.ts',
  'src/lib/editor/geometry.ts',
  'src/lib/editor/history.ts',
  'src/lib/editor/operations.ts',
  'src/lib/editor/index.ts',
  'src/lib/editor/__tests__/operations.test.ts',
  'scripts/run-phase4-tests.mjs',
  'scripts/phase4-editor-check.cjs',
  'tsconfig.phase4-test.json',
];
const failures = [];
for (const file of required) {
  try { if (!(await stat(resolve(root, file))).isFile()) failures.push(`${file}: not a file`); }
  catch { failures.push(`${file}: missing`); }
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
for (const script of ['validate:phase4', 'test:editor', 'test:phase4-runtime']) if (!packageJson.scripts?.[script]) failures.push(`package.json missing ${script}`);

const results = await readFile(resolve(root, 'src/components/planner/LayoutResults.tsx'), 'utf8');
for (const token of ['LayoutCanvas', 'LayoutEditorControls', 'LayoutTextSummary', 'undoHistory', 'redoHistory', 'role="tablist"']) {
  if (!results.includes(token)) failures.push(`LayoutResults.tsx missing ${token}`);
}
const canvas = await readFile(resolve(root, 'src/components/planner/LayoutCanvas.tsx'), 'utf8');
for (const token of ['<svg', 'role="group"', 'onPointerDown', 'onPointerMove', 'onPointerUp', 'onKeyDown', 'tabIndex={0}', 'measure-arrow']) {
  if (!canvas.includes(token)) failures.push(`LayoutCanvas.tsx missing ${token}`);
}
const controls = await readFile(resolve(root, 'src/components/planner/LayoutEditorControls.tsx'), 'utf8');
for (const token of ['Move', 'Rotate on base', 'Remove from layout', 'Undo', 'Redo', 'Reset layout']) {
  if (!controls.includes(token)) failures.push(`LayoutEditorControls.tsx missing ${token}`);
}
const css = await readFile(resolve(root, 'src/components/planner/planner.css'), 'utf8');
for (const token of ['.layout-canvas', '.canvas-item:focus-visible', 'touch-action: none', '@media (prefers-reduced-motion: reduce)', '.direction-pad']) {
  if (!css.includes(token)) failures.push(`planner.css missing ${token}`);
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
  if (/src\/lib\/editor/.test(label) && /fetch\(|axios|XMLHttpRequest|WebSocket/.test(text)) failures.push(`${label}: contains network access`);
  if (label.endsWith('.tsx')) {
    const output = ts.transpileModule(text, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
      fileName: label,
      reportDiagnostics: true,
    });
    for (const diagnostic of output.diagnostics ?? []) {
      if (diagnostic.category === ts.DiagnosticCategory.Error) failures.push(`${label}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }
  }
}

if (failures.length) {
  console.error('Phase 4 validation failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
execFileSync('node', ['scripts/run-phase4-tests.mjs'], { cwd: root, stdio: 'inherit' });
console.log(`Phase 4 source validation passed: ${required.length} implementation/test files, SVG interaction contracts, imports, TSX syntax, local-only editor, and runtime editing scenarios checked.`);
