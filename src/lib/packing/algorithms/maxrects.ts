import type { ItemInstance, Orientation, Placement, UnplacedItem } from '../../../types/domain';
import type { NormalizedPackingInput } from '../contracts';
import { clipRect, pruneFreeRectangles, splitFreeRectangle, type Rect } from '../geometry';
import type { OrderingName } from '../orderings';
import { orderInstances } from '../orderings';
import { violatesStacking, type InternalPlacement } from './shared';

export type MaxRectsHeuristic = 'bottom-left' | 'best-area' | 'best-short-side';

export interface AlgorithmResult {
  placements: Placement[];
  unplaced: UnplacedItem[];
  fragmentedFreeRectCount: number;
}

interface Choice {
  instance: ItemInstance;
  orientation: Orientation;
  x: number;
  y: number;
  scoreA: number;
  scoreB: number;
}

function choiceScore(free: Rect, orientation: Orientation, x: number, y: number, heuristic: MaxRectsHeuristic): [number, number] {
  const leftoverWidth = free.width - orientation.frontWidthMm;
  const leftoverHeight = free.height - orientation.frontHeightMm;
  if (heuristic === 'bottom-left') return [y, x];
  if (heuristic === 'best-short-side') return [Math.min(leftoverWidth, leftoverHeight), Math.max(leftoverWidth, leftoverHeight)];
  return [free.width * free.height - orientation.frontWidthMm * orientation.frontHeightMm, Math.min(leftoverWidth, leftoverHeight)];
}

function candidateAnchors(free: Rect, orientation: Orientation, heuristic: MaxRectsHeuristic): Array<{ x: number; y: number }> {
  const bottomLeft = { x: free.x, y: free.y };
  if (heuristic !== 'bottom-left') return [bottomLeft];
  return [bottomLeft, { x: free.x + free.width - orientation.frontWidthMm, y: free.y }];
}

export function packMaxRects(input: NormalizedPackingInput, eligible: readonly ItemInstance[], orientations: ReadonlyMap<string, readonly Orientation[]>, ordering: OrderingName, heuristic: MaxRectsHeuristic): AlgorithmResult {
  let freeRectangles: Rect[] = [{ x: 0, y: 0, width: input.space.widthMm, height: input.space.heightMm }];
  const internal: InternalPlacement[] = [];
  const unplaced: UnplacedItem[] = [];

  for (const instance of orderInstances(eligible, ordering)) {
    let best: Choice | null = null;
    for (const free of freeRectangles) {
      for (const orientation of orientations.get(instance.id) ?? []) {
        if (orientation.frontWidthMm > free.width || orientation.frontHeightMm > free.height) continue;
        for (const anchor of candidateAnchors(free, orientation, heuristic)) {
          const proposed: InternalPlacement = {
            x: anchor.x,
            y: anchor.y,
            width: orientation.frontWidthMm,
            height: orientation.frontHeightMm,
            instance,
            orientation,
          };
          if (violatesStacking(proposed, internal)) continue;
          const [scoreA, scoreB] = choiceScore(free, orientation, anchor.x, anchor.y, heuristic);
          if (!best || scoreA < best.scoreA || (scoreA === best.scoreA && scoreB < best.scoreB)) best = { instance, orientation, x: anchor.x, y: anchor.y, scoreA, scoreB };
        }
      }
    }

    if (!best) {
      unplaced.push({ instanceId: instance.id, definitionId: instance.definitionId, reason: 'no-free-rectangle', messageKey: 'no-free-rectangle' });
      continue;
    }

    const placed: InternalPlacement = {
      x: best.x,
      y: best.y,
      width: best.orientation.frontWidthMm,
      height: best.orientation.frontHeightMm,
      instance: best.instance,
      orientation: best.orientation,
    };
    internal.push(placed);

    const reserved = clipRect({
      x: placed.x,
      y: placed.y,
      width: placed.width + input.space.horizontalGapMm,
      height: placed.height + input.space.verticalGapMm,
    }, input.space.widthMm, input.space.heightMm);
    freeRectangles = pruneFreeRectangles(freeRectangles.flatMap((free) => splitFreeRectangle(free, reserved)));
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
    fragmentedFreeRectCount: freeRectangles.length,
  };
}
