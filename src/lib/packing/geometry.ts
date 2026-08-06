export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function containsRect(outer: Rect, inner: Rect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
}

export function horizontalOverlap(a: Rect, b: Rect): number {
  return Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
}

export function verticalOverlap(a: Rect, b: Rect): number {
  return Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
}

export function splitFreeRectangle(free: Rect, occupied: Rect): Rect[] {
  if (!rectsIntersect(free, occupied)) return [free];
  const results: Rect[] = [];
  const freeRight = free.x + free.width;
  const freeTop = free.y + free.height;
  const occupiedRight = occupied.x + occupied.width;
  const occupiedTop = occupied.y + occupied.height;

  if (occupied.x > free.x) results.push({ x: free.x, y: free.y, width: occupied.x - free.x, height: free.height });
  if (occupiedRight < freeRight) results.push({ x: occupiedRight, y: free.y, width: freeRight - occupiedRight, height: free.height });
  if (occupied.y > free.y) results.push({ x: free.x, y: free.y, width: free.width, height: occupied.y - free.y });
  if (occupiedTop < freeTop) results.push({ x: free.x, y: occupiedTop, width: free.width, height: freeTop - occupiedTop });

  return results.filter((rect) => rect.width > 0 && rect.height > 0);
}

export function pruneFreeRectangles(rectangles: Rect[]): Rect[] {
  const unique = rectangles.filter((rect, index) => !rectangles.some((other, otherIndex) => {
    if (index === otherIndex) return false;
    if (rect.x === other.x && rect.y === other.y && rect.width === other.width && rect.height === other.height) return otherIndex < index;
    return containsRect(other, rect);
  }));
  return unique.sort((a, b) => a.y - b.y || a.x - b.x || a.width * a.height - b.width * b.height);
}

export function clipRect(rect: Rect, width: number, height: number): Rect {
  const right = Math.min(width, rect.x + rect.width);
  const top = Math.min(height, rect.y + rect.height);
  return {
    x: Math.max(0, rect.x),
    y: Math.max(0, rect.y),
    width: Math.max(0, right - Math.max(0, rect.x)),
    height: Math.max(0, top - Math.max(0, rect.y)),
  };
}
