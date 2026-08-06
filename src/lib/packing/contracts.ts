import type {
  GeneratedLayouts,
  ItemInstance,
  LayoutMode,
  LayoutResult,
  Orientation,
  ShelfSketchProject,
  SpaceDimensions,
} from '../../types/domain';

export interface NormalizedPackingInput {
  projectId: string;
  space: SpaceDimensions;
  instances: ItemInstance[];
  orientationsByInstanceId: ReadonlyMap<string, readonly Orientation[]>;
}

export interface PackingCandidate {
  algorithm: string;
  ordering: string;
  result: Omit<LayoutResult, 'mode' | 'score'>;
}

export interface PackingLimits {
  maxDefinitions: number;
  maxInstances: number;
  maxCandidateAttempts: number;
  softTimeBudgetMs: number;
  hardTimeBudgetMs: number;
}

export interface PackingEngine {
  generate(project: ShelfSketchProject, limits?: Partial<PackingLimits>): GeneratedLayouts;
}

export type LayoutScorer = (
  candidate: PackingCandidate,
  mode: LayoutMode,
  input: NormalizedPackingInput,
) => number;
