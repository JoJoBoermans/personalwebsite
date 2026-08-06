import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { movePlacement, nudgePlacement, removePlacement, rotatePlacement, snapMillimetres, type EditorSnapshot } from '../../lib/editor';
import { formatMm } from '../../lib/units';
import type { Placement, ShelfSketchProject } from '../../types/domain';

interface Props {
  project: ShelfSketchProject;
  snapshot: EditorSnapshot;
  selectedInstanceId: string | null;
  zoomPercent: number;
  onSelect: (instanceId: string | null) => void;
  onCommit: (snapshot: EditorSnapshot, message: string) => void;
  onStatus: (message: string) => void;
}

interface DragSession {
  pointerId: number;
  instanceId: string;
  offsetXmm: number;
  offsetYmm: number;
  origin: EditorSnapshot;
}

const PALETTE = [
  { base: '#f4d7bd', line: '#8b5a32' },
  { base: '#dce9df', line: '#496858' },
  { base: '#e8dded', line: '#695474' },
  { base: '#f5e9b9', line: '#796921' },
  { base: '#d8e6ef', line: '#486878' },
  { base: '#ecd8d4', line: '#7f5149' },
];

function instanceLabel(project: ShelfSketchProject, placement: Placement): string {
  const definition = project.items.find((item) => item.id === placement.definitionId);
  if (!definition) return placement.instanceId;
  const ordinal = Number(placement.instanceId.split('__').at(-1));
  return definition.quantity > 1 && Number.isFinite(ordinal) ? `${definition.label} ${ordinal}` : definition.label;
}

function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } | null {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformed = point.matrixTransform(matrix.inverse());
  return { x: transformed.x, y: transformed.y };
}

