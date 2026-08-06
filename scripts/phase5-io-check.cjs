const assert = require('node:assert/strict');
const { EXAMPLE_PROJECT } = require('../.phase5-test-build/src/data/example-project.js');
const { packingEngine } = require('../.phase5-test-build/src/lib/packing/index.js');
const { createEditorSnapshot } = require('../.phase5-test-build/src/lib/editor/index.js');
const { buildLayoutSvg, measurementListText, parseProjectFileText, projectFileText, safeFilename } = require('../.phase5-test-build/src/lib/io/index.js');
const storage = require('../.phase5-test-build/src/lib/storage.js');

const parsed = parseProjectFileText(projectFileText(EXAMPLE_PROJECT));
assert.equal(parsed.ok, true);
assert.equal(parsed.project.name, EXAMPLE_PROJECT.name);
assert.equal(parseProjectFileText('{broken').ok, false);
assert.equal(parseProjectFileText(JSON.stringify({ ...EXAMPLE_PROJECT, schemaVersion: 2 })).ok, false);
assert.equal(parseProjectFileText(JSON.stringify({ ...EXAMPLE_PROJECT, extra: true })).ok, false);
assert.match(measurementListText(EXAMPLE_PROJECT), /Large bin/);
assert.equal(safeFilename(' My \/ Pantry: 2026 '), 'my-pantry-2026');

const layouts = packingEngine.generate(EXAMPLE_PROJECT);
const snapshot = createEditorSnapshot(layouts.balanced.placements);
const svg = buildLayoutSvg({ project: EXAMPLE_PROJECT, snapshot, mode: 'balanced', placedCount: snapshot.placements.length, requestedCount: layouts.balanced.metrics.requestedCount, utilizationPercent: Math.round(layouts.balanced.metrics.utilizationRatio * 100), unplacedLabels: ['Small box 2'] });
assert.match(svg, /<svg/);
assert.match(svg, /Example pantry shelf/);
assert.match(svg, /Small box 2/);

const map = new Map();
global.window = {
  localStorage: {
    setItem(key, value) { map.set(key, String(value)); },
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    removeItem(key) { map.delete(key); },
  },
};
assert.equal(storage.savePlannerSession(EXAMPLE_PROJECT, layouts, { selectedMode: 'balanced', snapshots: { compact: createEditorSnapshot(layouts.compact.placements), 'easy-access': createEditorSnapshot(layouts.easyAccess.placements), balanced: snapshot } }), true);
const restored = storage.loadPlannerSession();
assert.ok(restored);
assert.equal(restored.project.name, EXAMPLE_PROJECT.name);
assert.equal(restored.layouts.balanced.placements.length, layouts.balanced.placements.length);
assert.equal(restored.editorState.selectedMode, 'balanced');
storage.clearShelfSketchStorage();
assert.equal(storage.loadPlannerSession(), null);

console.log('Phase 5 runtime checks passed: project import/export, measurement copy text, standalone SVG, filename safety, full local session persistence, restoration, and deletion.');
