import { describe, expect, it } from 'vitest';
import {
  buildCoursePathItems,
  buildRoadSegments,
  getMountainDecor,
  LABEL_GAP,
  LABEL_WIDTH,
  MAP_WIDTH,
  ROW_HEIGHT,
} from '@/features/learning/course-path';

function makeLessons(count: number, completedCount: number) {
  return Array.from({ length: count }, (_, i) => ({
    slug: `u1-l${i + 1}`,
    is_completed: i < completedCount,
  }));
}

describe('course path layout geometry and milestones', () => {
  it('produces 12 items for 10 lessons: chest at index 5 and finish last (no chest after lesson 10)', () => {
    const items = buildCoursePathItems(makeLessons(10, 0));

    expect(items).toHaveLength(12);
    expect(items[5].kind).toBe('chest');
    expect(items[11].kind).toBe('finish');
    expect(items.filter((item) => item.kind === 'chest')).toHaveLength(1);
  });

  it('uses the final unit exam lesson as the capstone node when the unit ends with an exam slug', () => {
    const lessonsWithExam = [
      ...makeLessons(10, 5),
      { slug: 'u1-l11-unit-exam', is_completed: false },
    ];
    const items = buildCoursePathItems(lessonsWithExam);

    expect(items).toHaveLength(12);
    expect(items[5].kind).toBe('chest');
    expect(items[11].kind).toBe('lesson');
    expect(items[11].key).toBe('u1-l11-unit-exam');
    expect(items.filter((item) => item.kind === 'finish')).toHaveLength(0);
  });

  it('produces no chest for 3 lessons, only 3 lessons plus finish', () => {
    const items = buildCoursePathItems(makeLessons(3, 1));

    expect(items).toHaveLength(4);
    expect(items.filter((item) => item.kind === 'chest')).toHaveLength(0);
    expect(items[3].kind).toBe('finish');
  });

  it('marks chest reached only when lesson 5 is completed and finish reached when all are completed', () => {
    const fourDone = buildCoursePathItems(makeLessons(10, 4));
    expect(fourDone[5].reached).toBe(false);
    expect(fourDone[11].reached).toBe(false);

    const fiveDone = buildCoursePathItems(makeLessons(10, 5));
    expect(fiveDone[5].reached).toBe(true);
    expect(fiveDone[11].reached).toBe(false);

    const allDone = buildCoursePathItems(makeLessons(10, 10));
    expect(allDone[5].reached).toBe(true);
    expect(allDone[11].reached).toBe(true);
  });

  it('lights road segments strictly from reached items (2 completed -> segments 0..1 lit, segment 2 dark)', () => {
    const items = buildCoursePathItems(makeLessons(10, 2));
    const segments = buildRoadSegments(items);

    expect(segments).toHaveLength(11);
    expect(segments[0].lit).toBe(true);
    expect(segments[1].lit).toBe(true);
    expect(segments[2].lit).toBe(false);

    for (let k = 0; k < segments.length; k++) {
      expect(segments[k].lit).toBe(items[k].reached);
    }
  });

  it('keeps every node, label, and vertical row step cleanly within MAP_WIDTH bounds', () => {
    const items = buildCoursePathItems(makeLessons(10, 2));

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      expect(item.cx - 37).toBeGreaterThanOrEqual(0);
      expect(item.cx + 37).toBeLessThanOrEqual(MAP_WIDTH);

      if (i > 0) {
        expect(item.cy - items[i - 1].cy).toBe(ROW_HEIGHT);
      }

      if (item.labelSide === 'right') {
        expect(item.cx + LABEL_GAP + LABEL_WIDTH).toBeLessThanOrEqual(
          MAP_WIDTH
        );
      } else {
        expect(item.cx - LABEL_GAP - LABEL_WIDTH).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('places all 5 animated cultural landmarks in vertical row gaps within MAP_WIDTH bounds', () => {
    const items = buildCoursePathItems([
      ...makeLessons(10, 2),
      { slug: 'u1-l11-unit-exam', is_completed: false },
    ]);
    const landmarks = getMountainDecor(items);

    expect(landmarks.map((l) => l.kind)).toEqual([
      'campfire',
      'watchtower',
      'bridge',
      'samovar',
      'shalbuzdag',
    ]);

    for (const lm of landmarks) {
      expect(lm.x - 30).toBeGreaterThanOrEqual(0);
      expect(lm.x + 30).toBeLessThanOrEqual(MAP_WIDTH);
      // Every landmark sits halfway between two consecutive path rows (min 60px vertical clearance from any node center)
      for (const item of items) {
        expect(Math.abs(lm.y - item.cy)).toBeGreaterThanOrEqual(60);
      }
    }
  });
});
