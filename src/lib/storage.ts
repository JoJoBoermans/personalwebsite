import type { DisplayUnit, GeneratedLayouts, LayoutMode, LayoutResult, Placement, ShelfSketchProject } from '../types/domain';
import { validatePlacementCandidate, type EditorSnapshot } from './editor';
import type { PersistedEditorState, PlannerSession } from './io/contracts';
import { parseProjectValue } from './io/project-file';
import { cloneProject } from './project';

const STORAGE_KEYS = {
  project: 'shelfsketch:last-project',
  session: 'shelfsketch:last-session-v1',
  unit: 'shelfsketch:display-unit',
  onboarding: 'shelfsketch:onboarding-complete',
  lastStep: 'shelfsketch:last-step',
} as const;

function canUseStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlacement(value: unknown): value is Placement {
  if (!isRecord(value)) return false;
  return typeof value.instanceId === 'string'
    && typeof value.definitionId === 'string'
    && Number.isSafeInteger(value.xMm)
    && Number.isSafeInteger(value.yMm)
    && Number.isSafeInteger(value.widthMm)
    && Number.isSafeInteger(value.heightMm)
    && (value.orientation === 'normal' || value.orientation === 'base-rotated');
}

function isEditorSnapshot(value: unknown): value is EditorSnapshot {
  return isRecord(value)
    && Array.isArray(value.placements)
    && value.placements.every(isPlacement)
    && Array.isArray(value.manuallyRemovedInstanceIds)
    && value.manuallyRemovedInstanceIds.every((entry) => typeof entry === 'string');
}

function isMode(value: unknown): value is LayoutMode {
  return value === 'compact' || value === 'easy-access' || value === 'balanced';
}

function cloneSnapshot(snapshot: EditorSnapshot): EditorSnapshot {
  return {
    placements: snapshot.placements.map((placement) => ({ ...placement })),
    manuallyRemovedInstanceIds: [...snapshot.manuallyRemovedInstanceIds],
  };
}

function isUnplaced(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const validReason = ['too-deep', 'too-wide', 'too-tall', 'no-free-rectangle', 'candidate-limit', 'invalid-item'].includes(String(value.reason));
  return typeof value.instanceId === 'string' && typeof value.definitionId === 'string' && validReason && typeof value.messageKey === 'string' && (value.excessMm === undefined || typeof value.excessMm === 'number');
}

function isMetrics(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return ['requestedCount', 'placedCount', 'unplacedCount', 'usedFrontAreaMm2', 'availableFrontAreaMm2', 'utilizationRatio', 'rotationCount', 'priorityPlacedCount', 'minimumClearanceMm', 'fragmentedFreeRectCount'].every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));
}

function isExplanation(value: unknown): boolean {
  return isRecord(value) && typeof value.code === 'string' && typeof value.messageKey === 'string' && (value.instanceIds === undefined || (Array.isArray(value.instanceIds) && value.instanceIds.every((id) => typeof id === 'string')));
}

function isLayoutResult(value: unknown): value is LayoutResult {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && isMode(value.mode)
    && typeof value.algorithm === 'string'
    && typeof value.fingerprint === 'string'
    && Array.isArray(value.placements)
    && value.placements.every(isPlacement)
    && Array.isArray(value.unplaced)
    && value.unplaced.every(isUnplaced)
    && isMetrics(value.metrics)
    && Array.isArray(value.explanations)
    && value.explanations.every(isExplanation)
    && typeof value.score === 'number'
    && Number.isFinite(value.score);
}

function isGeneratedLayouts(value: unknown): value is GeneratedLayouts {
  return isRecord(value)
    && isLayoutResult(value.compact)
    && isLayoutResult(value.easyAccess)
    && isLayoutResult(value.balanced)
    && typeof value.generatedAt === 'string'
    && typeof value.durationMs === 'number';
}

function isPersistedEditorState(value: unknown): value is PersistedEditorState {
  if (!isRecord(value) || !isMode(value.selectedMode) || !isRecord(value.snapshots)) return false;
  return isEditorSnapshot(value.snapshots.compact)
    && isEditorSnapshot(value.snapshots['easy-access'])
    && isEditorSnapshot(value.snapshots.balanced);
}

