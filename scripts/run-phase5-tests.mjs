import { execFileSync } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const out = resolve(root, '.phase5-test-build');
await rm(out, { recursive: true, force: true });
execFileSync('tsc', ['-p', 'tsconfig.phase5-test.json'], { cwd: root, stdio: 'inherit' });
await writeFile(resolve(out, 'package.json'), '{"type":"commonjs"}\n');
execFileSync('node', [resolve(root, 'scripts/phase5-io-check.cjs')], { cwd: root, stdio: 'inherit' });
await rm(out, { recursive: true, force: true });
