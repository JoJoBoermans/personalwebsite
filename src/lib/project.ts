import type { ItemDefinition, ShelfSketchProject } from '../types/domain';

export const PROJECT_SCHEMA_VERSION = 1 as const;

function randomId(prefix: string): string {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

export function createItemDefinition(index = 1): ItemDefinition {
  return {
    id: randomId('item'),
    label: `Storage item ${index}`,
    widthMm: 300,
    heightMm: 200,
    depthMm: 300,
    quantity: 1,
    allowBaseRotation: true,
    stackable: true,
    accessPriority: 'normal',
  };
}

export function createEmptyProject(): ShelfSketchProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: randomId('project'),
    name: 'My shelf project',
    displayUnit: 'cm',
    space: {
      widthMm: 800,
      heightMm: 400,
      depthMm: 350,
      horizontalGapMm: 5,
      verticalGapMm: 5,
    },
    items: [createItemDefinition(1)],
    preferences: {
      defaultMode: 'balanced',
      reducedMotionOverride: 'system',
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function touchProject(project: ShelfSketchProject): ShelfSketchProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

export function cloneProject(project: ShelfSketchProject): ShelfSketchProject {
  return JSON.parse(JSON.stringify(project)) as ShelfSketchProject;
}
