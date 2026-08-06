import type { Placement, ShelfSketchProject } from '../../types/domain';
import type { EditFailure } from './contracts';

interface RectLike {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

function horizontalOverlap(a: RectLike, b: RectLike): number {
  return Math.max(0, Math.min(a.xMm + a.widthMm, b.xMm + b.widthMm) - Math.max(a.xMm, b.xMm));
}

function verticalOverlap(a: RectLike, b: RectLike): number {
  return Math.max(0, Math.min(a.yMm + a.heightMm, b.yMm + b.heightMm) - Math.max(a.yMm, b.yMm));
}

function horizontalSeparation(a: RectLike, b: RectLike): number {
  if (a.xMm + a.widthMm <= b.xMm) return b.xMm - (a.xMm + a.widthMm);
  if (b.xMm + b.widthMm <= a.xMm) return a.xMm - (b.xMm + b.widthMm);
  return -horizontalOverlap(a, b);
}

function verticalSeparation(a: RectLike, b: RectLike): number {
  if (a.yMm + a.heightMm <= b.yMm) return b.yMm - (a.yMm + a.heightMm);
  if (b.yMm + b.heightMm <= a.yMm) return a.yMm - (b.yMm + b.heightMm);
  return -verticalOverlap(a, b);
}

function failure(snapshot: EditFailure['snapshot'], code: EditFailure['code'], message: string, conflictingInstanceId?: string): EditFailure {
  return conflictingInstanceId === undefined
    ? { ok: false, snapshot, code, message }
    : { ok: false, snapshot, code, message, conflictingInstanceId };
}

export function validatePlacementCandidate(
  candidate: Placement,
  placements: readonly Placement[],
  project: ShelfSketchProject,
  snapshot: EditFailure['snapshot'],
): EditFailure | null {
  const definition = project.items.find((item) => item.id === candidate.definitionId);
  if (!definition) return failure(snapshot, 'missing-definition', 'The source item for this placement could not be found.');

  const requiredDepthMm = candidate.orientation === 'base-rotated' ? definition.widthMm : definition.depthMm;
  if (requiredDepthMm > project.space.depthMm) {
    return failure(snapshot, 'depth-exceeded', `This orientation is ${requiredDepthMm - project.space.depthMm} mm too deep for the shelf.`);
  }

  if (
    candidate.xMm < 0
    || candidate.yMm < 0
    || candidate.xMm + candidate.widthMm > project.space.widthMm
    || candidate.yMm + candidate.heightMm > project.space.heightMm
  ) {
    return failure(snapshot, 'outside-space', 'That move would place part of the item outside the usable shelf area.');
  }

  for (const other of placements) {
    if (other.instanceId === candidate.instanceId) continue;
    const overlapX = horizontalOverlap(candidate, other);
    const overlapY = verticalOverlap(candidate, other);
    if (overlapX > 0 && overlapY > 0) {
      return failure(snapshot, 'collision', 'That position overlaps another item.', other.instanceId);
    }

    const separationX = horizontalSeparation(candidate, other);
    const separationY = verticalSeparation(candidate, other);
    if (overlapY > 0 && separationX >= 0 && separationX < project.space.horizontalGapMm) {
      return failure(snapshot, 'gap-violation', `Keep at least ${project.space.horizontalGapMm} mm of horizontal clearance between these items.`, other.instanceId);
    }
    if (overlapX > 0 && separationY >= 0 && separationY < project.space.verticalGapMm) {
      return failure(snapshot, 'gap-violation', `Keep at least ${project.space.verticalGapMm} mm of vertical clearance between these items.`, other.instanceId);
    }

    if (overlapX > 0 && separationY >= project.space.verticalGapMm) {
      const candidateAbove = candidate.yMm + candidate.heightMm <= other.yMm;
      const otherAbove = other.yMm + other.heightMm <= candidate.yMm;
      if (candidateAbove) {
        const lowerDefinition = project.items.find((item) => item.id === other.definitionId);
        if (lowerDefinition && !lowerDefinition.stackable) {
          return failure(snapshot, 'stacking-violation', `${lowerDefinition.label} is marked as non-stackable and cannot support another item.`, other.instanceId);
        }
      }
      if (otherAbove && !definition.stackable) {
        return failure(snapshot, 'stacking-violation', `${definition.label} is marked as non-stackable and cannot support another item.`, other.instanceId);
      }
    }
  }

  return null;
}

export function placementsOverlap(a: Placement, b: Placement): boolean {
  return horizontalOverlap(a, b) > 0 && verticalOverlap(a, b) > 0;
}
