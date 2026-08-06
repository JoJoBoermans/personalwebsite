import type { ShelfSketchProject } from '../../types/domain';
import { formatDimensions } from '../../lib/units';

interface Props { project: ShelfSketchProject; }

const fills = ['preview-fill-a', 'preview-fill-b', 'preview-fill-c', 'preview-fill-d'];

export default function DimensionPreview({ project }: Props) {
  const width = Math.max(project.space.widthMm, 1);
  const height = Math.max(project.space.heightMm, 1);
  const ratio = Math.min(2.2, Math.max(0.7, width / height));
  const viewWidth = 620;
  const viewHeight = viewWidth / ratio;
  const totalItems = project.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="dimension-preview">
      <svg viewBox={`0 0 ${viewWidth + 80} ${viewHeight + 80}`} role="img" aria-labelledby="preview-title preview-description">
        <title id="preview-title">Proportional preview of the available shelf space</title>
        <desc id="preview-description">An empty rectangle representing {formatDimensions(project.space.widthMm, project.space.heightMm, project.space.depthMm, project.displayUnit)}. The generated placements are summarised in the results step; scaled placement rendering is added in Phase 4.</desc>
        <rect x="42" y="32" width={viewWidth} height={viewHeight} rx="14" className="preview-space" />
        <line x1="42" y1={viewHeight + 54} x2={viewWidth + 42} y2={viewHeight + 54} className="preview-measure" />
        <text x={viewWidth / 2 + 42} y={viewHeight + 73} textAnchor="middle" className="preview-label">inside width</text>
        <line x1="20" y1="32" x2="20" y2={viewHeight + 32} className="preview-measure" />
        <text x="10" y={viewHeight / 2 + 32} textAnchor="middle" className="preview-label" transform={`rotate(-90 10 ${viewHeight / 2 + 32})`}>inside height</text>
        {project.items.slice(0, 4).map((item, index) => {
          const itemWidth = Math.max(48, Math.min(130, item.widthMm / width * viewWidth));
          const itemHeight = Math.max(34, Math.min(90, item.heightMm / height * viewHeight));
          return (
            <g key={item.id} transform={`translate(${65 + index * 105}, ${55 + (index % 2) * 105})`}>
              <rect width={itemWidth} height={itemHeight} rx="8" className={fills[index % fills.length]} />
              <text x={itemWidth / 2} y={itemHeight / 2 + 4} textAnchor="middle" className="preview-item-label">{index + 1}</text>
            </g>
          );
        })}
      </svg>
      <div className="preview-summary">
        <span><strong>{project.items.length}</strong> item types</span>
        <span><strong>{totalItems}</strong> objects requested</span>
        <span><strong>Ready</strong> for layout generation</span>
      </div>
    </div>
  );
}
