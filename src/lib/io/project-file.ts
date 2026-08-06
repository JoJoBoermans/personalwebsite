import { cloneProject } from '../project';
import { validateProject } from '../validation';
import type { DisplayUnit, ItemDefinition, LayoutMode, ReducedMotionPreference, ShelfSketchProject } from '../../types/domain';
import type { ImportResult } from './contracts';
import { downloadText, safeFilename } from './browser-download';

const MAX_PROJECT_FILE_BYTES = 1_000_000;
const PROJECT_KEYS = ['schemaVersion', 'id', 'name', 'displayUnit', 'space', 'items', 'preferences', 'createdAt', 'updatedAt'] as const;
const SPACE_KEYS = ['widthMm', 'heightMm', 'depthMm', 'horizontalGapMm', 'verticalGapMm'] as const;
const ITEM_KEYS = ['id', 'label', 'widthMm', 'heightMm', 'depthMm', 'quantity', 'allowBaseRotation', 'stackable', 'accessPriority'] as const;
const PREFERENCE_KEYS = ['defaultMode', 'reducedMotionOverride'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function integerValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : null;
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function parseItem(value: unknown): ItemDefinition | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ITEM_KEYS)) return null;
  const id = stringValue(value.id);
  const label = stringValue(value.label);
  const widthMm = integerValue(value.widthMm);
  const heightMm = integerValue(value.heightMm);
  const depthMm = integerValue(value.depthMm);
  const quantity = integerValue(value.quantity);
  const allowBaseRotation = booleanValue(value.allowBaseRotation);
  const stackable = booleanValue(value.stackable);
  const accessPriority = value.accessPriority === 'important' || value.accessPriority === 'normal' ? value.accessPriority : null;
  if (id === null || label === null || widthMm === null || heightMm === null || depthMm === null || quantity === null || allowBaseRotation === null || stackable === null || accessPriority === null) return null;
  return { id, label, widthMm, heightMm, depthMm, quantity, allowBaseRotation, stackable, accessPriority };
}


export function parseProjectValue(parsed: unknown): ImportResult {
  if (!isRecord(parsed) || !hasOnlyKeys(parsed, PROJECT_KEYS)) return { ok: false, message: 'This is not a supported ShelfSketch project file.' };
  if (parsed.schemaVersion !== 1) return { ok: false, message: 'This project uses an unsupported schema version.' };
  if (!isRecord(parsed.space) || !hasOnlyKeys(parsed.space, SPACE_KEYS)) return { ok: false, message: 'The project space data is missing or malformed.' };
  if (!isRecord(parsed.preferences) || !hasOnlyKeys(parsed.preferences, PREFERENCE_KEYS)) return { ok: false, message: 'The project preferences are missing or malformed.' };
  if (!Array.isArray(parsed.items)) return { ok: false, message: 'The project items are missing or malformed.' };

  const id = stringValue(parsed.id);
  const name = stringValue(parsed.name);
  const displayUnit: DisplayUnit | null = parsed.displayUnit === 'cm' || parsed.displayUnit === 'in' ? parsed.displayUnit : null;
  const createdAt = stringValue(parsed.createdAt);
  const updatedAt = stringValue(parsed.updatedAt);
  const widthMm = integerValue(parsed.space.widthMm);
  const heightMm = integerValue(parsed.space.heightMm);
  const depthMm = integerValue(parsed.space.depthMm);
  const horizontalGapMm = integerValue(parsed.space.horizontalGapMm);
  const verticalGapMm = integerValue(parsed.space.verticalGapMm);
  const defaultMode: LayoutMode | null = parsed.preferences.defaultMode === 'compact' || parsed.preferences.defaultMode === 'easy-access' || parsed.preferences.defaultMode === 'balanced' ? parsed.preferences.defaultMode : null;
  const reducedMotionOverride: ReducedMotionPreference | null = parsed.preferences.reducedMotionOverride === 'system' || parsed.preferences.reducedMotionOverride === 'reduce' || parsed.preferences.reducedMotionOverride === 'allow' ? parsed.preferences.reducedMotionOverride : null;
  const items = parsed.items.map(parseItem);

  if (id === null || name === null || displayUnit === null || createdAt === null || updatedAt === null || widthMm === null || heightMm === null || depthMm === null || horizontalGapMm === null || verticalGapMm === null || defaultMode === null || reducedMotionOverride === null || items.some((item) => item === null)) {
    return { ok: false, message: 'The project contains fields with unsupported data types.' };
  }
  if (!Number.isFinite(Date.parse(createdAt)) || !Number.isFinite(Date.parse(updatedAt))) return { ok: false, message: 'The project timestamps are invalid.' };

  const project: ShelfSketchProject = {
    schemaVersion: 1,
    id,
    name,
    displayUnit,
    space: { widthMm, heightMm, depthMm, horizontalGapMm, verticalGapMm },
    items: items as ItemDefinition[],
    preferences: { defaultMode, reducedMotionOverride },
    createdAt,
    updatedAt,
  };
  const issues = validateProject(project);
  if (issues.length) return { ok: false, message: `The project could not be imported: ${issues[0]?.message ?? 'invalid data'}` };
  return { ok: true, project: cloneProject(project), message: `Imported “${project.name}” with ${project.items.length} item type${project.items.length === 1 ? '' : 's'}.` };
}

export function parseProjectFileText(text: string): ImportResult {
  if (new TextEncoder().encode(text).byteLength > MAX_PROJECT_FILE_BYTES) return { ok: false, message: 'The project file is larger than the 1 MB safety limit.' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, message: 'This file is not valid JSON.' };
  }
  return parseProjectValue(parsed);
}

export async function importProjectFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_PROJECT_FILE_BYTES) return { ok: false, message: 'The project file is larger than the 1 MB safety limit.' };
  if (!file.name.toLowerCase().endsWith('.json')) return { ok: false, message: 'Choose a ShelfSketch JSON project file.' };
  try {
    return parseProjectFileText(await file.text());
  } catch {
    return { ok: false, message: 'The browser could not read this project file.' };
  }
}

export function projectFileText(project: ShelfSketchProject): string {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function downloadProjectFile(project: ShelfSketchProject): void {
  downloadText(projectFileText(project), `${safeFilename(project.name)}.shelfsketch.json`, 'application/json;charset=utf-8');
}
