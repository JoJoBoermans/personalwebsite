const assert = require('node:assert/strict');
const { EXAMPLE_PROJECT } = require('../.phase3-test-build/src/data/example-project.js');
const { packingEngine } = require('../.phase3-test-build/src/lib/packing/engine.js');
const { cloneProject } = require('../.phase3-test-build/src/lib/project.js');
const { displayToMm } = require('../.phase3-test-build/src/lib/units.js');

function project(overrides = {}, items) {
  const base = cloneProject(EXAMPLE_PROJECT);
  return { ...base, ...overrides, space: { ...base.space, ...(overrides.space || {}) }, items: items || overrides.items || base.items, preferences: { ...base.preferences, ...(overrides.preferences || {}) } };
}
function item(id, widthMm, heightMm, depthMm, quantity = 1, extra = {}) {
  return { id, label: id, widthMm, heightMm, depthMm, quantity, allowBaseRotation: false, stackable: true, accessPriority: 'normal', ...extra };
}

function assertLayoutGeometry(result, sourceProject) {
  for (const placement of result.placements) {
    assert.ok(placement.xMm >= 0 && placement.yMm >= 0, 'placement starts inside space');
    assert.ok(placement.xMm + placement.widthMm <= sourceProject.space.widthMm, 'placement width stays inside');
    assert.ok(placement.yMm + placement.heightMm <= sourceProject.space.heightMm, 'placement height stays inside');
  }
  for (let i = 0; i < result.placements.length; i += 1) {
    const a = result.placements[i];
    for (let j = i + 1; j < result.placements.length; j += 1) {
      const b = result.placements[j];
      const overlapsX = a.xMm < b.xMm + b.widthMm && a.xMm + a.widthMm > b.xMm;
      const overlapsY = a.yMm < b.yMm + b.heightMm && a.yMm + a.heightMm > b.yMm;
      assert.ok(!(overlapsX && overlapsY), `placements ${a.instanceId} and ${b.instanceId} overlap`);
      if (overlapsY) {
        const gap = Math.max(a.xMm, b.xMm) - Math.min(a.xMm + a.widthMm, b.xMm + b.widthMm);
        assert.ok(gap >= sourceProject.space.horizontalGapMm, 'horizontal gap is respected');
      }
      if (overlapsX) {
        const gap = Math.max(a.yMm, b.yMm) - Math.min(a.yMm + a.heightMm, b.yMm + b.heightMm);
        assert.ok(gap >= sourceProject.space.verticalGapMm, 'vertical gap is respected');
      }
    }
  }
}

function run(name, check) {
  try { check(); process.stdout.write(`✓ ${name}\n`); }
  catch (error) { process.stderr.write(`✗ ${name}\n`); throw error; }
}
run('exact fit', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 500, heightMm: 300, depthMm: 250, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('exact', 500, 300, 250)]));
  assert.equal(result.compact.metrics.placedCount, 1); assert.equal(result.compact.metrics.utilizationRatio, 1);
});
run('depth excess', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 500, heightMm: 300, depthMm: 249, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('deep', 200, 100, 250)]));
  assert.equal(result.balanced.unplaced[0]?.reason, 'too-deep'); assert.equal(result.balanced.unplaced[0]?.excessMm, 1);
});
run('rotation', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 300, heightMm: 250, depthMm: 500, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('turn', 500, 200, 300, 1, { allowBaseRotation: true })]));
  assert.equal(result.compact.placements[0]?.orientation, 'base-rotated');
});
run('rotation disabled', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 300, heightMm: 250, depthMm: 500, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('fixed', 500, 200, 300)]));
  assert.equal(result.compact.metrics.placedCount, 0); assert.equal(result.compact.unplaced[0]?.reason, 'too-wide');
});
run('partial quantity', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('box', 200, 200, 200, 3)]));
  assert.equal(result.compact.metrics.placedCount, 2); assert.equal(result.compact.metrics.unplacedCount, 1);
});
run('horizontal gap', () => {
  const withGap = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 10, verticalGapMm: 0 } }, [item('box', 200, 200, 200, 2)]));
  const withoutGap = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('box', 200, 200, 200, 2)]));
  assert.equal(withGap.compact.metrics.placedCount, 1); assert.equal(withoutGap.compact.metrics.placedCount, 2);
});
run('0.1 cm oversize', () => {
  const result = packingEngine.generate(project({ space: { widthMm: displayToMm(50, 'cm'), heightMm: 300, depthMm: 300, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('wide', displayToMm(50.1, 'cm'), 100, 100)]));
  assert.equal(result.compact.unplaced[0]?.excessMm, 1);
});
run('unit equivalence', () => assert.equal(displayToMm(25.4, 'cm'), displayToMm(10, 'in')));
run('nothing fits', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 100, heightMm: 100, depthMm: 100, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('large', 200, 200, 200)]));
  assert.equal(result.compact.metrics.placedCount + result.easyAccess.metrics.placedCount + result.balanced.metrics.placedCount, 0);
});
run('identical instances', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 400, heightMm: 200, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('same', 200, 200, 200, 2)]));
  assert.equal(new Set(result.compact.placements.map((placement) => placement.instanceId)).size, 2);
});
run('instance safety limit', () => {
  const result = packingEngine.generate(project({}, [item('many', 10, 10, 10, 200)]), { maxInstances: 25 });
  assert.equal(result.compact.metrics.requestedCount, 200); assert.ok(result.compact.unplaced.some((entry) => entry.reason === 'candidate-limit'));
});
run('invalid item', () => {
  const result = packingEngine.generate(project({}, [item('bad', -1, 100, 100)])); assert.equal(result.balanced.unplaced[0]?.reason, 'invalid-item');
});
run('non-stackable base', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 200, heightMm: 400, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('base', 200, 200, 200, 1, { stackable: false }), item('top', 200, 200, 200)]));
  assert.equal(result.easyAccess.metrics.placedCount, 1);
});
run('stackable base', () => {
  const result = packingEngine.generate(project({ space: { widthMm: 200, heightMm: 400, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('base', 200, 200, 200), item('top', 200, 200, 200)]));
  assert.equal(result.compact.metrics.placedCount, 2);
});
run('deterministic equal efficiency', () => {
  const input = project({ space: { widthMm: 400, heightMm: 400, depthMm: 200, horizontalGapMm: 0, verticalGapMm: 0 } }, [item('square', 200, 200, 200, 4)]);
  const first = packingEngine.generate(input); const second = packingEngine.generate(input);
  assert.equal(first.compact.fingerprint, second.compact.fingerprint); assert.equal(first.compact.metrics.utilizationRatio, second.compact.metrics.utilizationRatio);
});
run('example project generates all modes', () => {
  const result = packingEngine.generate(cloneProject(EXAMPLE_PROJECT));
  assert.ok(result.compact.metrics.placedCount > 0); assert.ok(result.easyAccess.metrics.placedCount > 0); assert.ok(result.balanced.metrics.placedCount > 0);
});
run('generated layouts stay inside the space without overlap', () => {
  const source = cloneProject(EXAMPLE_PROJECT);
  const result = packingEngine.generate(source);
  assertLayoutGeometry(result.compact, source); assertLayoutGeometry(result.easyAccess, source); assertLayoutGeometry(result.balanced, source);
});
process.stdout.write('Phase 3 executable engine checks passed.\n');
