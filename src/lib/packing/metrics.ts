import type { ItemInstance, LayoutMetrics, Placement } from '../../types/domain';
import { horizontalOverlap, verticalOverlap, type Rect } from './geometry';

function positiveMinimum(values: number[]): number {
  const positive = values.filter((value) => Number.isFinite(value) && value > 0);
  return positive.length ? Math.min(...positive) : 0;
}

export function calculateMetrics(placements: readonly Placement[], requestedCount: number, spaceWidthMm: number, spaceHeightMm: number, instancesById: ReadonlyMap<string, ItemInstance>, fragmentedFreeRectCount: number): LayoutMetrics {
  const usedFrontAreaMm2 = placements.reduce((sum, placement) => sum + placement.widthMm * placement.heightMm, 0);
  const availableFrontAreaMm2 = spaceWidthMm * spaceHeightMm;
  const clearances: number[] = [];

  for (const placement of placements) {
    clearances.push(placement.xMm, placement.yMm, spaceWidthMm - placement.xMm - placement.widthMm, spaceHeightMm - placement.yMm - placement.heightMm);
  }
  for (let index = 0; index < placements.length; index += 1) {
    const a = placements[index];
    if (!a) continue;
    for (let otherIndex = index + 1; otherIndex < placements.length; otherIndex += 1) {
      const b = placements[otherIndex];
      if (!b) continue;
      const rectA: Rect = { x: a.xMm, y: a.yMm, width: a.widthMm, height: a.heightMm };
      const rectB: Rect = { x: b.xMm, y: b.yMm, width: b.widthMm, height: b.heightMm };
      if (verticalOverlap(rectA, rectB) > 0) clearances.push(Math.max(0, Math.max(a.xMm, b.xMm) - Math.min(a.xMm + a.widthMm, b.xMm + b.widthMm)));
      if (horizontalOverlap(rectA, rectB) > 0) clearances.push(Math.max(0, Math.max(a.yMm, b.yMm) - Math.min(a.yMm + a.heightMm, b.yMm + b.heightMm)));
    }
  }

  return {
    requestedCount,
    placedCount: placements.length,
    unplacedCount: Math.max(0, requestedCount - placements.length),
    usedFrontAreaMm2,
    availableFrontAreaMm2,
    utilizationRatio: availableFrontAreaMm2 > 0 ? usedFrontAreaMm2 / availableFrontAreaMm2 : 0,
    rotationCount: placements.filter((placement) => placement.orientation === 'base-rotated').length,
    priorityPlacedCount: placements.filter((placement) => instancesById.get(placement.instanceId)?.source.accessPriority === 'important').length,
    minimumClearanceMm: positiveMinimum(clearances),
    fragmentedFreeRectCount,
  };
}
