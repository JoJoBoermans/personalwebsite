import type { ItemInstance, Orientation, Placement, UnplacedItem } from '../../../types/domain';
import type { NormalizedPackingInput } from '../contracts';
import type { OrderingName } from '../orderings';
import { orderInstances } from '../orderings';
import { violatesStacking, type InternalPlacement } from './shared';

interface Row {
  y: number;
  height: number;
  cursorX: number;
}

export interface ShelfAlgorithmResult {
  placements: Placement[];
  unplaced: UnplacedItem[];
  fragmentedFreeRectCount: number;
}

export function packShelves(input: NormalizedPackingInput, eligible: readonly ItemInstance[], orientations: ReadonlyMap<string, readonly Orientation[]>, ordering: OrderingName): ShelfAlgorithmResult {
  const rows: Row[] = [];
  const internal: InternalPlacement[] = [];
  const unplaced: UnplacedItem[] = [];

  for (const instance of orderInstances(eligible, ordering)) {
    let chosen: InternalPlacement | null = null;
    let chosenRow: Row | null = null;
    const options = [...(orientations.get(instance.id) ?? [])].sort((a, b) => a.frontWidthMm - b.frontWidthMm || a.frontHeightMm - b.frontHeightMm);

    for (const row of rows) {
      for (const orientation of options) {
        const requiredX = row.cursorX === 0 ? orientation.frontWidthMm : row.cursorX + input.space.horizontalGapMm + orientation.frontWidthMm;
        if (orientation.frontHeightMm > row.height || requiredX > input.space.widthMm) continue;
        const x = row.cursorX === 0 ? 0 : row.cursorX + input.space.horizontalGapMm;
        const proposed: InternalPlacement = { x, y: row.y, width: orientation.frontWidthMm, height: orientation.frontHeightMm, instance, orientation };
        if (!violatesStacking(proposed, internal)) { chosen = proposed; chosenRow = row; break; }
      }
      if (chosen) break;
    }

    if (!chosen) {
      const currentTop = rows.length ? Math.max(...rows.map((row) => row.y + row.height)) : 0;
      for (const orientation of options) {
        const y = rows.length ? currentTop + input.space.verticalGapMm : 0;
        if (y + orientation.frontHeightMm > input.space.heightMm || orientation.frontWidthMm > input.space.widthMm) continue;
        const proposed: InternalPlacement = { x: 0, y, width: orientation.frontWidthMm, height: orientation.frontHeightMm, instance, orientation };
        if (violatesStacking(proposed, internal)) continue;
        const row: Row = { y, height: orientation.frontHeightMm, cursorX: 0 };
        rows.push(row);
        chosen = proposed;
        chosenRow = row;
        break;
      }
    }

    if (!chosen || !chosenRow) {
      unplaced.push({ instanceId: instance.id, definitionId: instance.definitionId, reason: 'no-free-rectangle', messageKey: 'no-free-rectangle' });
      continue;
    }
    internal.push(chosen);
    chosenRow.cursorX = chosen.x + chosen.width;
  }

  return {
    placements: internal.map((placed) => ({
      instanceId: placed.instance.id,
      definitionId: placed.instance.definitionId,
      xMm: placed.x,
      yMm: input.space.heightMm - placed.y - placed.height,
      widthMm: placed.width,
      heightMm: placed.height,
      orientation: placed.orientation.kind,
    })),
    unplaced,
    fragmentedFreeRectCount: Math.max(1, rows.length),
  };
}
