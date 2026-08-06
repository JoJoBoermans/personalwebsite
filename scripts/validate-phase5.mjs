import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = resolve(process.cwd());
const required = [
  'src/components/planner/ProjectFileControls.tsx',
  'src/components/planner/LayoutExportPanel.tsx',
  'src/components/planner/LayoutPrintReport.tsx',
  'src/lib/io/contracts.ts',
  'src/lib/io/browser-download.ts',
  'src/lib/io/project-file.ts',
  'src/lib/io/measurements.ts',
  'src/lib/io/layout-export.ts',
  'src/lib/io/index.ts',
  'src/lib/io/__tests__/io.test.ts',
  'scripts/run-phase5-tests.mjs',
  'scripts/phase5-io-check.cjs',
  'tsconfig.phase5-test.json',
];
const failures = [];
for (const file of required) {
  try { if (!(await stat(resolve(root, file))).isFile()) failures.push(`${file}: not a file`); }
  catch { failures.push(`${file}: missing`); }
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
for (const script of ['validate:phase5', 'test:io', 'test:phase5-runtime']) if (!packageJson.scripts?.[script]) failures.push(`package.json missing ${script}`);

const planner = await readFile(resolve(root, 'src/components/planner/PlannerApp.tsx'), 'utf8');
for (const token of ['loadPlannerSession', 'savePlannerSession', 'importProjectFile', 'downloadProjectFile', 'clearShelfSketchStorage', 'initialEditorState']) {
  if (!planner.includes(token)) failures.push(`PlannerApp.tsx missing ${token}`);
}
const results = await readFile(resolve(root, 'src/components/planner/LayoutResults.tsx'), 'utf8');
for (const token of ['LayoutExportPanel', 'LayoutPrintReport', 'onEditorStateChange', 'onSaveSession', 'unplacedLabels']) {
  if (!results.includes(token)) failures.push(`LayoutResults.tsx missing ${token}`);
}
const exportPanel = await readFile(resolve(root, 'src/components/planner/LayoutExportPanel.tsx'), 'utf8');
for (const token of ['Download project JSON', 'Download SVG', 'Download PNG', 'Print plan', 'Copy measurements', 'Save project and layouts']) {
  if (!exportPanel.includes(token)) failures.push(`LayoutExportPanel.tsx missing ${token}`);
}
const projectFile = await readFile(resolve(root, 'src/lib/io/project-file.ts'), 'utf8');
for (const token of ['MAX_PROJECT_FILE_BYTES', 'schemaVersion !== 1', 'hasOnlyKeys', 'validateProject', 'file.size']) {
  if (!projectFile.includes(token)) failures.push(`project-file.ts missing ${token}`);
}
const printCss = await readFile(resolve(root, 'src/styles/print.css'), 'utf8');
for (const token of ['.print-layout-report', '@media print', 'visibility: visible', '@page']) {
  if (!printCss.includes(token)) failures.push(`print.css missing ${token}`);
}
const schema = JSON.parse(await readFile(resolve(root, 'schemas/shelfsketch-project.schema.json'), 'utf8'));
if (schema?.$defs?.positiveMillimetres?.maximum !== 10000) failures.push('schema maximum dimensions do not match runtime validation');
if (schema?.$defs?.itemDefinition?.properties?.quantity?.maximum !== 50) failures.push('schema quantity maximum does not match runtime validation');

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
  if (/src\/lib\/(io|storage)/.test(label) && /fetch\(|axios|XMLHttpRequest|WebSocket/.test(text)) failures.push(`${label}: contains network access`);
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
  console.error('Phase 5 validation failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
execFileSync('tsc', ['-p', 'tsconfig.phase4-components.json'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['scripts/run-phase5-tests.mjs'], { cwd: root, stdio: 'inherit' });
console.log(`Phase 5 source validation passed: ${required.length} implementation/test files, safe project schema, local session persistence, SVG/PNG/print/export controls, imports, strict planner TypeScript, and runtime I/O scenarios checked.`);
