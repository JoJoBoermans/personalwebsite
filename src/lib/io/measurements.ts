import { formatDimensions, formatMm } from '../units';
import type { ShelfSketchProject } from '../../types/domain';

export function measurementListText(project: ShelfSketchProject): string {
  const lines = [
    `ShelfSketch project: ${project.name}`,
    `Shelf: ${formatDimensions(project.space.widthMm, project.space.heightMm, project.space.depthMm, project.displayUnit)}`,
    `Clearance: ${formatMm(project.space.horizontalGapMm, project.displayUnit)} horizontal, ${formatMm(project.space.verticalGapMm, project.displayUnit)} vertical`,
    '',
    'Items:',
  ];
  for (const item of project.items) {
    const flags = [
      item.allowBaseRotation ? 'base rotation allowed' : 'fixed orientation',
      item.stackable ? 'stackable' : 'not stackable',
      item.accessPriority === 'important' ? 'easy access important' : 'normal access',
    ];
    lines.push(`- ${item.label}: ${formatDimensions(item.widthMm, item.heightMm, item.depthMm, project.displayUnit)}, quantity ${item.quantity} (${flags.join(', ')})`);
  }
  lines.push('', 'Planning aid only. Verify the physical space and outside product dimensions before purchasing or installing anything.');
  return lines.join('\n');
}
