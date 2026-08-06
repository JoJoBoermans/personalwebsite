import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  commitHistory,
  createEditorHistory,
  createEditorSnapshot,
  nudgePlacement,
  redoHistory,
  removePlacement,
  rotatePlacement,
  snapshotsEqual,
  undoHistory,
  type EditResult,
  type EditorHistory,
  type EditorSnapshot,
} from '../../lib/editor';
import { explanationMessage, modeLabel, unplacedMessage } from '../../lib/packing';
import { calculateMetrics } from '../../lib/packing/metrics';
import { trackEvent } from '../../lib/analytics';
import { formatMm } from '../../lib/units';
import type { PersistedEditorState } from '../../lib/io';
import type { GeneratedLayouts, ItemInstance, LayoutMode, LayoutResult, ShelfSketchProject } from '../../types/domain';
import LayoutCanvas from './LayoutCanvas';
import LayoutEditorControls from './LayoutEditorControls';
import LayoutExportPanel from './LayoutExportPanel';
import LayoutPrintReport from './LayoutPrintReport';
import LayoutTextSummary from './LayoutTextSummary';

interface Props {
  project: ShelfSketchProject;
  layouts: GeneratedLayouts;
  onRegenerate: () => void;
  onEditProject: () => void;
  initialEditorState: PersistedEditorState | null;
  onEditorStateChange: (state: PersistedEditorState) => void;
  onSaveSession: () => void;
  saveStatus: 'idle' | 'saved' | 'failed';
}

const MODES: LayoutMode[] = ['compact', 'easy-access', 'balanced'];
type Histories = Record<LayoutMode, EditorHistory>;

function resultFor(layouts: GeneratedLayouts, mode: LayoutMode): LayoutResult {
  if (mode === 'compact') return layouts.compact;
  if (mode === 'easy-access') return layouts.easyAccess;
  return layouts.balanced;
}

function historyFromSnapshot(snapshot: EditorSnapshot): EditorHistory {
  return { past: [], present: { placements: snapshot.placements.map((placement) => ({ ...placement })), manuallyRemovedInstanceIds: [...snapshot.manuallyRemovedInstanceIds] }, future: [] };
}

function createHistories(layouts: GeneratedLayouts, initialEditorState: PersistedEditorState | null = null): Histories {
  return {
    compact: initialEditorState ? historyFromSnapshot(initialEditorState.snapshots.compact) : createEditorHistory(layouts.compact.placements),
    'easy-access': initialEditorState ? historyFromSnapshot(initialEditorState.snapshots['easy-access']) : createEditorHistory(layouts.easyAccess.placements),
    balanced: initialEditorState ? historyFromSnapshot(initialEditorState.snapshots.balanced) : createEditorHistory(layouts.balanced.placements),
  };
}

function instanceMap(project: ShelfSketchProject): Map<string, ItemInstance> {
  const map = new Map<string, ItemInstance>();
  for (const definition of project.items) {
    for (let ordinal = 1; ordinal <= definition.quantity; ordinal += 1) {
      const id = `${definition.id}__${ordinal}`;
      map.set(id, {
        id,
        definitionId: definition.id,
        ordinal,
        label: definition.quantity > 1 ? `${definition.label} ${ordinal}` : definition.label,
        source: definition,
      });
    }
  }
  return map;
}

