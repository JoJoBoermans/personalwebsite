import type { DisplayUnit } from '../types/domain';

const MM_PER_UNIT: Record<DisplayUnit, number> = {
  cm: 10,
  in: 25.4,
};

export function displayToMm(value: number, unit: DisplayUnit): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * MM_PER_UNIT[unit]));
}

export function mmToDisplay(mm: number, unit: DisplayUnit): number {
  if (!Number.isFinite(mm)) return 0;
  const raw = mm / MM_PER_UNIT[unit];
  const decimals = unit === 'cm' ? 1 : 2;
  return Number(raw.toFixed(decimals));
}

export function unitLabel(unit: DisplayUnit): string {
  return unit === 'cm' ? 'cm' : 'in';
}

export function formatMm(mm: number, unit: DisplayUnit): string {
  return `${mmToDisplay(mm, unit)} ${unitLabel(unit)}`;
}

export function formatDimensions(
  widthMm: number,
  heightMm: number,
  depthMm: number,
  unit: DisplayUnit,
): string {
  return `${mmToDisplay(widthMm, unit)} × ${mmToDisplay(heightMm, unit)} × ${mmToDisplay(depthMm, unit)} ${unitLabel(unit)}`;
}
