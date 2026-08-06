import type { ChangeEvent, ReactNode } from 'react';

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  errors?: string[];
  onChange: (value: number) => void;
}

export function NumberField({
  id,
  label,
  value,
  unit,
  min = 0,
  max,
  step = 0.1,
  hint,
  errors = [],
  onChange,
}: NumberFieldProps) {
  const errorId = errors.length ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.valueAsNumber;
    onChange(Number.isFinite(next) ? next : 0);
  };
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="number-input-wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-invalid={errors.length > 0}
          aria-describedby={describedBy}
          onChange={handleChange}
        />
        {unit && <span aria-hidden="true">{unit}</span>}
      </div>
      {hint && <p className="field-hint" id={hintId}>{hint}</p>}
      {errors.length > 0 && <p className="field-error" id={errorId}>{errors[0]}</p>}
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  maxLength?: number;
  hint?: string;
  errors?: string[];
  onChange: (value: string) => void;
}

export function TextField({ id, label, value, maxLength, hint, errors = [], onChange }: TextFieldProps) {
  const errorId = errors.length ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        aria-invalid={errors.length > 0}
        aria-describedby={describedBy}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
      {hint && <p className="field-hint" id={hintId}>{hint}</p>}
      {errors.length > 0 && <p className="field-error" id={errorId}>{errors[0]}</p>}
    </div>
  );
}

interface ToggleFieldProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: ReactNode;
}

export function ToggleField({ id, label, description, checked, onChange, children }: ToggleFieldProps) {
  return (
    <label className="toggle-card" htmlFor={id}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
        {children}
      </span>
      <input id={id} type="checkbox" checked={checked} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)} />
    </label>
  );
}
