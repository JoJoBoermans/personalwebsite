import type { ItemInstance } from '../../types/domain';

export type OrderingName = 'area-desc' | 'height-desc' | 'width-desc' | 'access-first' | 'nonstackable-first' | 'area-asc';

function maxFrontArea(item: ItemInstance): number {
  return Math.max(item.source.widthMm * item.source.heightMm, item.source.depthMm * item.source.heightMm);
}

function maxFrontWidth(item: ItemInstance): number {
  return item.source.allowBaseRotation ? Math.max(item.source.widthMm, item.source.depthMm) : item.source.widthMm;
}

export function orderInstances(instances: readonly ItemInstance[], ordering: OrderingName): ItemInstance[] {
  const result = [...instances];
  const stable = (a: ItemInstance, b: ItemInstance): number => a.definitionId.localeCompare(b.definitionId) || a.ordinal - b.ordinal;
  result.sort((a, b) => {
    if (ordering === 'area-desc') return maxFrontArea(b) - maxFrontArea(a) || stable(a, b);
    if (ordering === 'area-asc') return maxFrontArea(a) - maxFrontArea(b) || stable(a, b);
    if (ordering === 'height-desc') return b.source.heightMm - a.source.heightMm || maxFrontArea(b) - maxFrontArea(a) || stable(a, b);
    if (ordering === 'width-desc') return maxFrontWidth(b) - maxFrontWidth(a) || maxFrontArea(b) - maxFrontArea(a) || stable(a, b);
    if (ordering === 'access-first') {
      const access = Number(b.source.accessPriority === 'important') - Number(a.source.accessPriority === 'important');
      return access || Number(a.source.stackable) - Number(b.source.stackable) || maxFrontArea(b) - maxFrontArea(a) || stable(a, b);
    }
    const stackable = Number(a.source.stackable) - Number(b.source.stackable);
    return stackable || maxFrontArea(b) - maxFrontArea(a) || stable(a, b);
  });
  return result;
}
