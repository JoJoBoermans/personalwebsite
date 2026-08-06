import type { ItemInstance, Orientation, ShelfSketchProject } from '../../types/domain';
import type { NormalizedPackingInput, PackingLimits } from './contracts';

export interface NormalizationResult {
  input: NormalizedPackingInput;
  limitedInstanceIds: string[];
}

function orientationsFor(instance: ItemInstance): Orientation[] {
  const normal: Orientation = {
    kind: 'normal',
    frontWidthMm: instance.source.widthMm,
    frontHeightMm: instance.source.heightMm,
    requiredDepthMm: instance.source.depthMm,
  };
  if (!instance.source.allowBaseRotation || instance.source.widthMm === instance.source.depthMm) return [normal];
  return [
    normal,
    {
      kind: 'base-rotated',
      frontWidthMm: instance.source.depthMm,
      frontHeightMm: instance.source.heightMm,
      requiredDepthMm: instance.source.widthMm,
    },
  ];
}

export function normalizeProject(project: ShelfSketchProject, limits: PackingLimits): NormalizationResult {
  const instances: ItemInstance[] = [];
  const limitedInstanceIds: string[] = [];
  const definitions = project.items.slice(0, limits.maxDefinitions);

  for (const definition of definitions) {
    for (let ordinal = 1; ordinal <= definition.quantity; ordinal += 1) {
      const instance: ItemInstance = {
        id: `${definition.id}__${ordinal}`,
        definitionId: definition.id,
        ordinal,
        label: definition.quantity > 1 ? `${definition.label} ${ordinal}` : definition.label,
        source: definition,
      };
      if (instances.length < limits.maxInstances) instances.push(instance);
      else limitedInstanceIds.push(instance.id);
    }
  }

  for (const definition of project.items.slice(limits.maxDefinitions)) {
    for (let ordinal = 1; ordinal <= definition.quantity; ordinal += 1) limitedInstanceIds.push(`${definition.id}__${ordinal}`);
  }

  const orientationsByInstanceId = new Map<string, readonly Orientation[]>();
  for (const instance of instances) orientationsByInstanceId.set(instance.id, orientationsFor(instance));

  return {
    input: {
      projectId: project.id,
      space: project.space,
      instances,
      orientationsByInstanceId,
    },
    limitedInstanceIds,
  };
}
