import type { ChangeEvent } from 'react';
import type { LayoutMode, ReducedMotionPreference, ShelfSketchProject } from '../../types/domain';

interface Props {
  project: ShelfSketchProject;
  onChange: (project: ShelfSketchProject) => void;
}

const MODES: Array<{ value: LayoutMode; title: string; description: string }> = [
  { value: 'compact', title: 'Compact', description: 'Prioritise the number of placed items and efficient use of the front area.' },
  { value: 'easy-access', title: 'Easy Access', description: 'Favour clearer access, fewer awkward stacks and more breathing room.' },
  { value: 'balanced', title: 'Balanced', description: 'Combine efficient use of space with practical access.' },
];

export default function PreferencesForm({ project, onChange }: Props) {
  const updateMode = (defaultMode: LayoutMode) => onChange({ ...project, preferences: { ...project.preferences, defaultMode } });
  const updateMotion = (reducedMotionOverride: ReducedMotionPreference) => onChange({ ...project, preferences: { ...project.preferences, reducedMotionOverride } });
  return (
    <section className="planner-step-content" aria-labelledby="preferences-heading">
      <div className="step-copy">
        <span className="step-kicker">Step 3</span>
        <h2 id="preferences-heading">Choose the first layout style</h2>
        <p>ShelfSketch generates all three layout styles. This preference decides which result opens first.</p>
      </div>

      <fieldset className="choice-grid">
        <legend className="sr-only">Default layout mode</legend>
        {MODES.map((mode) => (
          <label className="choice-card" key={mode.value}>
            <input type="radio" name="layout-mode" value={mode.value} checked={project.preferences.defaultMode === mode.value} onChange={() => updateMode(mode.value)} />
            <span><strong>{mode.title}</strong><small>{mode.description}</small></span>
          </label>
        ))}
      </fieldset>

      <div className="form-section">
        <label className="select-field" htmlFor="motion-preference">
          <span>Motion preference</span>
          <select id="motion-preference" value={project.preferences.reducedMotionOverride} onChange={(event: ChangeEvent<HTMLSelectElement>) => updateMotion(event.target.value as ReducedMotionPreference)}>
            <option value="system">Follow device setting</option>
            <option value="reduce">Reduce motion</option>
            <option value="allow">Allow small functional animations</option>
          </select>
        </label>
        <p className="field-hint">This setting affects only optional interface animation. It never changes the measurements or layout logic.</p>
      </div>
    </section>
  );
}
