import type { EditorSnapshot } from '../../lib/editor';
import { formatDimensions, formatMm } from '../../lib/units';
import type { LayoutMode, ShelfSketchProject } from '../../types/domain';

interface Props {
  project: ShelfSketchProject;
  snapshot: EditorSnapshot;
  mode: LayoutMode;
  placedCount: number;
  requestedCount: number;
  utilizationPercent: number;
  unplacedLabels: string[];
}

function labelFor(project: ShelfSketchProject, instanceId: string, definitionId: string): string {
  const definition = project.items.find((item) => item.id === definitionId);
  if (!definition) return instanceId;
  const ordinal = Number(instanceId.split('__').at(-1));
  return definition.quantity > 1 && Number.isFinite(ordinal) ? `${definition.label} ${ordinal}` : definition.label;
}

export default function LayoutPrintReport({ project, snapshot, mode, placedCount, requestedCount, utilizationPercent, unplacedLabels }: Props) {
  const scaleX = 1000 / project.space.widthMm;
  const scaleY = 620 / project.space.heightMm;
  const scale = Math.min(scaleX, scaleY);
  return (
    <article className="print-layout-report" aria-hidden="true">
      <header>
        <p className="print-brand">ShelfSketch</p>
        <h1>{project.name}</h1>
        <p>{mode.replace('-', ' ')} layout · {placedCount}/{requestedCount} placed · {utilizationPercent}% front area used</p>
      </header>
      <svg viewBox="0 0 1000 620" role="img" aria-label={`Printable ${mode} layout for ${project.name}`}>
        <rect x="0" y="0" width={project.space.widthMm * scale} height={project.space.heightMm * scale} fill="#fff" stroke="#17241f" strokeWidth="4" />
        {snapshot.placements.map((placement, index) => (
          <g key={placement.instanceId} transform={`translate(${placement.xMm * scale} ${placement.yMm * scale})`}>
            <rect width={placement.widthMm * scale} height={placement.heightMm * scale} fill={index % 2 ? '#e7efe9' : '#f3dfca'} stroke="#41554d" strokeWidth="2" />
            <text x={placement.widthMm * scale / 2} y={placement.heightMm * scale / 2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700">{labelFor(project, placement.instanceId, placement.definitionId)}</text>
          </g>
        ))}
      </svg>
      <dl>
        <div><dt>Space</dt><dd>{formatDimensions(project.space.widthMm, project.space.heightMm, project.space.depthMm, project.displayUnit)}</dd></div>
        <div><dt>Clearance</dt><dd>{formatMm(project.space.horizontalGapMm, project.displayUnit)} horizontal · {formatMm(project.space.verticalGapMm, project.displayUnit)} vertical</dd></div>
        <div><dt>Not placed</dt><dd>{unplacedLabels.length ? unplacedLabels.join(', ') : 'None'}</dd></div>
      </dl>
      <h2>Object list</h2>
      <table>
        <thead><tr><th>Object</th><th>Size in layout</th><th>Position</th><th>Orientation</th></tr></thead>
        <tbody>{snapshot.placements.map((placement) => <tr key={placement.instanceId}><td>{labelFor(project, placement.instanceId, placement.definitionId)}</td><td>{formatMm(placement.widthMm, project.displayUnit)} × {formatMm(placement.heightMm, project.displayUnit)}</td><td>{formatMm(placement.xMm, project.displayUnit)} left · {formatMm(placement.yMm, project.displayUnit)} top</td><td>{placement.orientation === 'base-rotated' ? 'Base rotated' : 'Normal'}</td></tr>)}</tbody>
      </table>
      <footer>ShelfSketch is a planning aid. Verify handles, lids, rounded corners, sloped sides and all physical measurements before purchasing, drilling or installing anything.</footer>
    </article>
  );
}
