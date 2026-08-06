import type { Placement } from '../../types/domain';

export function layoutFingerprint(placements: readonly Placement[]): string {
  return [...placements]
    .sort((a, b) => a.instanceId.localeCompare(b.instanceId))
    .map((placement) => [placement.instanceId, placement.xMm, placement.yMm, placement.widthMm, placement.heightMm, placement.orientation].join(':'))
    .join('|');
}
