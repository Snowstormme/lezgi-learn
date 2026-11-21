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

export type LandmarkKind =
  | 'campfire'
  | 'watchtower'
  | 'bridge'
  | 'samovar'
  | 'shalbuzdag';

export interface MountainDecor {
  key: string;
  kind: LandmarkKind;
  x: number;
  y: number;
  reached: boolean;
}

interface RawPathItem {
  kind: PathItemKind;
  key: string;
  lessonIdx: number | null;
  reached: boolean;
}

/**
 * Builds ordered nodes (lessons, intermediate bonus chests every 5 regular lessons,
 * and a trailing finish flag if the unit does not already end with a Unit Exam lesson)
 * positioned along the winding mountain road coordinate grid.
 */
export function buildCoursePathItems<
  T extends { slug: string; is_completed: boolean },
>(lessons: T[]): PathItem[] {
  if (lessons.length === 0) return [];

  const endsWithUnitExam = lessons[lessons.length - 1]?.slug.includes('exam');
  const regularLessonsEnd = endsWithUnitExam
    ? lessons.length - 1
    : lessons.length;

  const raw: RawPathItem[] = [];

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    raw.push({
      kind: 'lesson',
      key: lesson.slug,
      lessonIdx: i,
      reached: lesson.is_completed,
    });

    if ((i + 1) % CHEST_EVERY === 0 && i < regularLessonsEnd - 1) {
      raw.push({
        kind: 'chest',
        key: `chest-after-${i + 1}`,
        lessonIdx: null,
        reached: lesson.is_completed,
      });
    }
  }

  if (!endsWithUnitExam) {
    raw.push({
      kind: 'finish',
      key: 'unit-finish',
      lessonIdx: null,
      reached: lessons.every((l) => l.is_completed),
    });
  }

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
 * Places 5 animated 3D Dagestan cultural landmarks (campfire beacon, watchtower,
 * Samur bridge, hospitality samovar, and Mount Shalbuzdag with sun & soaring eagle)
 * in the vertical gaps (`cy + ROW_HEIGHT / 2`) on the open side opposite the road bend,
 * guaranteeing zero overlap with any lesson node or text label.
 */
export function getMountainDecor(items: PathItem[]): MountainDecor[] {
  const specs: Array<{
    afterIndex: number;
    kind: LandmarkKind;
  }> = [
    { afterIndex: 0, kind: 'campfire' },
    { afterIndex: 2, kind: 'watchtower' },
    { afterIndex: 4, kind: 'bridge' },
    { afterIndex: 6, kind: 'samovar' },
    { afterIndex: 9, kind: 'shalbuzdag' },
  ];

  const decors: MountainDecor[] = [];

  for (const spec of specs) {
    const a = items[spec.afterIndex];
    const b = items[spec.afterIndex + 1];
    if (!a || !b) continue;

    const avgCx = (a.cx + b.cx) / 2;
    // Place on the wide-open opposite margin from the road curve
    const x = avgCx < MAP_CENTER ? MAP_WIDTH - 46 : 46;
    const y = Math.round((a.cy + b.cy) / 2);

    decors.push({
      key: `landmark-${spec.kind}-${spec.afterIndex}`,
      kind: spec.kind,
      x,
      y,
      reached: a.reached,
    });
  }

  return decors;
}
