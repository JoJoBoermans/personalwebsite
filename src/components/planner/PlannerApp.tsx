import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EXAMPLE_PROJECT } from '../../data/example-project';
import { downloadProjectFile, importProjectFile, type PersistedEditorState } from '../../lib/io';
import { broadCountBucket, broadRatioBucket, broadSizeBucket, trackEvent } from '../../lib/analytics';
import { packingEngine } from '../../lib/packing';
import { cloneProject, createEmptyProject, touchProject } from '../../lib/project';
import { clearShelfSketchStorage, loadLastStep, loadPlannerSession, loadProjectLocally, markOnboardingComplete, saveLastStep, savePlannerSession } from '../../lib/storage';
import { hasIssuesUnder, validateProject } from '../../lib/validation';
import type { GeneratedLayouts, ShelfSketchProject } from '../../types/domain';
import DimensionPreview from './DimensionPreview';
import ItemsForm from './ItemsForm';
import LayoutResults from './LayoutResults';
import PreferencesForm from './PreferencesForm';
import ProjectReview from './ProjectReview';
import SpaceForm from './SpaceForm';
import './planner.css';

interface Props { example?: boolean; }

type StepKey = 'space' | 'items' | 'preferences' | 'review' | 'layouts';
const STEPS: Array<{ key: StepKey; label: string; shortLabel: string }> = [
  { key: 'space', label: 'Space', shortLabel: 'Space' },
  { key: 'items', label: 'Items', shortLabel: 'Items' },
  { key: 'preferences', label: 'Preferences', shortLabel: 'Style' },
  { key: 'review', label: 'Review', shortLabel: 'Review' },
  { key: 'layouts', label: 'Layouts', shortLabel: 'Results' },
];

function initialProject(example: boolean): ShelfSketchProject {
  if (example) return cloneProject(EXAMPLE_PROJECT);
  return createEmptyProject();
}

