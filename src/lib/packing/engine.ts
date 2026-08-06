import type { GeneratedLayouts, LayoutMode, LayoutResult, ShelfSketchProject, UnplacedItem } from '../../types/domain';
import type { PackingCandidate, PackingEngine, PackingLimits } from './contracts';
import { DEFAULT_PACKING_LIMITS } from './constants';
import { classifyInput } from './classify';
import { buildExplanations } from './explanations';
import { layoutFingerprint } from './fingerprint';
import { calculateMetrics } from './metrics';
import { normalizeProject } from './normalize';
import type { OrderingName } from './orderings';
import { packMaxRects, type MaxRectsHeuristic } from './algorithms/maxrects';
import { packShelves } from './algorithms/shelf';
import { scoreForMode } from './scoring';

const ORDERINGS: OrderingName[] = ['area-desc', 'height-desc', 'width-desc', 'access-first', 'nonstackable-first', 'area-asc'];
const MAXRECTS_HEURISTICS: MaxRectsHeuristic[] = ['bottom-left', 'best-area', 'best-short-side'];
const MODES: LayoutMode[] = ['compact', 'easy-access', 'balanced'];

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function mergeLimits(partial?: Partial<PackingLimits>): PackingLimits {
  return { ...DEFAULT_PACKING_LIMITS, ...partial };
}

function limitedUnplaced(ids: readonly string[]): UnplacedItem[] {
  return ids.map((instanceId) => ({
    instanceId,
    definitionId: instanceId.split('__')[0] ?? instanceId,
    reason: 'candidate-limit' as const,
    messageKey: 'candidate-limit',
  }));
}

function candidateFromAlgorithm(project: ShelfSketchProject, algorithm: string, ordering: string, placements: ReturnType<typeof packMaxRects>['placements'], algorithmUnplaced: ReturnType<typeof packMaxRects>['unplaced'], rejected: UnplacedItem[], limited: UnplacedItem[], fragmentedFreeRectCount: number, requestedCount: number, instancesById: ReadonlyMap<string, ReturnType<typeof normalizeProject>['input']['instances'][number]>): PackingCandidate {
  const unplaced = [...rejected, ...algorithmUnplaced, ...limited];
  const metrics = calculateMetrics(placements, requestedCount, project.space.widthMm, project.space.heightMm, instancesById, fragmentedFreeRectCount);
  return {
    algorithm,
    ordering,
    result: {
      id: `${algorithm}-${ordering}`,
      algorithm,
      fingerprint: layoutFingerprint(placements),
      placements,
      unplaced,
      metrics,
      explanations: [],
    },
  };
}

function selectCandidate(candidates: readonly PackingCandidate[], mode: LayoutMode, input: ReturnType<typeof normalizeProject>['input'], usedFingerprints: Set<string>): LayoutResult {
  const ranked = candidates
    .map((candidate) => ({ candidate, score: scoreForMode(candidate, mode, input) }))
    .sort((a, b) => b.score - a.score || b.candidate.result.metrics.placedCount - a.candidate.result.metrics.placedCount || a.candidate.algorithm.localeCompare(b.candidate.algorithm));
  const selected = ranked.find((entry) => !usedFingerprints.has(entry.candidate.result.fingerprint)) ?? ranked[0];
  if (!selected) throw new Error('Packing engine produced no candidate layouts.');
  usedFingerprints.add(selected.candidate.result.fingerprint);
  const base: LayoutResult = {
    ...selected.candidate.result,
    id: `${mode}-${selected.candidate.algorithm}-${selected.candidate.ordering}`,
    mode,
    score: selected.score,
    explanations: [],
  };
  return { ...base, explanations: buildExplanations(base, mode) };
}

export const packingEngine: PackingEngine = {
  generate(project, partialLimits) {
    const startedAt = nowMs();
    const limits = mergeLimits(partialLimits);
    const normalized = normalizeProject(project, limits);
    const classified = classifyInput(normalized.input);
    const candidates: PackingCandidate[] = [];
    const instancesById = new Map(normalized.input.instances.map((instance) => [instance.id, instance]));
    const requestedCount = project.items.reduce((sum, item) => sum + item.quantity, 0);
    const limited = limitedUnplaced(normalized.limitedInstanceIds);

    outer: for (const ordering of ORDERINGS) {
      for (const heuristic of MAXRECTS_HEURISTICS) {
        if (candidates.length >= limits.maxCandidateAttempts || nowMs() - startedAt > limits.softTimeBudgetMs) break outer;
        const packed = packMaxRects(normalized.input, classified.eligible, classified.orientationsByInstanceId, ordering, heuristic);
        candidates.push(candidateFromAlgorithm(project, `maxrects-${heuristic}`, ordering, packed.placements, packed.unplaced, classified.rejected, limited, packed.fragmentedFreeRectCount, requestedCount, instancesById));
      }
      if (candidates.length >= limits.maxCandidateAttempts || nowMs() - startedAt > limits.softTimeBudgetMs) break;
      const shelves = packShelves(normalized.input, classified.eligible, classified.orientationsByInstanceId, ordering);
      candidates.push(candidateFromAlgorithm(project, 'shelf-rows', ordering, shelves.placements, shelves.unplaced, classified.rejected, limited, shelves.fragmentedFreeRectCount, requestedCount, instancesById));
      if (nowMs() - startedAt > limits.hardTimeBudgetMs) break;
    }

    if (!candidates.length) {
      const empty = candidateFromAlgorithm(project, 'none', 'none', [], classified.eligible.map((instance) => ({ instanceId: instance.id, definitionId: instance.definitionId, reason: 'candidate-limit' as const, messageKey: 'candidate-limit' })), classified.rejected, limited, 1, requestedCount, instancesById);
      candidates.push(empty);
    }

    const usedFingerprints = new Set<string>();
    const selected = new Map<LayoutMode, LayoutResult>();
    for (const mode of MODES) selected.set(mode, selectCandidate(candidates, mode, normalized.input, usedFingerprints));

    return {
      compact: selected.get('compact')!,
      easyAccess: selected.get('easy-access')!,
      balanced: selected.get('balanced')!,
      generatedAt: new Date().toISOString(),
      durationMs: Math.max(0, nowMs() - startedAt),
    };
  },
};
