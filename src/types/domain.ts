export type DisplayUnit = 'cm' | 'in';
export type LayoutMode = 'compact' | 'easy-access' | 'balanced';
export type AccessPriority = 'normal' | 'important';
export type OrientationKind = 'normal' | 'base-rotated';
export type ReducedMotionPreference = 'system' | 'reduce' | 'allow';

export interface SpaceDimensions {
  widthMm: number;
  heightMm: number;
  depthMm: number;
  horizontalGapMm: number;
  verticalGapMm: number;
}

export interface ItemDefinition {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  quantity: number;
  allowBaseRotation: boolean;
  stackable: boolean;
  accessPriority: AccessPriority;
}

export interface PlannerPreferences {
  defaultMode: LayoutMode;
  reducedMotionOverride: ReducedMotionPreference;
}

export interface ShelfSketchProject {
  schemaVersion: 1;
  id: string;
  name: string;
  displayUnit: DisplayUnit;
  space: SpaceDimensions;
  items: ItemDefinition[];
  preferences: PlannerPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface ItemInstance {
  id: string;
  definitionId: string;
  ordinal: number;
  label: string;
  source: ItemDefinition;
}

export interface Orientation {
  kind: OrientationKind;
  frontWidthMm: number;
  frontHeightMm: number;
  requiredDepthMm: number;
}

export interface Placement {
  instanceId: string;
  definitionId: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  orientation: OrientationKind;
}

export type UnplacedReasonCode =
  | 'too-deep'
  | 'too-wide'
  | 'too-tall'
  | 'no-free-rectangle'
  | 'candidate-limit'
  | 'invalid-item';

export interface UnplacedItem {
  instanceId: string;
  definitionId: string;
  reason: UnplacedReasonCode;
  excessMm?: number;
  messageKey: string;
}

export interface LayoutMetrics {
  requestedCount: number;
  placedCount: number;
  unplacedCount: number;
  usedFrontAreaMm2: number;
  availableFrontAreaMm2: number;
  utilizationRatio: number;
  rotationCount: number;
  priorityPlacedCount: number;
  minimumClearanceMm: number;
  fragmentedFreeRectCount: number;
}

export interface LayoutExplanation {
  code: string;
  messageKey: string;
  instanceIds?: string[];
  valueMm?: number;
  valueCount?: number;
}

export interface LayoutResult {
  id: string;
  mode: LayoutMode;
  algorithm: string;
  fingerprint: string;
  placements: Placement[];
  unplaced: UnplacedItem[];
  metrics: LayoutMetrics;
  explanations: LayoutExplanation[];
  score: number;
}

export interface GeneratedLayouts {
  compact: LayoutResult;
  easyAccess: LayoutResult;
  balanced: LayoutResult;
  generatedAt: string;
  durationMs: number;
}
