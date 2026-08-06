import { execFileSync } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const out = resolve(root, '.phase3-test-build');
await rm(out, { recursive: true, force: true });
execFileSync('tsc', ['-p', 'tsconfig.phase3-test.json'], { cwd: root, stdio: 'inherit' });
await writeFile(resolve(out, 'package.json'), '{"type":"commonjs"}\n');
execFileSync('node', [resolve(root, 'scripts/phase3-engine-check.cjs')], { cwd: root, stdio: 'inherit' });
await rm(out, { recursive: true, force: true });
