import { describe, expect, it } from 'vitest';
import { createEditorHistory, createEditorSnapshot, commitHistory, movePlacement, nudgePlacement, redoHistory, removePlacement, rotatePlacement, snapMillimetres, undoHistory } from '..';
import type { ItemDefinition, Placement, ShelfSketchProject } from '../../../types/domain';

function item(overrides: Partial<ItemDefinition> = {}): ItemDefinition {
  return {
    id: 'box',
    label: 'Box',
    widthMm: 200,
    heightMm: 100,
    depthMm: 150,
    quantity: 1,
    allowBaseRotation: true,
    stackable: true,
    accessPriority: 'normal',
    ...overrides,
  };
}

function project(items: ItemDefinition[] = [item()], overrides: Partial<ShelfSketchProject> = {}): ShelfSketchProject {
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

function placement(instanceId = 'box__1', definitionId = 'box', xMm = 0, yMm = 0, widthMm = 200, heightMm = 100): Placement {
  return { instanceId, definitionId, xMm, yMm, widthMm, heightMm, orientation: 'normal' };
}

describe('manual layout editing', () => {
  it('moves an item to a valid position', () => {
    const snapshot = createEditorSnapshot([placement()]);
    const result = movePlacement(snapshot, 'box__1', 250, 100, project());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.snapshot.placements[0]).toMatchObject({ xMm: 250, yMm: 100 });
  });

  it('rejects movement outside the shelf', () => {
    const snapshot = createEditorSnapshot([placement()]);
    const result = nudgePlacement(snapshot, 'box__1', -10, 0, project());
    expect(result).toMatchObject({ ok: false, code: 'outside-space' });
  });

  it('rejects overlapping placements', () => {
    const items = [item(), item({ id: 'other', label: 'Other' })];
    const snapshot = createEditorSnapshot([placement(), placement('other__1', 'other', 250, 0)]);
    const result = movePlacement(snapshot, 'box__1', 100, 0, project(items));
    expect(result).toMatchObject({ ok: false, code: 'collision', conflictingInstanceId: 'other__1' });
  });

  it('rejects a gap smaller than the project preference', () => {
    const items = [item(), item({ id: 'other', label: 'Other' })];
    const snapshot = createEditorSnapshot([placement(), placement('other__1', 'other', 250, 0)]);
    const result = movePlacement(snapshot, 'box__1', 45, 0, project(items));
    expect(result).toMatchObject({ ok: false, code: 'gap-violation' });
  });

  it('rotates on the base while preserving the centre where possible', () => {
    const snapshot = createEditorSnapshot([placement('box__1', 'box', 100, 100)]);
    const result = rotatePlacement(snapshot, 'box__1', project());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.snapshot.placements[0]).toMatchObject({ orientation: 'base-rotated', widthMm: 150, heightMm: 100, xMm: 125, yMm: 100 });
  });

  it('rejects rotation when the rotated depth is too large', () => {
    const deepWidth = item({ widthMm: 300, depthMm: 150 });
    const snapshot = createEditorSnapshot([placement('box__1', 'box', 0, 0, 300, 100)]);
    const result = rotatePlacement(snapshot, 'box__1', project([deepWidth], { space: { widthMm: 500, heightMm: 300, depthMm: 250, horizontalGapMm: 10, verticalGapMm: 10 } }));
    expect(result).toMatchObject({ ok: false, code: 'depth-exceeded' });
  });

  it('rejects rotation when it is disabled', () => {
    const fixed = item({ allowBaseRotation: false });
    const result = rotatePlacement(createEditorSnapshot([placement()]), 'box__1', project([fixed]));
    expect(result).toMatchObject({ ok: false, code: 'rotation-disabled' });
  });

  it('protects a non-stackable lower item', () => {
    const lower = item({ id: 'lower', label: 'Lower', stackable: false });
    const upper = item({ id: 'upper', label: 'Upper' });
    const snapshot = createEditorSnapshot([
      placement('lower__1', 'lower', 0, 180),
      placement('upper__1', 'upper', 250, 0),
    ]);
    const result = movePlacement(snapshot, 'upper__1', 0, 60, project([lower, upper]));
    expect(result).toMatchObject({ ok: false, code: 'stacking-violation' });
  });

  it('removes an item and restores it through undo and redo', () => {
    const original = [placement()];
    let history = createEditorHistory(original);
    const removed = removePlacement(history.present, 'box__1');
    expect(removed.ok).toBe(true);
    if (!removed.ok) return;
    history = commitHistory(history, removed.snapshot);
    expect(history.present.placements).toHaveLength(0);
    history = undoHistory(history);
    expect(history.present.placements).toHaveLength(1);
    history = redoHistory(history);
    expect(history.present.placements).toHaveLength(0);
  });

  it('snaps drag coordinates deterministically', () => {
    expect(snapMillimetres(103, 5)).toBe(105);
    expect(snapMillimetres(102, 5)).toBe(100);
  });
});
