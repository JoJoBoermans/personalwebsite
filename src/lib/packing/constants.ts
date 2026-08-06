import type { PackingLimits } from './contracts';

export const DEFAULT_PACKING_LIMITS: PackingLimits = {
  maxDefinitions: 20,
  maxInstances: 160,
  maxCandidateAttempts: 36,
  softTimeBudgetMs: 160,
  hardTimeBudgetMs: 650,
};

export const SCORE_EPSILON = 1e-6;