function snapshotCompatible(snapshot: EditorSnapshot, project: ShelfSketchProject): boolean {
  const allowedInstanceIds = new Set<string>();
  for (const definition of project.items) {
    for (let ordinal = 1; ordinal <= definition.quantity; ordinal += 1) allowedInstanceIds.add(`${definition.id}__${ordinal}`);
  }
  const placementIds = new Set<string>();
  for (const placement of snapshot.placements) {
    if (!allowedInstanceIds.has(placement.instanceId) || placementIds.has(placement.instanceId)) return false;
    placementIds.add(placement.instanceId);
    const failure = validatePlacementCandidate(placement, snapshot.placements, project, snapshot);
    if (failure) return false;
  }
  return snapshot.manuallyRemovedInstanceIds.every((id) => allowedInstanceIds.has(id) && !placementIds.has(id));
}

function cloneLayouts(layouts: GeneratedLayouts): GeneratedLayouts {
  return JSON.parse(JSON.stringify(layouts)) as GeneratedLayouts;
}

function cloneEditorState(state: PersistedEditorState): PersistedEditorState {
  return {
    selectedMode: state.selectedMode,
    snapshots: {
      compact: cloneSnapshot(state.snapshots.compact),
      'easy-access': cloneSnapshot(state.snapshots['easy-access']),
      balanced: cloneSnapshot(state.snapshots.balanced),
    },
  };
}

export function saveProjectLocally(project: ShelfSketchProject): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEYS.project, JSON.stringify(project));
    window.localStorage.setItem(STORAGE_KEYS.unit, project.displayUnit);
    return true;
  } catch {
    return false;
  }
}

export function savePlannerSession(project: ShelfSketchProject, layouts: GeneratedLayouts | null, editorState: PersistedEditorState | null): boolean {
  if (!canUseStorage()) return false;
  const session: PlannerSession = {
    storageVersion: 1,
    project: cloneProject(project),
    layouts: layouts ? cloneLayouts(layouts) : null,
    editorState: editorState ? cloneEditorState(editorState) : null,
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    window.localStorage.setItem(STORAGE_KEYS.project, JSON.stringify(project));
    window.localStorage.setItem(STORAGE_KEYS.unit, project.displayUnit);
    return true;
  } catch {
    return false;
  }
}

export function loadPlannerSession(): PlannerSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.storageVersion !== 1 || !isRecord(parsed.project)) return null;
    const projectResult = parseProjectValue(parsed.project);
    if (!projectResult.ok) return null;
    const project = projectResult.project;
    const layouts = parsed.layouts === null ? null : isGeneratedLayouts(parsed.layouts) ? cloneLayouts(parsed.layouts) : null;
    if (layouts && (!snapshotCompatible({ placements: layouts.compact.placements, manuallyRemovedInstanceIds: [] }, project) || !snapshotCompatible({ placements: layouts.easyAccess.placements, manuallyRemovedInstanceIds: [] }, project) || !snapshotCompatible({ placements: layouts.balanced.placements, manuallyRemovedInstanceIds: [] }, project))) return null;
    const editorState = parsed.editorState === null ? null : isPersistedEditorState(parsed.editorState) ? cloneEditorState(parsed.editorState) : null;
    if (editorState && (!layouts || !snapshotCompatible(editorState.snapshots.compact, project) || !snapshotCompatible(editorState.snapshots['easy-access'], project) || !snapshotCompatible(editorState.snapshots.balanced, project))) return null;
    return {
      storageVersion: 1,
      project: cloneProject(project),
      layouts,
      editorState,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function loadProjectLocally(): ShelfSketchProject | null {
  if (!canUseStorage()) return null;
  const session = loadPlannerSession();
  if (session) return cloneProject(session.project);
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.project);
    if (!value) return null;
    const parsed = JSON.parse(value) as unknown;
    const result = parseProjectValue(parsed);
    return result.ok ? cloneProject(result.project) : null;
  } catch {
    return null;
  }
}

export function loadDisplayUnit(): DisplayUnit | null {
  if (!canUseStorage()) return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.unit);
    return value === 'cm' || value === 'in' ? value : null;
  } catch {
    return null;
  }
}

export function saveLastStep(step: number): void {
  if (!canUseStorage()) return;
  try { window.localStorage.setItem(STORAGE_KEYS.lastStep, String(step)); } catch { /* Storage may be blocked or full. */ }
}

export function loadLastStep(): number | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.lastStep);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isInteger(value) && value >= 0 && value <= 4 ? value : null;
  } catch {
    return null;
  }
}

export function markOnboardingComplete(): void {
  if (!canUseStorage()) return;
  try { window.localStorage.setItem(STORAGE_KEYS.onboarding, 'true'); } catch { /* Storage may be blocked or full. */ }
}

export function clearShelfSketchStorage(): void {
  if (!canUseStorage()) return;
  try { Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key)); } catch { /* Storage may be blocked. */ }
}