export default function LayoutCanvas({ project, snapshot, selectedInstanceId, zoomPercent, onSelect, onCommit, onStatus }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragSession, setDragSession] = useState<DragSession | null>(null);
  const [dragDraft, setDragDraft] = useState<EditorSnapshot | null>(null);
  const displaySnapshot = dragDraft ?? snapshot;
  const space = project.space;
  const padding = Math.max(55, Math.min(space.widthMm, space.heightMm) * 0.14);
  const fontSize = Math.max(14, Math.min(30, Math.min(space.widthMm, space.heightMm) * 0.045));
  const definitionStyle = useMemo(() => new Map(project.items.map((item, index) => [item.id, index % PALETTE.length])), [project.items]);

  const beginDrag = (event: ReactPointerEvent<SVGGElement>, placement: Placement) => {
    if (!svgRef.current) return;
    const point = svgPoint(svgRef.current, event.clientX, event.clientY);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(placement.instanceId);
    setDragDraft(null);
    setDragSession({
      pointerId: event.pointerId,
      instanceId: placement.instanceId,
      offsetXmm: point.x - placement.xMm,
      offsetYmm: point.y - placement.yMm,
      origin: snapshot,
    });
    onStatus(`Moving ${instanceLabel(project, placement)}. Drag or use the arrow keys.`);
  };

  const continueDrag = (event: ReactPointerEvent<SVGGElement>) => {
    if (!dragSession || event.pointerId !== dragSession.pointerId || !svgRef.current) return;
    const point = svgPoint(svgRef.current, event.clientX, event.clientY);
    if (!point) return;
    event.preventDefault();
    const xMm = snapMillimetres(point.x - dragSession.offsetXmm, 5);
    const yMm = snapMillimetres(point.y - dragSession.offsetYmm, 5);
    const result = movePlacement(dragSession.origin, dragSession.instanceId, xMm, yMm, project);
    if (result.ok) {
      setDragDraft(result.snapshot);
      onStatus(`Valid position: ${formatMm(xMm, project.displayUnit)} from the left and ${formatMm(yMm, project.displayUnit)} from the top.`);
    } else {
      onStatus(result.message);
    }
  };

  const finishDrag = (event: ReactPointerEvent<SVGGElement>) => {
    if (!dragSession || event.pointerId !== dragSession.pointerId) return;
    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (dragDraft) onCommit(dragDraft, 'Item moved by drag.');
    else onStatus('The item stayed in its last valid position.');
    setDragDraft(null);
    setDragSession(null);
  };

  const cancelDrag = (event: ReactPointerEvent<SVGGElement>) => {
    if (!dragSession || event.pointerId !== dragSession.pointerId) return;
    setDragDraft(null);
    setDragSession(null);
    onStatus('Drag cancelled.');
  };

  const handleObjectKeyDown = (event: KeyboardEvent<SVGGElement>, placement: Placement) => {
    const baseStep = event.shiftKey ? 1 : event.ctrlKey || event.metaKey ? 50 : 10;
    let result = null;
    if (event.key === 'ArrowLeft') result = nudgePlacement(snapshot, placement.instanceId, -baseStep, 0, project);
    if (event.key === 'ArrowRight') result = nudgePlacement(snapshot, placement.instanceId, baseStep, 0, project);
    if (event.key === 'ArrowUp') result = nudgePlacement(snapshot, placement.instanceId, 0, -baseStep, project);
    if (event.key === 'ArrowDown') result = nudgePlacement(snapshot, placement.instanceId, 0, baseStep, project);
    if (event.key.toLowerCase() === 'r') result = rotatePlacement(snapshot, placement.instanceId, project);
    if (event.key === 'Delete' || event.key === 'Backspace') result = removePlacement(snapshot, placement.instanceId);
    if (!result) return;
    event.preventDefault();
    onSelect(placement.instanceId);
    if (result.ok) onCommit(result.snapshot, result.message);
    else onStatus(result.message);
  };

  return (
    <div className="layout-canvas-shell">
      <div className="layout-canvas-scroll" style={{ '--canvas-zoom': `${zoomPercent}%` } as CSSProperties}>
        <svg
          ref={svgRef}
          className="layout-canvas"
          viewBox={`${-padding} ${-padding} ${space.widthMm + padding * 2} ${space.heightMm + padding * 2}`}
          role="group"
          aria-labelledby="layout-canvas-title layout-canvas-description"
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={(event: ReactPointerEvent<SVGSVGElement>) => {
            if (event.target === event.currentTarget) onSelect(null);
          }}
        >
          <title id="layout-canvas-title">Editable scaled shelf layout</title>
          <desc id="layout-canvas-description">A front view of {project.name || 'the shelf'} with {displaySnapshot.placements.length} placed objects. Select an object to move, rotate, or remove it.</desc>
          <defs>
            <marker id="measure-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
              <path d="M 0 0 L 8 4 L 0 8 z" className="measure-arrow-head" />
            </marker>
            {PALETTE.map((style, index) => (
              <pattern key={index} id={`item-pattern-${index}`} width="18" height="18" patternUnits="userSpaceOnUse">
                <rect width="18" height="18" fill={style.base} />
                {index % 3 === 0 && <path d="M-4 18 L18 -4 M5 22 L22 5" stroke={style.line} strokeWidth="2" opacity=".28" />}
                {index % 3 === 1 && <circle cx="5" cy="5" r="1.8" fill={style.line} opacity=".28" />}
                {index % 3 === 2 && <path d="M0 9 H18 M9 0 V18" stroke={style.line} strokeWidth="1.5" opacity=".22" />}
              </pattern>
            ))}
          </defs>

          <g className="canvas-measurements" aria-hidden="true">
            <line x1="0" y1={-padding * .48} x2={space.widthMm} y2={-padding * .48} markerStart="url(#measure-arrow)" markerEnd="url(#measure-arrow)" />
            <text x={space.widthMm / 2} y={-padding * .62} textAnchor="middle" style={{ fontSize }}>{formatMm(space.widthMm, project.displayUnit)} wide</text>
            <line x1={-padding * .48} y1="0" x2={-padding * .48} y2={space.heightMm} markerStart="url(#measure-arrow)" markerEnd="url(#measure-arrow)" />
            <text x={-padding * .64} y={space.heightMm / 2} textAnchor="middle" transform={`rotate(-90 ${-padding * .64} ${space.heightMm / 2})`} style={{ fontSize }}>{formatMm(space.heightMm, project.displayUnit)} high</text>
          </g>

          <rect className="canvas-space" x="0" y="0" width={space.widthMm} height={space.heightMm} rx={Math.min(18, space.widthMm * .02)} />
          <g className="canvas-grid" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((index) => <line key={`v-${index}`} x1={space.widthMm * index / 10} y1="0" x2={space.widthMm * index / 10} y2={space.heightMm} />)}
            {Array.from({ length: 9 }, (_, index) => index + 1).map((index) => <line key={`h-${index}`} x1="0" y1={space.heightMm * index / 10} x2={space.widthMm} y2={space.heightMm * index / 10} />)}
          </g>

          {displaySnapshot.placements.map((placement) => {
            const selected = selectedInstanceId === placement.instanceId;
            const label = instanceLabel(project, placement);
            const styleIndex = definitionStyle.get(placement.definitionId) ?? 0;
            const compactLabel = label.length > 22 ? `${label.slice(0, 20)}…` : label;
            return (
              <g
                key={placement.instanceId}
                className={`canvas-item ${selected ? 'is-selected' : ''} ${dragSession?.instanceId === placement.instanceId ? 'is-dragging' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${label}, ${formatMm(placement.widthMm, project.displayUnit)} by ${formatMm(placement.heightMm, project.displayUnit)}, ${placement.orientation === 'base-rotated' ? 'rotated on its base' : 'normal orientation'}.`}
                transform={`translate(${placement.xMm} ${placement.yMm})`}
                onFocus={() => onSelect(placement.instanceId)}
                onClick={() => onSelect(placement.instanceId)}
                onKeyDown={(event: KeyboardEvent<SVGGElement>) => handleObjectKeyDown(event, placement)}
                onPointerDown={(event: ReactPointerEvent<SVGGElement>) => beginDrag(event, placement)}
                onPointerMove={continueDrag}
                onPointerUp={finishDrag}
                onPointerCancel={cancelDrag}
              >
                <rect className="canvas-item-fill" width={placement.widthMm} height={placement.heightMm} rx={Math.min(14, placement.widthMm * .05, placement.heightMm * .12)} fill={`url(#item-pattern-${styleIndex})`} />
                <rect className="canvas-item-outline" width={placement.widthMm} height={placement.heightMm} rx={Math.min(14, placement.widthMm * .05, placement.heightMm * .12)} />
                <text className="canvas-item-label" x={placement.widthMm / 2} y={placement.heightMm / 2 - fontSize * .12} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: Math.min(fontSize, Math.max(10, placement.widthMm / 10)) }}>{compactLabel}</text>
                <text className="canvas-item-size" x={placement.widthMm / 2} y={placement.heightMm / 2 + fontSize * .85} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: Math.min(fontSize * .66, Math.max(8, placement.widthMm / 14)) }}>{formatMm(placement.widthMm, project.displayUnit)} × {formatMm(placement.heightMm, project.displayUnit)}{placement.orientation === 'base-rotated' ? ' ↻' : ''}</text>
                {selected && <rect className="canvas-selection-ring" x={-5} y={-5} width={placement.widthMm + 10} height={placement.heightMm + 10} rx={Math.min(18, placement.widthMm * .05, placement.heightMm * .12) + 5} />}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="canvas-help">Drag an item, select it and use the controls, or focus it and press the arrow keys. Hold Shift for 1 mm steps or Ctrl/⌘ for 50 mm steps.</p>
    </div>
  );
}
