import type { ItemDefinition, ShelfSketchProject } from '../types/domain';

export interface ValidationIssue {
  path: string;
  message: string;
}

export const LIMITS = {
  projectName: 80,
  itemLabel: 60,
  itemDefinitions: 20,
  quantity: 50,
  minimumDimensionMm: 1,
  maximumDimensionMm: 10_000,
  maximumGapMm: 500,
} as const;

function dimensionIssue(path: string, label: string, value: number): ValidationIssue | null {
  if (!Number.isFinite(value) || value < LIMITS.minimumDimensionMm) {
    return { path, message: `${label} must be greater than zero.` };
  }
  if (value > LIMITS.maximumDimensionMm) {
    return { path, message: `${label} must be 10 metres or less.` };
  }
  return null;
}

export function validateItem(item: ItemDefinition, index: number): ValidationIssue[] {
  const base = `items.${index}`;
  const issues: ValidationIssue[] = [];
  if (!item.label.trim()) issues.push({ path: `${base}.label`, message: 'Give this item a short name.' });
  if (item.label.length > LIMITS.itemLabel) issues.push({ path: `${base}.label`, message: `Use ${LIMITS.itemLabel} characters or fewer.` });
  const dimensions: Array<[keyof Pick<ItemDefinition, 'widthMm' | 'heightMm' | 'depthMm'>, string]> = [
    ['widthMm', 'Width'],
    ['heightMm', 'Height'],
    ['depthMm', 'Depth'],
  ];
  for (const [key, label] of dimensions) {
    const issue = dimensionIssue(`${base}.${key}`, label, item[key]);
    if (issue) issues.push(issue);
  }
  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > LIMITS.quantity) {
    issues.push({ path: `${base}.quantity`, message: `Quantity must be between 1 and ${LIMITS.quantity}.` });
  }
  return issues;
}

export function validateProject(project: ShelfSketchProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!project.name.trim()) issues.push({ path: 'name', message: 'Give your project a name.' });
  if (project.name.length > LIMITS.projectName) issues.push({ path: 'name', message: `Use ${LIMITS.projectName} characters or fewer.` });

  const spaceDimensions: Array<['widthMm' | 'heightMm' | 'depthMm', string]> = [
    ['widthMm', 'Inside width'],
    ['heightMm', 'Inside height'],
    ['depthMm', 'Usable depth'],
  ];
  for (const [key, label] of spaceDimensions) {
    const issue = dimensionIssue(`space.${key}`, label, project.space[key]);
    if (issue) issues.push(issue);
  }

  const gaps: Array<['horizontalGapMm' | 'verticalGapMm', string]> = [
    ['horizontalGapMm', 'Horizontal gap'],
    ['verticalGapMm', 'Vertical gap'],
  ];
  for (const [key, label] of gaps) {
    const value = project.space[key];
    if (!Number.isFinite(value) || value < 0 || value > LIMITS.maximumGapMm) {
      issues.push({ path: `space.${key}`, message: `${label} must be between 0 and 50 cm.` });
    }
  }

  if (project.items.length < 1) issues.push({ path: 'items', message: 'Add at least one storage item.' });
  if (project.items.length > LIMITS.itemDefinitions) issues.push({ path: 'items', message: `Use no more than ${LIMITS.itemDefinitions} item types in the MVP.` });
  project.items.forEach((item, index) => issues.push(...validateItem(item, index)));
  return issues;
}

export function issuesForPath(issues: ValidationIssue[], path: string): string[] {
  return issues.filter((issue) => issue.path === path).map((issue) => issue.message);
}

export function hasIssuesUnder(issues: ValidationIssue[], prefix: string): boolean {
  return issues.some((issue) => issue.path === prefix || issue.path.startsWith(`${prefix}.`));
}
