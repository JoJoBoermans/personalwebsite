import type { DisplayUnit, ShelfSketchProject } from '../../types/domain';
import { mmToDisplay, displayToMm, unitLabel } from '../../lib/units';
import { issuesForPath, type ValidationIssue } from '../../lib/validation';
import { NumberField, TextField } from './FormFields';

interface Props {
  project: ShelfSketchProject;
  issues: ValidationIssue[];
  onChange: (project: ShelfSketchProject) => void;
}

export default function SpaceForm({ project, issues, onChange }: Props) {
  const unit = project.displayUnit;
  const unitText = unitLabel(unit);
  const updateSpace = (key: keyof ShelfSketchProject['space'], value: number) => {
    onChange({ ...project, space: { ...project.space, [key]: displayToMm(value, unit) } });
  };
  const changeUnit = (nextUnit: DisplayUnit) => onChange({ ...project, displayUnit: nextUnit });

  return (
    <section className="planner-step-content" aria-labelledby="space-heading">
      <div className="step-copy">
        <span className="step-kicker">Step 1</span>
        <h2 id="space-heading">Measure the usable space</h2>
        <p>Use the inside dimensions of the shelf or cabinet. ShelfSketch stores measurements internally in millimetres, so switching units does not change the physical size.</p>
      </div>

      <div className="form-section">
        <TextField
          id="project-name"
          label="Project name"
          value={project.name}
          maxLength={80}
          hint="A short name stored only on this device."
          errors={issuesForPath(issues, 'name')}
          onChange={(name) => onChange({ ...project, name })}
        />

        <fieldset className="segmented-field">
          <legend>Measurement unit</legend>
          <div className="segmented-control">
            {(['cm', 'in'] as const).map((value) => (
              <label key={value}>
                <input type="radio" name="display-unit" value={value} checked={unit === value} onChange={() => changeUnit(value)} />
                <span>{value === 'cm' ? 'Centimetres' : 'Inches'}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="form-grid form-grid-three">
        <NumberField
          id="space-width"
          label="Inside width"
          value={mmToDisplay(project.space.widthMm, unit)}
          unit={unitText}
          min={unit === 'cm' ? 0.1 : 0.04}
          max={unit === 'cm' ? 1000 : 393.7}
          errors={issuesForPath(issues, 'space.widthMm')}
          onChange={(value) => updateSpace('widthMm', value)}
        />
        <NumberField
          id="space-height"
          label="Inside height"
          value={mmToDisplay(project.space.heightMm, unit)}
          unit={unitText}
          min={unit === 'cm' ? 0.1 : 0.04}
          max={unit === 'cm' ? 1000 : 393.7}
          errors={issuesForPath(issues, 'space.heightMm')}
          onChange={(value) => updateSpace('heightMm', value)}
        />
        <NumberField
          id="space-depth"
          label="Usable depth"
          value={mmToDisplay(project.space.depthMm, unit)}
          unit={unitText}
          min={unit === 'cm' ? 0.1 : 0.04}
          max={unit === 'cm' ? 1000 : 393.7}
          hint="Measure to the nearest obstruction, door or back panel."
          errors={issuesForPath(issues, 'space.depthMm')}
          onChange={(value) => updateSpace('depthMm', value)}
        />
      </div>

      <details className="advanced-fields">
        <summary>Optional spacing margins</summary>
        <p className="text-muted text-small">Add a small gap if boxes should not touch each other or the shelf edges.</p>
        <div className="form-grid form-grid-two">
          <NumberField
            id="horizontal-gap"
            label="Horizontal gap"
            value={mmToDisplay(project.space.horizontalGapMm, unit)}
            unit={unitText}
            min={0}
            max={unit === 'cm' ? 50 : 19.69}
            errors={issuesForPath(issues, 'space.horizontalGapMm')}
            onChange={(value) => updateSpace('horizontalGapMm', value)}
          />
          <NumberField
            id="vertical-gap"
            label="Vertical gap"
            value={mmToDisplay(project.space.verticalGapMm, unit)}
            unit={unitText}
            min={0}
            max={unit === 'cm' ? 50 : 19.69}
            errors={issuesForPath(issues, 'space.verticalGapMm')}
            onChange={(value) => updateSpace('verticalGapMm', value)}
          />
        </div>
      </details>
    </section>
  );
}