export default function LayoutResults({ project, layouts, onRegenerate, onEditProject, initialEditorState, onEditorStateChange, onSaveSession, saveStatus }: Props) {
  const [selectedMode, setSelectedMode] = useState<LayoutMode>(initialEditorState?.selectedMode ?? project.preferences.defaultMode);
  const [histories, setHistories] = useState<Histories>(() => createHistories(layouts, initialEditorState));
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [status, setStatus] = useState('Select an item in the visual layout to edit it.');
  const [stepMm, setStepMm] = useState(10);
  const [zoomPercent, setZoomPercent] = useState(100);
  const result = resultFor(layouts, selectedMode);
  const history = histories[selectedMode];
  const snapshot = history.present;
  const instances = useMemo(() => instanceMap(project), [project]);
  const metrics = useMemo(() => calculateMetrics(
    snapshot.placements,
    result.metrics.requestedCount,
    project.space.widthMm,
    project.space.heightMm,
    instances,
    result.metrics.fragmentedFreeRectCount,
  ), [snapshot.placements, result.metrics.requestedCount, result.metrics.fragmentedFreeRectCount, project.space.widthMm, project.space.heightMm, instances]);
  const selectedPlacement = snapshot.placements.find((placement) => placement.instanceId === selectedInstanceId) ?? null;
  const edited = !snapshotsEqual(snapshot, createEditorSnapshot(result.placements));
  const utilization = Math.round(metrics.utilizationRatio * 100);
  const unplacedLabels = useMemo(() => {
    const labels = result.unplaced.map((item) => instances.get(item.instanceId)?.label ?? item.instanceId);
    for (const instanceId of snapshot.manuallyRemovedInstanceIds) {
      const label = instances.get(instanceId)?.label ?? instanceId;
      if (!labels.includes(label)) labels.push(label);
    }
    return labels;
  }, [result.unplaced, snapshot.manuallyRemovedInstanceIds, instances]);

  useEffect(() => {
    setHistories(createHistories(layouts, initialEditorState));
    setSelectedMode(initialEditorState?.selectedMode ?? project.preferences.defaultMode);
    setSelectedInstanceId(null);
    setStatus('Three fresh layouts generated. Select an item to edit it.');
  }, [layouts.generatedAt, layouts, project.preferences.defaultMode]);

  useEffect(() => {
    if (selectedInstanceId && !snapshot.placements.some((placement) => placement.instanceId === selectedInstanceId)) setSelectedInstanceId(null);
  }, [snapshot.placements, selectedInstanceId]);

  useEffect(() => {
    onEditorStateChange({
      selectedMode,
      snapshots: {
        compact: histories.compact.present,
        'easy-access': histories['easy-access'].present,
        balanced: histories.balanced.present,
      },
    });
  }, [histories, selectedMode, onEditorStateChange]);

  const setMode = (mode: LayoutMode, focusTab = false) => {
    if (mode !== selectedMode) trackEvent('alternative_layout_viewed', { layout_mode: mode });
    setSelectedMode(mode);
    setSelectedInstanceId(null);
    setStatus(`${modeLabel(mode)} layout selected.`);
    if (focusTab) window.requestAnimationFrame(() => document.getElementById(`layout-tab-${mode}`)?.focus());
  };

  const commitSnapshot = (next: EditorSnapshot, message: string) => {
    setHistories((current) => ({ ...current, [selectedMode]: commitHistory(current[selectedMode], next) }));
    setStatus(message);
  };

  const applyResult = (operation: EditResult, editType: string) => {
    if (operation.ok) {
      trackEvent('layout_manually_edited', { edit_type: editType });
      commitSnapshot(operation.snapshot, operation.message);
    }
    else setStatus(operation.message);
  };

  const nudgeSelected = (deltaXmm: number, deltaYmm: number) => {
    if (!selectedInstanceId) {
      setStatus('Select an item before moving it.');
      return;
    }
    applyResult(nudgePlacement(snapshot, selectedInstanceId, deltaXmm, deltaYmm, project), 'nudge');
  };

  const rotateSelected = () => {
    if (!selectedInstanceId) {
      setStatus('Select an item before rotating it.');
      return;
    }
    const operation = rotatePlacement(snapshot, selectedInstanceId, project);
    if (operation.ok) trackEvent('item_rotated', { layout_mode: selectedMode });
    applyResult(operation, 'rotate');
  };

  const removeSelected = () => {
    if (!selectedInstanceId) {
      setStatus('Select an item before removing it.');
      return;
    }
    const operation = removePlacement(snapshot, selectedInstanceId);
    if (operation.ok) {
      trackEvent('layout_manually_edited', { edit_type: 'remove' });
      commitSnapshot(operation.snapshot, operation.message);
      setSelectedInstanceId(null);
    } else setStatus(operation.message);
  };

  const undo = () => {
    if (!history.past.length) return;
    setHistories((current) => ({ ...current, [selectedMode]: undoHistory(current[selectedMode]) }));
    setStatus('Last edit undone.');
  };

  const redo = () => {
    if (!history.future.length) return;
    setHistories((current) => ({ ...current, [selectedMode]: redoHistory(current[selectedMode]) }));
    setStatus('Edit restored.');
  };

  const reset = () => {
    trackEvent('layout_manually_edited', { edit_type: 'reset' });
    setHistories((current) => ({ ...current, [selectedMode]: createEditorHistory(result.placements) }));
    setSelectedInstanceId(null);
    setStatus(`${modeLabel(selectedMode)} restored to the generated layout.`);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, mode: LayoutMode) => {
    const currentIndex = MODES.indexOf(mode);
    let nextIndex = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % MODES.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + MODES.length) % MODES.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = MODES.length - 1;
    if (nextIndex < 0) return;
    event.preventDefault();
    const nextMode = MODES[nextIndex];
    if (nextMode) setMode(nextMode, true);
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const isTextInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
    if (isTextInput) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    }
  };

  return (
    <section className="planner-step-content layout-results" aria-labelledby="layouts-heading" onKeyDown={handleEditorKeyDown}>
      <div className="step-copy step-copy-with-action">
        <div>
          <span className="step-kicker">Step 5</span>
          <h2 id="layouts-heading">Compare and edit the layouts</h2>
          <p>Each SVG is drawn to scale. Drag an item, use the accessible movement controls, or focus an item and use the keyboard. Invalid moves are rejected before they change the layout.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={onRegenerate}>Regenerate</button>
      </div>

      <div className="layout-tabs" role="tablist" aria-label="Generated layout styles">
        {MODES.map((mode) => {
          const modeResult = resultFor(layouts, mode);
          const modeHistory = histories[mode];
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              tabIndex={selectedMode === mode ? 0 : -1}
              aria-selected={selectedMode === mode}
              aria-controls={`layout-panel-${mode}`}
              id={`layout-tab-${mode}`}
              className={selectedMode === mode ? 'is-active' : ''}
              onClick={() => setMode(mode)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => handleTabKeyDown(event, mode)}
            >
              <span>{modeLabel(mode)}</span>
              <small>{modeHistory.present.placements.length}/{modeResult.metrics.requestedCount} placed{modeHistory.past.length ? ' · edited' : ''}</small>
            </button>
          );
        })}
      </div>

      <div id={`layout-panel-${selectedMode}`} role="tabpanel" aria-labelledby={`layout-tab-${selectedMode}`} tabIndex={0} className="layout-result-panel">
        <div className="layout-result-header">
          <div>
            <span className="status-pill">{modeLabel(selectedMode)}{edited ? ' · edited' : ''}</span>
            <h3>{metrics.unplacedCount === 0 ? 'Everything found a place' : `${metrics.placedCount} of ${metrics.requestedCount} items placed`}</h3>
            <p>{edited ? 'The live figures below reflect your manual edits. The engine explanation remains available as the starting rationale.' : `Generated with ${result.algorithm.replaceAll('-', ' ')} and the ${result.id.split('-').slice(-2).join(' ')} ordering.`}</p>
          </div>
          <div className="layout-score" aria-label={`Front area use ${utilization} percent`}>
            <strong>{utilization}%</strong>
            <span>front area used</span>
          </div>
        </div>

        <dl className="layout-metrics">
          <div><dt>Placed now</dt><dd>{metrics.placedCount}</dd></div>
          <div><dt>Not placed now</dt><dd>{metrics.unplacedCount}</dd></div>
          <div><dt>Rotated now</dt><dd>{metrics.rotationCount}</dd></div>
          <div><dt>Easy-reach placed</dt><dd>{metrics.priorityPlacedCount}</dd></div>
          <div><dt>Smallest positive clearance</dt><dd>{formatMm(metrics.minimumClearanceMm, project.displayUnit)}</dd></div>
          <div><dt>Edit history</dt><dd>{history.past.length} change{history.past.length === 1 ? '' : 's'}</dd></div>
        </dl>

        <div className="visual-editor-grid">
          <LayoutCanvas
            project={project}
            snapshot={snapshot}
            selectedInstanceId={selectedInstanceId}
            zoomPercent={zoomPercent}
            onSelect={setSelectedInstanceId}
            onCommit={(nextSnapshot, message) => { trackEvent('layout_manually_edited', { edit_type: 'drag' }); commitSnapshot(nextSnapshot, message); }}
            onStatus={setStatus}
          />
          <LayoutEditorControls
            project={project}
            selectedPlacement={selectedPlacement}
            stepMm={stepMm}
            zoomPercent={zoomPercent}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            edited={edited}
            status={status}
            onStepChange={setStepMm}
            onZoomChange={setZoomPercent}
            onNudge={nudgeSelected}
            onRotate={rotateSelected}
            onRemove={removeSelected}
            onUndo={undo}
            onRedo={redo}
            onReset={reset}
          />
        </div>

        <div className="layout-explanations" aria-label="Original generated-layout explanation">
          <h3>{edited ? 'Why the original result was chosen' : 'Why this result?'}</h3>
          <ul>{result.explanations.map((explanation) => <li key={`${result.id}-${explanation.code}`}>{explanationMessage(explanation, result)}</li>)}</ul>
        </div>

        <LayoutTextSummary project={project} snapshot={snapshot} />

        {result.unplaced.length > 0 && (
          <div className="unplaced-list" role="alert">
            <h3>Items the engine could not place</h3>
            <ul>{result.unplaced.map((item) => <li key={`${result.id}-${item.instanceId}`}>{unplacedMessage(item, project)}</li>)}</ul>
          </div>
        )}

        <LayoutExportPanel project={project} snapshot={snapshot} mode={selectedMode} placedCount={metrics.placedCount} requestedCount={metrics.requestedCount} utilizationPercent={utilization} unplacedLabels={unplacedLabels} saveStatus={saveStatus} onSaveSession={onSaveSession} />
        <LayoutPrintReport project={project} snapshot={snapshot} mode={selectedMode} placedCount={metrics.placedCount} requestedCount={metrics.requestedCount} utilizationPercent={utilization} unplacedLabels={unplacedLabels} />

        <div className="planning-disclaimer">
          <strong>Planning aid only</strong>
          <p>ShelfSketch uses rectangular outside dimensions. Always verify handles, lids, rounded corners, sloped sides and the physical space before purchasing or installing anything.</p>
        </div>

        <div className="action-row">
          <button className="button button-primary" type="button" onClick={onEditProject}>Edit measurements</button>
          <button className="button button-secondary" type="button" onClick={onRegenerate}>Generate fresh layouts</button>
        </div>
      </div>

      <p className="generation-meta">Generated locally in {Math.max(0, Math.round(layouts.durationMs))} ms. Generated and edited locally. Use Save project and layouts to keep this state on the current device.</p>
    </section>
  );
}
