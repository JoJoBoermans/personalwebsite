import { formatMm } from '../../lib/units';
import type { EditorSnapshot } from '../../lib/editor';
import type { ShelfSketchProject } from '../../types/domain';

interface Props {
  project: ShelfSketchProject;
  snapshot: EditorSnapshot;
}

function labelFor(project: ShelfSketchProject, instanceId: string, definitionId?: string): string {
  const definition = project.items.find((item) => item.id === definitionId || instanceId.startsWith(`${item.id}__`));
  if (!definition) return instanceId;
  const ordinal = Number(instanceId.split('__').at(-1));
  return definition.quantity > 1 && Number.isFinite(ordinal) ? `${definition.label} ${ordinal}` : definition.label;
}

export default function LayoutTextSummary({ project, snapshot }: Props) {
  return (
    <div className="placement-list-wrap">
      <h3>Text layout summary</h3>
      <p className="field-hint">Coordinates are measured from the top-left of the usable front view and update after every accepted edit.</p>
      {snapshot.placements.length > 0 ? (
        <div className="placement-list" role="list">
          {snapshot.placements.map((placement) => (
            <article className="placement-row" role="listitem" key={placement.instanceId}>
              <div><strong>{labelFor(project, placement.instanceId, placement.definitionId)}</strong><span>{placement.orientation === 'base-rotated' ? 'Rotated on base' : 'Normal orientation'}</span></div>
              <dl>
                <div><dt>X</dt><dd>{formatMm(placement.xMm, project.displayUnit)}</dd></div>
                <div><dt>Y</dt><dd>{formatMm(placement.yMm, project.displayUnit)}</dd></div>
                <div><dt>Size</dt><dd>{formatMm(placement.widthMm, project.displayUnit)} × {formatMm(placement.heightMm, project.displayUnit)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : <div className="empty-state"><strong>No item remains in this edited layout.</strong><p>Use Undo or Reset layout to restore the generated placements.</p></div>}

      {snapshot.manuallyRemovedInstanceIds.length > 0 && (
        <div className="manual-removal-summary">
          <strong>Removed manually</strong>
          <ul>{snapshot.manuallyRemovedInstanceIds.map((instanceId) => <li key={instanceId}>{labelFor(project, instanceId)}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
