import type { ItemInstance, Orientation } from '../../../types/domain';
import { horizontalOverlap, type Rect } from '../geometry';

export interface InternalPlacement extends Rect {
  instance: ItemInstance;
  orientation: Orientation;
}

export function violatesStacking(candidate: InternalPlacement, existing: readonly InternalPlacement[]): boolean {
  for (const placed of existing) {
    if (horizontalOverlap(candidate, placed) <= 0) continue;
    const candidateAbove = candidate.y >= placed.y + placed.height;
    const placedAbove = placed.y >= candidate.y + candidate.height;
    if (candidateAbove && !placed.instance.source.stackable) return true;
    if (placedAbove && !candidate.instance.source.stackable) return true;
  }
  return false;
}
