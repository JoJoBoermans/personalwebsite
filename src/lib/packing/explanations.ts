import type { LayoutExplanation, LayoutMode, LayoutResult, UnplacedItem } from '../../types/domain';

function groupedCount(items: readonly UnplacedItem[], reason: UnplacedItem['reason']): number {
  return items.filter((item) => item.reason === reason).length;
}

export function buildExplanations(result: Pick<LayoutResult, 'placements' | 'unplaced' | 'metrics'>, mode: LayoutMode): LayoutExplanation[] {
  const explanations: LayoutExplanation[] = [];
  if (result.metrics.unplacedCount === 0) {
    explanations.push({ code: 'all-fit', messageKey: 'all-fit', valueCount: result.metrics.placedCount });
  } else {
    explanations.push({ code: 'unplaced-count', messageKey: 'unplaced-count', valueCount: result.metrics.unplacedCount });
  }
  if (result.metrics.rotationCount > 0) explanations.push({ code: 'rotation-count', messageKey: 'rotation-count', valueCount: result.metrics.rotationCount });
  for (const reason of ['too-deep', 'too-wide', 'too-tall'] as const) {
    const matching = result.unplaced.filter((item) => item.reason === reason);
    if (matching.length) explanations.push({
      code: reason,
      messageKey: reason,
      instanceIds: matching.map((item) => item.instanceId),
      valueCount: matching.length,
      valueMm: Math.max(...matching.map((item) => item.excessMm ?? 0)),
    });
  }
  const noSpace = groupedCount(result.unplaced, 'no-free-rectangle');
  if (noSpace) explanations.push({ code: 'no-free-space', messageKey: 'no-free-space', valueCount: noSpace });
  explanations.push({ code: `mode-${mode}`, messageKey: `mode-${mode}` });
  return explanations;
}
