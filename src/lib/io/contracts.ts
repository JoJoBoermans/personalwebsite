import type { EditorSnapshot } from '../editor';
import type { GeneratedLayouts, LayoutMode, ShelfSketchProject } from '../../types/domain';

export interface PersistedEditorState {
  selectedMode: LayoutMode;
  snapshots: Record<LayoutMode, EditorSnapshot>;
}

export interface PlannerSession {
  storageVersion: 1;
  project: ShelfSketchProject;
  layouts: GeneratedLayouts | null;
  editorState: PersistedEditorState | null;
  savedAt: string;
}

export interface ImportSuccess {
  ok: true;
  project: ShelfSketchProject;
  message: string;
}

export interface ImportFailure {
  ok: false;
  message: string;
}

export type ImportResult = ImportSuccess | ImportFailure;

export interface ExportLayoutOptions {
  project: ShelfSketchProject;
  snapshot: EditorSnapshot;
  mode: LayoutMode;
  placedCount: number;
  requestedCount: number;
  utilizationPercent: number;
  unplacedLabels: string[];
}