export default function PlannerApp({ example = false }: Props) {
  const [project, setProject] = useState<ShelfSketchProject>(() => initialProject(example));
  const [activeStep, setActiveStep] = useState(0);
  const [layouts, setLayouts] = useState<GeneratedLayouts | null>(null);
  const [editorState, setEditorState] = useState<PersistedEditorState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'failed'>('idle');
  const [restoreNotice, setRestoreNotice] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [clearStatus, setClearStatus] = useState('');
  const analyticsViewed = useRef(false);
  const analyticsStarted = useRef(false);
  const previousItemCount = useRef(project.items.length);
  const issues = useMemo(() => validateProject(project), [project]);
  const nextStep = STEPS[activeStep + 1];

  useEffect(() => {
    if (!example) {
      const session = loadPlannerSession();
      if (session) {
        setProject(session.project);
        setLayouts(session.layouts);
        setEditorState(session.editorState);
        setActiveStep(session.layouts ? 4 : Math.min(loadLastStep() ?? 0, 3));
        setRestoreNotice(true);
      } else {
        const saved = loadProjectLocally();
        if (saved) {
          setProject(saved);
          setRestoreNotice(true);
        }
        const lastStep = loadLastStep();
        if (lastStep !== null) setActiveStep(Math.min(lastStep, 3));
      }
    }
    setHydrated(true);
  }, [example]);

  useEffect(() => {
    if (!hydrated) return;
    saveLastStep(activeStep);
    if (!analyticsViewed.current) {
      analyticsViewed.current = true;
      trackEvent('tool_viewed', {
        route: example ? 'example' : 'tool',
        viewport_category: window.innerWidth < 640 ? 'small' : window.innerWidth < 1024 ? 'medium' : 'large',
      });
      if (example) trackEvent('example_opened', { preset_id: 'pantry-example-v1' });
    }
  }, [activeStep, hydrated, example]);

  const updateProject = (nextProject: ShelfSketchProject) => {
    if (!analyticsStarted.current) {
      analyticsStarted.current = true;
      trackEvent('tool_started', { entry_source_category: example ? 'example' : 'blank' });
    }
    if (nextProject.items.length > previousItemCount.current) {
      trackEvent('item_added', { definition_count_bucket: broadCountBucket(nextProject.items.length) });
    }
    previousItemCount.current = nextProject.items.length;
    setProject(touchProject(nextProject));
    setLayouts(null);
    setEditorState(null);
    setSaveStatus('idle');
    setGenerationStatus('');
    setImportStatus('');
    setClearStatus('');
  };

  const goToStep = (index: number) => {
    const target = Math.max(0, Math.min(STEPS.length - 1, index));
    if (activeStep === 0 && target > 0 && !hasIssuesUnder(issues, 'space') && !hasIssuesUnder(issues, 'name')) {
      trackEvent('space_dimensions_completed', {
        unit_system: project.displayUnit,
        size_bucket: broadSizeBucket(project.space.widthMm, project.space.heightMm),
      });
    }
    if (target === 4 && !layouts) return;
    setActiveStep(target);
    markOnboardingComplete();
    window.requestAnimationFrame(() => document.getElementById('planner-step-panel')?.focus());
  };

  const generateLayouts = () => {
    if (issues.length > 0) {
      trackEvent('measurement_error_shown', { validation_code: issues[0]?.path.split('.')[0] ?? 'unknown' });
      return;
    }
    setGenerationStatus('Generating three local layout candidates…');
    window.requestAnimationFrame(() => {
      const startedAt = performance.now();
      const nextLayouts = packingEngine.generate(project);
      setLayouts(nextLayouts);
      setEditorState(null);
      setActiveStep(4);
      setSaveStatus('idle');
      const durationMs = Math.max(nextLayouts.durationMs, performance.now() - startedAt);
      const placedRatio = nextLayouts.balanced.metrics.requestedCount > 0 ? nextLayouts.balanced.metrics.placedCount / nextLayouts.balanced.metrics.requestedCount : 0;
      trackEvent('layout_generated', {
        mode_count: 3,
        placed_ratio_bucket: broadRatioBucket(placedRatio),
        duration_bucket: durationMs < 100 ? 'under-100ms' : durationMs < 500 ? '100-499ms' : '500ms+',
      });
      if (nextLayouts.balanced.metrics.placedCount === 0) {
        trackEvent('no_fit_result', { reason_category: nextLayouts.balanced.unplaced[0]?.reason ?? 'unknown' });
      }
      setGenerationStatus(`Generated three layouts. ${nextLayouts.balanced.metrics.placedCount} of ${nextLayouts.balanced.metrics.requestedCount} items fit in the balanced result.`);
      window.requestAnimationFrame(() => document.getElementById('planner-step-panel')?.focus());
    });
  };

  const handleEditorStateChange = useCallback((nextState: PersistedEditorState) => {
    setEditorState(nextState);
    setSaveStatus('idle');
  }, []);

  const saveProject = () => {
    const saved = savePlannerSession(project, layouts, editorState);
    setSaveStatus(saved ? 'saved' : 'failed');
    if (saved) trackEvent('project_saved', { local_only: true });
  };

  const importProject = async (file: File) => {
    const result = await importProjectFile(file);
    setImportStatus(result.message);
    setClearStatus('');
    trackEvent('project_imported', { schema_version: result.ok ? result.project.schemaVersion : 0, success: result.ok });
    if (!result.ok) return;
    setProject(touchProject(result.project));
    setLayouts(null);
    setEditorState(null);
    setActiveStep(3);
    setSaveStatus('idle');
    setRestoreNotice(false);
    setGenerationStatus('');
  };

  const clearLocalData = () => {
    clearShelfSketchStorage();
    setSaveStatus('idle');
    setRestoreNotice(false);
    setClearStatus('Local ShelfSketch project, layout, unit, and step data were deleted from this browser. The open project remains available until this tab is closed or reset.');
  };

  const resetProject = () => {
    if (project.items.length > 0 || project.name.trim()) trackEvent('second_project_started', { session_category: 'same-tab' });
    setProject(example ? cloneProject(EXAMPLE_PROJECT) : createEmptyProject());
    setLayouts(null);
    setEditorState(null);
    setActiveStep(0);
    setSaveStatus('idle');
    setRestoreNotice(false);
    setGenerationStatus('');
    setImportStatus('');
    setClearStatus('');
  };

  const stepHasIssues = (key: StepKey): boolean => {
    if (key === 'space') return hasIssuesUnder(issues, 'space') || hasIssuesUnder(issues, 'name');
    if (key === 'items') return hasIssuesUnder(issues, 'items');
    return false;
  };

  return (
    <section className="planner-app" data-motion={project.preferences.reducedMotionOverride} aria-label="ShelfSketch project setup">
      <p className="sr-only" role="status" aria-live="polite">{generationStatus}</p>
      {restoreNotice && (
        <div className="restore-banner" role="status">
          <span><strong>Local project restored.</strong> Saved measurements{layouts ? ', layouts, and manual edits' : ''} were found on this device.</span>
          <button type="button" className="text-button" onClick={() => setRestoreNotice(false)}>Dismiss</button>
        </div>
      )}

      <nav className="planner-stepper" aria-label="Project setup steps">
        <ol>
          {STEPS.map((step, index) => {
            const current = activeStep === index;
            const completed = index < activeStep && !stepHasIssues(step.key);
            const disabled = step.key === 'layouts' && !layouts;
            return (
              <li key={step.key}>
                <button
                  type="button"
                  aria-current={current ? 'step' : undefined}
                  aria-disabled={disabled}
                  disabled={disabled}
                  className={`${current ? 'is-current' : ''} ${completed ? 'is-complete' : ''} ${stepHasIssues(step.key) ? 'has-step-error' : ''}`}
                  onClick={() => goToStep(index)}
                >
                  <span className="step-number" aria-hidden="true">{completed ? '✓' : index + 1}</span>
                  <span className="step-label"><span className="desktop-step-label">{step.label}</span><span className="mobile-step-label">{step.shortLabel}</span></span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="planner-workspace">
        <div className="planner-input-panel" id="planner-step-panel" tabIndex={-1}>
          {activeStep === 0 && <SpaceForm project={project} issues={issues} onChange={updateProject} />}
          {activeStep === 1 && <ItemsForm project={project} issues={issues} onChange={updateProject} />}
          {activeStep === 2 && <PreferencesForm project={project} onChange={updateProject} />}
          {activeStep === 3 && <ProjectReview project={project} issues={issues} saveStatus={saveStatus} importStatus={importStatus} clearStatus={clearStatus} onSave={saveProject} onReset={resetProject} onExport={() => downloadProjectFile(project)} onImport={importProject} onClearLocal={clearLocalData} />}
          {activeStep === 4 && layouts && <LayoutResults project={project} layouts={layouts} initialEditorState={editorState} onEditorStateChange={handleEditorStateChange} onSaveSession={saveProject} saveStatus={saveStatus} onRegenerate={generateLayouts} onEditProject={() => goToStep(0)} />}

          {activeStep < 4 && (
            <div className="planner-navigation">
              <button className="button button-secondary" type="button" disabled={activeStep === 0} onClick={() => goToStep(activeStep - 1)}>Back</button>
              {activeStep < 3 ? (
                <button className="button button-primary" type="button" onClick={() => goToStep(activeStep + 1)}>Continue to {nextStep?.label.toLowerCase() ?? 'next step'}</button>
              ) : (
                <button className="button button-primary" type="button" disabled={issues.length > 0} onClick={generateLayouts}>Generate three layouts</button>
              )}
            </div>
          )}
        </div>

        <aside className="planner-preview-panel" aria-label="Project preview">
          <header>
            <div>
              <span className="status-pill">{layouts ? 'Layouts generated' : 'Live project preview'}</span>
              <h2>{project.name || 'Unnamed project'}</h2>
            </div>
            <span className={`project-health ${issues.length ? 'has-errors' : 'is-valid'}`}>{issues.length ? `${issues.length} issue${issues.length === 1 ? '' : 's'}` : layouts ? 'Results ready' : 'Input valid'}</span>
          </header>
          <DimensionPreview project={project} />
          {layouts && (
            <div className="preview-result-summary" aria-label="Generated layout summary">
              <strong>Three modes ready</strong>
              <p>Compact: {layouts.compact.metrics.placedCount}/{layouts.compact.metrics.requestedCount} · Easy Access: {layouts.easyAccess.metrics.placedCount}/{layouts.easyAccess.metrics.requestedCount} · Balanced: {layouts.balanced.metrics.placedCount}/{layouts.balanced.metrics.requestedCount}</p>
            </div>
          )}
          <div className="privacy-note">
            <strong>Private by default</strong>
            <p>Your measurements, files, exports, and packing calculations stay in this browser. No project data is sent to a server.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
