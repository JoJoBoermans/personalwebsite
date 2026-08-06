import type { LayoutExplanation, LayoutMode, LayoutResult, ShelfSketchProject, UnplacedItem } from '../../types/domain';
import { formatMm } from '../units';

const MODE_LABELS: Record<LayoutMode, string> = {
  compact: 'Compact',
  'easy-access': 'Easy Access',
  balanced: 'Balanced',
};

export function modeLabel(mode: LayoutMode): string {
  return MODE_LABELS[mode];
}

export function unplacedMessage(item: UnplacedItem, project: ShelfSketchProject): string {
  const definition = project.items.find((entry) => entry.id === item.definitionId);
  const label = definition?.label ?? 'This item';
  const excess = item.excessMm ? formatMm(item.excessMm, project.displayUnit) : null;
  if (item.reason === 'too-deep') return `${label} is ${excess ?? 'too'} deep for this space.`;
  if (item.reason === 'too-wide') return `${label} is ${excess ?? 'too'} wide in every allowed orientation.`;
  if (item.reason === 'too-tall') return `${label} is ${excess ?? 'too'} tall for this space.`;
  if (item.reason === 'candidate-limit') return `${label} was not evaluated because the MVP safety limit was reached.`;
  if (item.reason === 'invalid-item') return `${label} has invalid dimensions or quantity.`;
  return `${label} could not be placed in the remaining free rectangles.`;
}

export function explanationMessage(explanation: LayoutExplanation, result: LayoutResult): string {
  if (explanation.messageKey === 'all-fit') return `Everything found a place: all ${explanation.valueCount ?? result.metrics.placedCount} items fit.`;
  if (explanation.messageKey === 'unplaced-count') return `${explanation.valueCount ?? result.metrics.unplacedCount} item${(explanation.valueCount ?? 0) === 1 ? '' : 's'} still need another shelf or a different combination.`;
  if (explanation.messageKey === 'rotation-count') return `${explanation.valueCount} item${explanation.valueCount === 1 ? '' : 's'} fit using base rotation.`;
  if (explanation.messageKey === 'too-deep') return `${explanation.valueCount} item${explanation.valueCount === 1 ? '' : 's'} exceed the usable depth.`;
  if (explanation.messageKey === 'too-wide') return `${explanation.valueCount} item${explanation.valueCount === 1 ? '' : 's'} are too wide in every allowed orientation.`;
  if (explanation.messageKey === 'too-tall') return `${explanation.valueCount} item${explanation.valueCount === 1 ? '' : 's'} are too tall.`;
  if (explanation.messageKey === 'no-free-space') return `${explanation.valueCount} item${explanation.valueCount === 1 ? '' : 's'} passed the size checks but did not fit into the remaining arrangement.`;
  if (explanation.messageKey === 'mode-compact') return 'Compact prioritises item count and front-area use.';
  if (explanation.messageKey === 'mode-easy-access') return 'Easy Access prioritises important items, lower positions and clearer spacing.';
  return 'Balanced combines space use with practical access.';
}
