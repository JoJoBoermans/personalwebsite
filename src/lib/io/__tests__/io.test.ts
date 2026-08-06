import { describe, expect, it } from 'vitest';
import { EXAMPLE_PROJECT } from '../../../data/example-project';
import { createEditorSnapshot } from '../../editor';
import { packingEngine } from '../../packing';
import { buildLayoutSvg, measurementListText, parseProjectFileText, projectFileText, safeFilename } from '..';

describe('ShelfSketch project files', () => {
  it('round-trips a valid project', () => {
    const result = parseProjectFileText(projectFileText(EXAMPLE_PROJECT));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.project).toEqual(EXAMPLE_PROJECT);
  });

  it('rejects invalid JSON without producing a project', () => {
    expect(parseProjectFileText('{broken')).toEqual({ ok: false, message: 'This file is not valid JSON.' });
  });

  it('rejects unknown schema versions', () => {
    const data = { ...EXAMPLE_PROJECT, schemaVersion: 2 };
    expect(parseProjectFileText(JSON.stringify(data))).toMatchObject({ ok: false, message: 'This project uses an unsupported schema version.' });
  });

  it('rejects unexpected fields', () => {
    const data = { ...EXAMPLE_PROJECT, hiddenServerValue: 'nope' };
    expect(parseProjectFileText(JSON.stringify(data))).toMatchObject({ ok: false });
  });

  it('rejects invalid dimensions', () => {
    const data = { ...EXAMPLE_PROJECT, space: { ...EXAMPLE_PROJECT.space, widthMm: -1 } };
    expect(parseProjectFileText(JSON.stringify(data))).toMatchObject({ ok: false });
  });
});

describe('export helpers', () => {
  it('creates a useful measurement list', () => {
    const text = measurementListText(EXAMPLE_PROJECT);
    expect(text).toContain('ShelfSketch project: Example pantry shelf');
    expect(text).toContain('Large bin');
    expect(text).toContain('quantity 2');
  });

  it('builds a standalone SVG for the current snapshot', () => {
    const layouts = packingEngine.generate(EXAMPLE_PROJECT);
    const snapshot = createEditorSnapshot(layouts.balanced.placements);
    const svg = buildLayoutSvg({
      project: EXAMPLE_PROJECT,
      snapshot,
      mode: 'balanced',
      placedCount: snapshot.placements.length,
      requestedCount: layouts.balanced.metrics.requestedCount,
      utilizationPercent: Math.round(layouts.balanced.metrics.utilizationRatio * 100),
      unplacedLabels: ['Small box 2'],
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('Example pantry shelf');
    expect(svg).toContain('Small box 2');
    expect(svg).not.toContain('<script');
  });

  it('sanitizes download filenames', () => {
    expect(safeFilename(' My / Pantry: 2026 ')).toBe('my-pantry-2026');
  });
});
