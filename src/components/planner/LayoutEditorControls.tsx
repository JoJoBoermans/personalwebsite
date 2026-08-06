import type { ChangeEvent } from 'react';
import { formatMm } from '../../lib/units';
import type { Placement, ShelfSketchProject } from '../../types/domain';

interface Props {
  project: ShelfSketchProject;
  selectedPlacement: Placement | null;
  stepMm: number;
  zoomPercent: number;
  canUndo: boolean;
  canRedo: boolean;
  edited: boolean;
  status: string;
  onStepChange: (stepMm: number) => void;
  onZoomChange: (zoomPercent: number) => void;
  onNudge: (deltaXmm: number, deltaYmm: number) => void;
  onRotate: () => void;
  onRemove: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export default function LayoutEditorControls({ project, selectedPlacement, stepMm, zoomPercent, canUndo, canRedo, edited, status, onStepChange, onZoomChange, onNudge, onRotate, onRemove, onUndo, onRedo, onReset }: Props) {
  const definition = selectedPlacement ? project.items.find((item) => item.id === selectedPlacement.definitionId) : null;
  return (
    <aside className="layout-editor-controls" aria-label="Manual layout controls">
      <div className="editor-toolbar">
        <div className="toolbar-group" role="group" aria-label="Edit history">
          <button type="button" className="editor-button" disabled={!canUndo} onClick={onUndo}>Undo</button>
          <button type="button" className="editor-button" disabled={!canRedo} onClick={onRedo}>Redo</button>
          <button type="button" className="editor-button" disabled={!edited} onClick={onReset}>Reset layout</button>
        </div>
        <label className="zoom-control">
          <span>Canvas zoom</span>
          <select value={zoomPercent} onChange={(event: ChangeEvent<HTMLSelectElement>) => onZoomChange(Number(event.target.value))}>
            <option value="100">100%</option>
            <option value="125">125%</option>
            <option value="150">150%</option>
            <option value="175">175%</option>
          </select>
        </label>
      </div>

      <div className="selected-object-panel">
        {selectedPlacement && definition ? (
          <>
            <div className="selected-object-heading">
              <div>
                <span className="step-kicker">Selected item</span>
                <h3>{definition.label}</h3>
              </div>
              <span className="orientation-badge">{selectedPlacement.orientation === 'base-rotated' ? 'Rotated ↻' : 'Normal'}</span>
            </div>
            <dl className="selected-object-facts">
              <div><dt>Position</dt><dd>{formatMm(selectedPlacement.xMm, project.displayUnit)} left · {formatMm(selectedPlacement.yMm, project.displayUnit)} top</dd></div>
              <div><dt>Front size</dt><dd>{formatMm(selectedPlacement.widthMm, project.displayUnit)} × {formatMm(selectedPlacement.heightMm, project.displayUnit)}</dd></div>
              <div><dt>Depth used</dt><dd>{formatMm(selectedPlacement.orientation === 'base-rotated' ? definition.widthMm : definition.depthMm, project.displayUnit)}</dd></div>
            </dl>

            <div className="movement-settings">
              <label>
                <span>Button movement</span>
                <select value={stepMm} onChange={(event: ChangeEvent<HTMLSelectElement>) => onStepChange(Number(event.target.value))}>
                  <option value="1">1 mm</option>
                  <option value="5">5 mm</option>
                  <option value="10">10 mm</option>
                  <option value="25">25 mm</option>
                  <option value="50">50 mm</option>
                </select>
              </label>
              <div className="direction-pad" role="group" aria-label={`Move ${definition.label}`}>
                <button type="button" aria-label={`Move ${definition.label} up by ${stepMm} millimetres`} onClick={() => onNudge(0, -stepMm)}>↑</button>
                <button type="button" aria-label={`Move ${definition.label} left by ${stepMm} millimetres`} onClick={() => onNudge(-stepMm, 0)}>←</button>
                <button type="button" aria-label={`Move ${definition.label} down by ${stepMm} millimetres`} onClick={() => onNudge(0, stepMm)}>↓</button>
                <button type="button" aria-label={`Move ${definition.label} right by ${stepMm} millimetres`} onClick={() => onNudge(stepMm, 0)}>→</button>
              </div>
            </div>

            <div className="selected-actions">
              <button type="button" className="button button-secondary" disabled={!definition.allowBaseRotation} onClick={onRotate}>Rotate on base</button>
              <button type="button" className="button button-secondary danger-button" onClick={onRemove}>Remove from layout</button>
            </div>
          </>
        ) : (
          <div className="selection-empty">
            <strong>Select an item to edit it.</strong>
            <p>Tap or click an item in the visual layout. Keyboard users can tab to an item and press the arrow keys.</p>
          </div>
        )}
      </div>
      <p className="editor-status" role="status" aria-live="polite">{status}</p>
    </aside>
  );
}
