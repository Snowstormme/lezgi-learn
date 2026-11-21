export const MAP_WIDTH = 336;
export const MAP_CENTER = 168;
export const ROW_HEIGHT = 136;
export const MAP_TOP = 78;
export const MAP_BOTTOM_PAD = 70;
export const CHEST_EVERY = 5;
export const LABEL_WIDTH = 132;
export const LABEL_GAP = 49;

export const OFFSETS = [-24, -64, -72, -32, 32, 64, 72, 32] as const;

export type PathItemKind = 'lesson' | 'chest' | 'finish';

export interface PathItem {
  kind: PathItemKind;
  key: string;
  index: number;
  lessonIdx: number | null;
  cx: number;
  cy: number;
  offset: number;
  labelSide: 'left' | 'right';
  reached: boolean;
}

export interface RoadSegment {
  key: string;
  d: string;
  lit: boolean;
}

export interface MountainDecor {
  key: string;
  x: number;
  y: number;
}

interface RawPathItem {
  kind: PathItemKind;
  key: string;
  lessonIdx: number | null;
  reached: boolean;
}

/**
 * Builds ordered nodes (lessons, intermediate bonus chests every 5 lessons, and unit finish flag)
 * positioned along the winding mountain road coordinate grid.
 */
export function buildCoursePathItems<
  T extends { slug: string; is_completed: boolean },
>(lessons: T[]): PathItem[] {
  if (lessons.length === 0) return [];

  const raw: RawPathItem[] = [];

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    raw.push({
      kind: 'lesson',
      key: lesson.slug,
      lessonIdx: i,
      reached: lesson.is_completed,
    });

    if ((i + 1) % CHEST_EVERY === 0 && i < lessons.length - 1) {
      raw.push({
        kind: 'chest',
        key: `chest-after-${i + 1}`,
        lessonIdx: null,
        reached: lesson.is_completed,
      });
    }
  }

  raw.push({
    kind: 'finish',
    key: 'unit-finish',
    lessonIdx: null,
    reached: lessons.every((l) => l.is_completed),
  });

  return raw.map((item, index) => {
    const offset = OFFSETS[index % OFFSETS.length] ?? 0;
    const cx = MAP_CENTER + offset;
    const cy = MAP_TOP + index * ROW_HEIGHT;
    const labelSide = offset < 0 ? 'right' : 'left';

    return {
      ...item,
      index,
      cx,
      cy,
      offset,
      labelSide,
    };
  });
}

/**
 * Builds smooth cubic Bezier road segments linking consecutive path items.
 */
export function buildRoadSegments(items: PathItem[]): RoadSegment[] {
  const segments: RoadSegment[] = [];

  for (let k = 0; k < items.length - 1; k++) {
    const a = items[k];
    const b = items[k + 1];
    const my = (a.cy + b.cy) / 2;
    segments.push({
      key: `${a.key}->${b.key}`,
      d: `M ${a.cx} ${a.cy} C ${a.cx} ${my}, ${b.cx} ${my}, ${b.cx} ${b.cy}`,
      lit: a.reached,
    });
  }

  return segments;
}

export function getMapHeight(items: PathItem[]): number {
  if (items.length === 0) return 0;
  return MAP_TOP + (items.length - 1) * ROW_HEIGHT + MAP_BOTTOM_PAD;
}

/**
 * Places subtle flat mountain silhouettes in outer side pockets away from node labels.
 */
export function getMountainDecor(items: PathItem[]): MountainDecor[] {
  const decors: MountainDecor[] = [];

  for (const item of items) {
    if (Math.abs(item.offset) >= 64 && item.index % 2 === 1) {
      decors.push({
        key: `mountain-${item.key}`,
        x: item.offset < 0 ? 8 : MAP_WIDTH - 52,
        y: item.cy - 18,
      });
    }
  }

  return decors;
}
