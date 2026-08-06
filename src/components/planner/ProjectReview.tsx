import type { ShelfSketchProject } from '../../types/domain';
import { formatDimensions, formatMm } from '../../lib/units';
import type { ValidationIssue } from '../../lib/validation';
import ProjectFileControls from './ProjectFileControls';

interface Props {
  project: ShelfSketchProject;
  issues: ValidationIssue[];
  saveStatus: 'idle' | 'saved' | 'failed';
  importStatus: string;
  clearStatus: string;
  onSave: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onClearLocal: () => void;
}

export default function ProjectReview({ project, issues, saveStatus, importStatus, clearStatus, onSave, onReset, onExport, onImport, onClearLocal }: Props) {
  const requested = project.items.reduce((total, item) => total + item.quantity, 0);
  const important = project.items.filter((item) => item.accessPriority === 'important').length;
  const ready = issues.length === 0;
  const modeLabel = project.preferences.defaultMode === 'easy-access'
    ? 'Easy Access'
    : project.preferences.defaultMode === 'compact'
      ? 'Compact'
      : 'Balanced';
  return (
    <section className="planner-step-content" aria-labelledby="review-heading">
      <div className="step-copy">
        <span className="step-kicker">Step 4</span>
        <h2 id="review-heading">Review the project</h2>
        <p>Confirm that the project data is complete. The next step runs the packing engine locally and compares three practical layout styles.</p>
      </div>

      <div className={`readiness-card ${ready ? 'is-ready' : 'has-errors'}`} role="status" aria-live="polite">
        <span className="readiness-icon" aria-hidden="true">{ready ? '✓' : '!'}</span>
        <div>
          <strong>{ready ? 'Ready for layout generation' : `${issues.length} issue${issues.length === 1 ? '' : 's'} to fix`}</strong>
          <p>{ready ? 'The dimensions and item definitions are valid and ready for local layout generation.' : 'Return to the highlighted steps and correct the fields before generating layouts.'}</p>
        </div>
      </div>

      <dl className="project-facts">
        <div><dt>Project</dt><dd>{project.name || 'Unnamed project'}</dd></div>
        <div><dt>Usable space</dt><dd>{formatDimensions(project.space.widthMm, project.space.heightMm, project.space.depthMm, project.displayUnit)}</dd></div>
        <div><dt>Spacing</dt><dd>{formatMm(project.space.horizontalGapMm, project.displayUnit)} horizontal · {formatMm(project.space.verticalGapMm, project.displayUnit)} vertical</dd></div>
        <div><dt>Item types</dt><dd>{project.items.length}</dd></div>
        <div><dt>Total objects</dt><dd>{requested}</dd></div>
        <div><dt>Easy-reach types</dt><dd>{important}</dd></div>
        <div><dt>First result</dt><dd>{modeLabel}</dd></div>
      </dl>

      {issues.length > 0 && (
        <div className="validation-summary" role="alert">
          <strong>Fix these details</strong>
          <ul>{issues.slice(0, 8).map((issue, index) => <li key={`${issue.path}-${index}`}>{issue.message}</li>)}</ul>
        </div>
      )}

      <div className="action-row">
        <button className="button button-primary" type="button" onClick={onSave} disabled={!ready}>Save on this device</button>
        <button className="button button-secondary" type="button" onClick={onReset}>Start a new project</button>
      </div>
      <ProjectFileControls project={project} saveStatus={saveStatus} importStatus={importStatus} clearStatus={clearStatus} onSave={onSave} onExport={onExport} onImport={onImport} onClearLocal={onClearLocal} />
    </section>
  );
}
