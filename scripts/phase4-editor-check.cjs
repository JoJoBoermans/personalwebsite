const assert = require('node:assert/strict');
const editor = require('../.phase4-test-build/src/lib/editor/index.js');

function item(overrides = {}) {
  return { id: 'box', label: 'Box', widthMm: 200, heightMm: 100, depthMm: 150, quantity: 1, allowBaseRotation: true, stackable: true, accessPriority: 'normal', ...overrides };
}
function project(items = [item()], overrides = {}) {
  return {
    schemaVersion: 1,
    id: 'project',
    name: 'Editor test',
    displayUnit: 'cm',
    space: { widthMm: 500, heightMm: 300, depthMm: 250, horizontalGapMm: 10, verticalGapMm: 10 },
    items,
    preferences: { defaultMode: 'balanced', reducedMotionOverride: 'system' },
    createdAt: '2026-08-06T00:00:00.000Z',
    updatedAt: '2026-08-06T00:00:00.000Z',
    ...overrides,
  };
}
function placement(instanceId = 'box__1', definitionId = 'box', xMm = 0, yMm = 0, widthMm = 200, heightMm = 100) {
  return { instanceId, definitionId, xMm, yMm, widthMm, heightMm, orientation: 'normal' };
}
function check(name, fn) { fn(); console.log(`✓ ${name}`); }

check('valid nudge', () => {
  const result = editor.nudgePlacement(editor.createEditorSnapshot([placement()]), 'box__1', 250, 100, project());
  assert.equal(result.ok, true);
  assert.equal(result.snapshot.placements[0].xMm, 250);
});
check('boundary rejection', () => {
  const result = editor.nudgePlacement(editor.createEditorSnapshot([placement()]), 'box__1', -10, 0, project());
  assert.equal(result.code, 'outside-space');
});
check('collision rejection', () => {
  const items = [item(), item({ id: 'other', label: 'Other' })];
  const result = editor.movePlacement(editor.createEditorSnapshot([placement(), placement('other__1', 'other', 250, 0)]), 'box__1', 100, 0, project(items));
  assert.equal(result.code, 'collision');
});
check('gap rejection', () => {
  const items = [item(), item({ id: 'other', label: 'Other' })];
  const result = editor.movePlacement(editor.createEditorSnapshot([placement(), placement('other__1', 'other', 250, 0)]), 'box__1', 45, 0, project(items));
  assert.equal(result.code, 'gap-violation');
});
check('base rotation', () => {
  const result = editor.rotatePlacement(editor.createEditorSnapshot([placement('box__1', 'box', 100, 100)]), 'box__1', project());
  assert.equal(result.ok, true);
  assert.equal(result.snapshot.placements[0].orientation, 'base-rotated');
  assert.equal(result.snapshot.placements[0].widthMm, 150);
});
check('rotation depth rejection', () => {
  const wide = item({ widthMm: 300, depthMm: 150 });
  const result = editor.rotatePlacement(editor.createEditorSnapshot([placement('box__1', 'box', 0, 0, 300, 100)]), 'box__1', project([wide]));
  assert.equal(result.code, 'depth-exceeded');
});
check('rotation disabled', () => {
  const result = editor.rotatePlacement(editor.createEditorSnapshot([placement()]), 'box__1', project([item({ allowBaseRotation: false })]));
  assert.equal(result.code, 'rotation-disabled');
});
check('non-stackable protection', () => {
  const lower = item({ id: 'lower', label: 'Lower', stackable: false });
  const upper = item({ id: 'upper', label: 'Upper' });
  const snapshot = editor.createEditorSnapshot([placement('lower__1', 'lower', 0, 180), placement('upper__1', 'upper', 250, 0)]);
  const result = editor.movePlacement(snapshot, 'upper__1', 0, 60, project([lower, upper]));
  assert.equal(result.code, 'stacking-violation');
});
check('remove undo redo', () => {
  let history = editor.createEditorHistory([placement()]);
  const removed = editor.removePlacement(history.present, 'box__1');
  assert.equal(removed.ok, true);
  history = editor.commitHistory(history, removed.snapshot);
  assert.equal(history.present.placements.length, 0);
  history = editor.undoHistory(history);
  assert.equal(history.present.placements.length, 1);
  history = editor.redoHistory(history);
  assert.equal(history.present.placements.length, 0);
});
check('coordinate snapping', () => {
  assert.equal(editor.snapMillimetres(103, 5), 105);
  assert.equal(editor.snapMillimetres(102, 5), 100);
});
console.log('Phase 4 editor runtime checks passed.');
