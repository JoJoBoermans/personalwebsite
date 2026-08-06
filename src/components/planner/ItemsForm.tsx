import type { ItemDefinition, ShelfSketchProject } from '../../types/domain';
import { createItemDefinition } from '../../lib/project';
import { displayToMm, mmToDisplay, unitLabel } from '../../lib/units';
import { LIMITS, issuesForPath, type ValidationIssue } from '../../lib/validation';
import { NumberField, TextField, ToggleField } from './FormFields';

interface Props {
  project: ShelfSketchProject;
  issues: ValidationIssue[];
  onChange: (project: ShelfSketchProject) => void;
}

export default function ItemsForm({ project, issues, onChange }: Props) {
  const unit = project.displayUnit;
  const updateItem = (index: number, patch: Partial<ItemDefinition>) => {
    const items = project.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    onChange({ ...project, items });
  };
  const removeItem = (index: number) => {
    onChange({ ...project, items: project.items.filter((_, itemIndex) => itemIndex !== index) });
  };
  const addItem = () => {
    if (project.items.length >= LIMITS.itemDefinitions) return;
    onChange({ ...project, items: [...project.items, createItemDefinition(project.items.length + 1)] });
  };

  return (
    <section className="planner-step-content" aria-labelledby="items-heading">
      <div className="step-copy step-copy-with-action">
        <div>
          <span className="step-kicker">Step 2</span>
          <h2 id="items-heading">Add the boxes or objects</h2>
          <p>Enter the outside dimensions, including lids, handles, feet and any part that sticks out.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={addItem} disabled={project.items.length >= LIMITS.itemDefinitions}>Add item type</button>
      </div>

      {project.items.length === 0 && (
        <div className="empty-state" role="status">
          <strong>No items yet</strong>
          <p>Add at least one box or object to prepare a layout.</p>
          <button className="button button-primary" type="button" onClick={addItem}>Add first item</button>
        </div>
      )}

      <div className="item-editor-list">
        {project.items.map((item, index) => {
          const prefix = `items.${index}`;
          return (
            <article className="item-editor" key={item.id} aria-labelledby={`item-heading-${item.id}`}>
              <header className="item-editor-header">
                <div>
                  <span className="item-index">Item type {index + 1}</span>
                  <h3 id={`item-heading-${item.id}`}>{item.label || 'Unnamed item'}</h3>
                </div>
                <button className="text-button danger-text" type="button" onClick={() => removeItem(index)} aria-label={`Remove ${item.label || `item type ${index + 1}`}`}>Remove</button>
              </header>

              <div className="form-grid form-grid-two">
                <TextField
                  id={`item-label-${item.id}`}
                  label="Item name"
                  value={item.label}
                  maxLength={LIMITS.itemLabel}
                  errors={issuesForPath(issues, `${prefix}.label`)}
                  onChange={(label) => updateItem(index, { label })}
                />
                <NumberField
                  id={`item-quantity-${item.id}`}
                  label="Quantity"
                  value={item.quantity}
                  min={1}
                  max={LIMITS.quantity}
                  step={1}
                  errors={issuesForPath(issues, `${prefix}.quantity`)}
                  onChange={(quantity) => updateItem(index, { quantity: Math.round(quantity) })}
                />
              </div>

              <div className="form-grid form-grid-three">
                {([
                  ['widthMm', 'Width'],
                  ['heightMm', 'Height'],
                  ['depthMm', 'Depth'],
                ] as const).map(([key, label]) => (
                  <NumberField
                    key={key}
                    id={`item-${key}-${item.id}`}
                    label={label}
                    value={mmToDisplay(item[key], unit)}
                    unit={unitLabel(unit)}
                    min={unit === 'cm' ? 0.1 : 0.04}
                    max={unit === 'cm' ? 1000 : 393.7}
                    errors={issuesForPath(issues, `${prefix}.${key}`)}
                    onChange={(value) => updateItem(index, { [key]: displayToMm(value, unit) })}
                  />
                ))}
              </div>

              <div className="toggle-grid">
                <ToggleField
                  id={`rotate-${item.id}`}
                  label="Allow base rotation"
                  description="ShelfSketch may swap width and depth, while keeping the item upright."
                  checked={item.allowBaseRotation}
                  onChange={(allowBaseRotation) => updateItem(index, { allowBaseRotation })}
                />
                <ToggleField
                  id={`stack-${item.id}`}
                  label="Can be stacked"
                  description="The packing engine may place another stackable item above it."
                  checked={item.stackable}
                  onChange={(stackable) => updateItem(index, { stackable })}
                />
                <ToggleField
                  id={`access-${item.id}`}
                  label="Keep easy to reach"
                  description="Easy Access and Balanced layouts will give this item extra priority."
                  checked={item.accessPriority === 'important'}
                  onChange={(checked) => updateItem(index, { accessPriority: checked ? 'important' : 'normal' })}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
