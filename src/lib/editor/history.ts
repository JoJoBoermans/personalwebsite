import type { Placement } from '../../types/domain';
import type { EditorHistory, EditorSnapshot } from './contracts';

export function cloneSnapshot(snapshot: EditorSnapshot): EditorSnapshot {
  return {
    placements: snapshot.placements.map((placement) => ({ ...placement })),
    manuallyRemovedInstanceIds: [...snapshot.manuallyRemovedInstanceIds],
  };
}

export function createEditorSnapshot(placements: readonly Placement[]): EditorSnapshot {
  return { placements: placements.map((placement) => ({ ...placement })), manuallyRemovedInstanceIds: [] };
}

export function createEditorHistory(placements: readonly Placement[]): EditorHistory {
  return { past: [], present: createEditorSnapshot(placements), future: [] };
}

export function snapshotsEqual(a: EditorSnapshot, b: EditorSnapshot): boolean {
  if (a.manuallyRemovedInstanceIds.join('|') !== b.manuallyRemovedInstanceIds.join('|')) return false;
  if (a.placements.length !== b.placements.length) return false;
  return a.placements.every((placement, index) => {
    const other = b.placements[index];
    return other !== undefined
      && placement.instanceId === other.instanceId
      && placement.xMm === other.xMm
      && placement.yMm === other.yMm
      && placement.widthMm === other.widthMm
      && placement.heightMm === other.heightMm
      && placement.orientation === other.orientation;
  });
}

export function commitHistory(history: EditorHistory, next: EditorSnapshot): EditorHistory {
  if (snapshotsEqual(history.present, next)) return history;
  return {
    past: [...history.past, cloneSnapshot(history.present)].slice(-50),
    present: cloneSnapshot(next),
    future: [],
  };
}

export function undoHistory(history: EditorHistory): EditorHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: cloneSnapshot(previous),
    future: [cloneSnapshot(history.present), ...history.future].slice(0, 50),
  };
}

export function redoHistory(history: EditorHistory): EditorHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, cloneSnapshot(history.present)].slice(-50),
    present: cloneSnapshot(next),
    future: history.future.slice(1),
  };
}
