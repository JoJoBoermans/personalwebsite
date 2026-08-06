import type { Placement, ShelfSketchProject } from '../../types/domain';
import type { EditResult, EditorSnapshot } from './contracts';
import { cloneSnapshot } from './history';
import { validatePlacementCandidate } from './geometry';

function success(snapshot: EditorSnapshot, message: string): EditResult {
  return { ok: true, snapshot, message };
}

function missing(snapshot: EditorSnapshot): EditResult {
  return { ok: false, snapshot, code: 'missing-placement', message: 'Select an item in the layout first.' };
}

export function snapMillimetres(value: number, stepMm = 5): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / Math.max(1, stepMm)) * Math.max(1, stepMm);
}

export function replacePlacement(snapshot: EditorSnapshot, nextPlacement: Placement, project: ShelfSketchProject): EditResult {
  const index = snapshot.placements.findIndex((placement) => placement.instanceId === nextPlacement.instanceId);
  if (index < 0) return missing(snapshot);
  const invalid = validatePlacementCandidate(nextPlacement, snapshot.placements, project, snapshot);
  if (invalid) return invalid;
  const next = cloneSnapshot(snapshot);
  next.placements[index] = { ...nextPlacement };
  return success(next, 'Placement updated.');
}

export function movePlacement(snapshot: EditorSnapshot, instanceId: string, xMm: number, yMm: number, project: ShelfSketchProject): EditResult {
  const placement = snapshot.placements.find((entry) => entry.instanceId === instanceId);
  if (!placement) return missing(snapshot);
  return replacePlacement(snapshot, { ...placement, xMm: Math.round(xMm), yMm: Math.round(yMm) }, project);
}

export function nudgePlacement(snapshot: EditorSnapshot, instanceId: string, deltaXmm: number, deltaYmm: number, project: ShelfSketchProject): EditResult {
  const placement = snapshot.placements.find((entry) => entry.instanceId === instanceId);
  if (!placement) return missing(snapshot);
  return movePlacement(snapshot, instanceId, placement.xMm + deltaXmm, placement.yMm + deltaYmm, project);
}

export function rotatePlacement(snapshot: EditorSnapshot, instanceId: string, project: ShelfSketchProject): EditResult {
  const placement = snapshot.placements.find((entry) => entry.instanceId === instanceId);
  if (!placement) return missing(snapshot);
  const definition = project.items.find((item) => item.id === placement.definitionId);
  if (!definition) return { ok: false, snapshot, code: 'missing-definition', message: 'The source item for this placement could not be found.' };
  if (!definition.allowBaseRotation) return { ok: false, snapshot, code: 'rotation-disabled', message: `${definition.label} is not allowed to rotate on its base.` };

  const nextOrientation = placement.orientation === 'normal' ? 'base-rotated' : 'normal';
  const nextWidthMm = nextOrientation === 'base-rotated' ? definition.depthMm : definition.widthMm;
  const nextHeightMm = definition.heightMm;
  const centreX = placement.xMm + placement.widthMm / 2;
  const centreY = placement.yMm + placement.heightMm / 2;
  const maxX = Math.max(0, project.space.widthMm - nextWidthMm);
  const maxY = Math.max(0, project.space.heightMm - nextHeightMm);
  const candidate: Placement = {
    ...placement,
    orientation: nextOrientation,
    widthMm: nextWidthMm,
    heightMm: nextHeightMm,
    xMm: Math.max(0, Math.min(maxX, Math.round(centreX - nextWidthMm / 2))),
    yMm: Math.max(0, Math.min(maxY, Math.round(centreY - nextHeightMm / 2))),
  };
  const result = replacePlacement(snapshot, candidate, project);
  return result.ok ? { ...result, message: nextOrientation === 'base-rotated' ? 'Item rotated on its base.' : 'Item returned to its normal orientation.' } : result;
}

export function removePlacement(snapshot: EditorSnapshot, instanceId: string): EditResult {
  if (!snapshot.placements.some((placement) => placement.instanceId === instanceId)) return missing(snapshot);
  const next = cloneSnapshot(snapshot);
  next.placements = next.placements.filter((placement) => placement.instanceId !== instanceId);
  if (!next.manuallyRemovedInstanceIds.includes(instanceId)) next.manuallyRemovedInstanceIds.push(instanceId);
  return success(next, 'Item removed from this edited layout. Use Undo to restore it.');
}
