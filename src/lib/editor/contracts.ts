import type { Placement } from '../../types/domain';

export interface EditorSnapshot {
  placements: Placement[];
  manuallyRemovedInstanceIds: string[];
}

export interface EditorHistory {
  past: EditorSnapshot[];
  present: EditorSnapshot;
  future: EditorSnapshot[];
}

export type EditFailureCode =
  | 'missing-placement'
  | 'missing-definition'
  | 'outside-space'
  | 'depth-exceeded'
  | 'rotation-disabled'
  | 'collision'
  | 'gap-violation'
  | 'stacking-violation';

export interface EditSuccess {
  ok: true;
  snapshot: EditorSnapshot;
  message: string;
}

export interface EditFailure {
  ok: false;
  snapshot: EditorSnapshot;
  code: EditFailureCode;
  message: string;
  conflictingInstanceId?: string;
}

export type EditResult = EditSuccess | EditFailure;
