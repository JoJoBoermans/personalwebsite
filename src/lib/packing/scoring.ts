import type { LayoutMode } from '../../types/domain';
import type { LayoutScorer, NormalizedPackingInput, PackingCandidate } from './contracts';

function accessPositionScore(candidate: PackingCandidate, input: NormalizedPackingInput): number {
  const byId = new Map(input.instances.map((instance) => [instance.id, instance]));
  if (!candidate.result.placements.length) return 0;
  return candidate.result.placements.reduce((score, placement) => {
    const instance = byId.get(placement.instanceId);
    if (!instance || instance.source.accessPriority !== 'important') return score;
    const bottomDistance = input.space.heightMm - (placement.yMm + placement.heightMm);
    const normalized = 1 - Math.min(1, bottomDistance / Math.max(1, input.space.heightMm));
    return score + normalized;
  }, 0);
}

export const scoreCandidate: LayoutScorer = (candidate, mode, input) => {
  const metrics = candidate.result.metrics;
  const placedRatio = metrics.requestedCount ? metrics.placedCount / metrics.requestedCount : 0;
  const priorityTotal = input.instances.filter((instance) => instance.source.accessPriority === 'important').length;
  const priorityRatio = priorityTotal ? metrics.priorityPlacedCount / priorityTotal : 1;
  const fragmentationPenalty = Math.min(1, metrics.fragmentedFreeRectCount / 20);
  const rotationPenalty = metrics.requestedCount ? metrics.rotationCount / metrics.requestedCount : 0;
  const clearanceRatio = Math.min(1, metrics.minimumClearanceMm / Math.max(1, Math.min(input.space.widthMm, input.space.heightMm) * 0.15));
  const accessPosition = priorityTotal ? accessPositionScore(candidate, input) / priorityTotal : 1;

  if (mode === 'compact') {
    return placedRatio * 10_000 + metrics.utilizationRatio * 1_200 - fragmentationPenalty * 180 - rotationPenalty * 25;
  }
  if (mode === 'easy-access') {
    return placedRatio * 9_000 + priorityRatio * 1_200 + accessPosition * 500 + clearanceRatio * 280 - fragmentationPenalty * 80 - metrics.utilizationRatio * 30;
  }
  return placedRatio * 9_600 + metrics.utilizationRatio * 650 + priorityRatio * 450 + accessPosition * 180 + clearanceRatio * 100 - fragmentationPenalty * 120 - rotationPenalty * 10;
};

export function scoreForMode(candidate: PackingCandidate, mode: LayoutMode, input: NormalizedPackingInput): number {
  return scoreCandidate(candidate, mode, input);
}
