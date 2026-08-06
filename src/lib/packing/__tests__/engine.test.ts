import { describe, expect, it } from 'vitest';
import { EXAMPLE_PROJECT } from '../../../data/example-project';
import { cloneProject } from '../../project';
import { displayToMm } from '../../units';
import { packingEngine } from '../engine';
import type { ItemDefinition, ShelfSketchProject } from '../../../types/domain';

function project(overrides: Partial<ShelfSketchProject> = {}, items?: ItemDefinition[]): ShelfSketchProject {
  const base = cloneProject(EXAMPLE_PROJECT);
  return {
    ...base,
    ...overrides,
    space: { ...base.space, ...(overrides.space ?? {}) },
    items: items ?? overrides.items ?? base.items,
    preferences: { ...base.preferences, ...(overrides.preferences ?? {}) },
  };
}

function item(id: string, widthMm: number, heightMm: number, depthMm: number, quantity = 1, extra: Partial<ItemDefinition> = {}): ItemDefinition {
  return { id, label: id, widthMm, heightMm, depthMm, quantity, allowBaseRotation: false, stackable: true, accessPriority: 'normal', ...extra };
}

describe('packingEngine', () => {
  it('places an item that fits exactly', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 500, heightMm: 300, depthMm: 250, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('exact', 500, 300, 250)]));
    expect(result.compact.metrics.placedCount).toBe(1);
    expect(result.compact.metrics.utilizationRatio).toBe(1);
  });

  it('reports exact depth excess', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 500, heightMm: 300, depthMm: 249, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('deep', 200, 100, 250)]));
    expect(result.balanced.unplaced[0]).toMatchObject({ reason: 'too-deep', excessMm: 1 });
  });

  it('uses base rotation when it is the only fitting orientation', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 300, heightMm: 250, depthMm: 500, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('turn', 500, 200, 300, 1, { allowBaseRotation: true })]));
    expect(result.compact.placements[0]?.orientation).toBe('base-rotated');
  });

  it('does not rotate when base rotation is disabled', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 300, heightMm: 250, depthMm: 500, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('fixed', 500, 200, 300)]));
    expect(result.compact.metrics.placedCount).toBe(0);
    expect(result.compact.unplaced[0]?.reason).toBe('too-wide');
  });

  it('reports partial quantity placement', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('box', 200, 200, 200, 3)]));
    expect(result.compact.metrics.placedCount).toBe(2);
    expect(result.compact.metrics.unplacedCount).toBe(1);
  });

  it('respects horizontal gaps', () => {
    const withGap = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 10, verticalGapMm: 0 } }, [item('box', 200, 200, 200, 2)]));
    const withoutGap = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('box', 200, 200, 200, 2)]));
    expect(withGap.compact.metrics.placedCount).toBe(1);
    expect(withoutGap.compact.metrics.placedCount).toBe(2);
  });

  it('treats a 0.1 cm oversize as 1 mm too large', () => {
    const result = packingEngine.generate(project({ space: { widthMm: displayToMm(50, 'cm'), heightMm: 300, depthMm: 300, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('wide', displayToMm(50.1, 'cm'), 100, 100)]));
    expect(result.compact.unplaced[0]).toMatchObject({ reason: 'too-wide', excessMm: 1 });
  });

  it('stores equivalent centimetre and inch measurements as equal millimetres', () => {
    expect(displayToMm(25.4, 'cm')).toBe(displayToMm(10, 'in'));
  });

  it('returns three scored modes when nothing fits', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 100, heightMm: 100, depthMm: 100, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('large', 200, 200, 200)]));
    expect(result.compact.metrics.placedCount).toBe(0);
    expect(result.easyAccess.metrics.placedCount).toBe(0);
    expect(result.balanced.metrics.placedCount).toBe(0);
  });

  it('keeps two identical definitions as separate instances', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('same', 200, 200, 200, 2)]));
    expect(new Set(result.compact.placements.map((placement) => placement.instanceId)).size).toBe(2);
  });

  it('limits unusually large instance requests safely', () => {
    const result = packingEngine.generate(project({}, [item('many', 10, 10, 10, 200)]), { maxInstances: 25 });
    expect(result.compact.metrics.requestedCount).toBe(200);
    expect(result.compact.unplaced.some((entry) => entry.reason === 'candidate-limit')).toBe(true);
  });

  it('marks invalid negative dimensions instead of throwing', () => {
    const result = packingEngine.generate(project({}, [item('bad', -1, 100, 100)]));
    expect(result.balanced.unplaced[0]?.reason).toBe('invalid-item');
  });

  it('prevents placing another object above a non-stackable lower object', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 200, heightMm: 400, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [
      item('base', 200, 200, 200, 1, { stackable: false }),
      item('top', 200, 200, 200),
    ]));
    expect(result.easyAccess.metrics.placedCount).toBe(1);
  });

  it('allows vertical placement when the lower object is stackable', () => {
    const result = packingEngine.generate(project({ space: { widthMm: 200, heightMm: 400, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [
      item('base', 200, 200, 200, 1, { stackable: true }),
      item('top', 200, 200, 200),
    ]));
    expect(result.compact.metrics.placedCount).toBe(2);
  });

  it('keeps equal-efficiency results deterministic', () => {
    const input = project({ space: { widthMm: 400, heightMm: 400, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('square', 200, 200, 200, 4)]);
    const first = packingEngine.generate(input);
    const second = packingEngine.generate(input);
    expect(first.compact.fingerprint).toBe(second.compact.fingerprint);
    expect(first.compact.metrics.utilizationRatio).toBe(second.compact.metrics.utilizationRatio);
  });
});
