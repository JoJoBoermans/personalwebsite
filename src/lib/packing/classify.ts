import type { ItemInstance, Orientation, UnplacedItem } from '../../types/domain';
import type { NormalizedPackingInput } from './contracts';

export interface ClassifiedInput {
  eligible: ItemInstance[];
  orientationsByInstanceId: ReadonlyMap<string, readonly Orientation[]>;
  rejected: UnplacedItem[];
}

function invalid(instance: ItemInstance): boolean {
  const { widthMm, heightMm, depthMm, quantity } = instance.source;
  return ![widthMm, heightMm, depthMm].every((value) => Number.isFinite(value) && value > 0) || !Number.isInteger(quantity) || quantity < 1;
}

export function classifyInput(input: NormalizedPackingInput): ClassifiedInput {
  const eligible: ItemInstance[] = [];
  const rejected: UnplacedItem[] = [];
  const allowed = new Map<string, readonly Orientation[]>();

  for (const instance of input.instances) {
    if (invalid(instance)) {
      rejected.push({ instanceId: instance.id, definitionId: instance.definitionId, reason: 'invalid-item', messageKey: 'invalid-item' });
      continue;
    }
    const all = input.orientationsByInstanceId.get(instance.id) ?? [];
    const depthFit = all.filter((orientation) => orientation.requiredDepthMm <= input.space.depthMm);
    if (!depthFit.length) {
      const shallowest = Math.min(...all.map((orientation) => orientation.requiredDepthMm));
      rejected.push({ instanceId: instance.id, definitionId: instance.definitionId, reason: 'too-deep', excessMm: shallowest - input.space.depthMm, messageKey: 'too-deep' });
      continue;
    }
    const heightFit = depthFit.filter((orientation) => orientation.frontHeightMm <= input.space.heightMm);
    if (!heightFit.length) {
      const shortest = Math.min(...depthFit.map((orientation) => orientation.frontHeightMm));
      rejected.push({ instanceId: instance.id, definitionId: instance.definitionId, reason: 'too-tall', excessMm: shortest - input.space.heightMm, messageKey: 'too-tall' });
      continue;
    }
    const frontFit = heightFit.filter((orientation) => orientation.frontWidthMm <= input.space.widthMm);
    if (!frontFit.length) {
      const narrowest = Math.min(...heightFit.map((orientation) => orientation.frontWidthMm));
      rejected.push({ instanceId: instance.id, definitionId: instance.definitionId, reason: 'too-wide', excessMm: narrowest - input.space.widthMm, messageKey: 'too-wide' });
      continue;
    }
    allowed.set(instance.id, frontFit);
    eligible.push(instance);
  }

  return { eligible, orientationsByInstanceId: allowed, rejected };
}
