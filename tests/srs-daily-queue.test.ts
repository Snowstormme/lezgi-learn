import { describe, expect, it } from 'vitest';
import {
  collectLearnedWordSlugs,
  createInitialSrsCardState,
  formatNextDueLabel,
  parseGuestSrsCookie,
  serializeGuestSrsCookie,
} from '@/features/learning/srs-guest-cookie';
import { scheduleNextSrsCardState } from '@/features/learning/fsrs';

describe('SRS daily review queue (strictly from completed lessons)', () => {
  it('returns an empty list when no lessons have been completed', () => {
    expect(collectLearnedWordSlugs([])).toEqual([]);
  });

  it('returns only the words taught in completed lessons in progression order', () => {
    const lesson1Words = collectLearnedWordSlugs(['u1-l1-hello']);
    expect(lesson1Words).toEqual(['salam', 'vax', 'aleikum-salam', 'dust']);

    const twoLessonsWords = collectLearnedWordSlugs([
      'u1-l2-time-greetings',
      'u1-l1-hello',
    ]);
    expect(twoLessonsWords).toEqual([
      'salam',
      'vax',
      'aleikum-salam',
      'dust',
      'pakaman-xiyirar',
      'xiyirar-xhuy',
      'yif',
      'paka',
    ]);
  });

  it('persists guest SRS states via compact cookie serialization and schedules Remembered vs Did not', () => {
    const now = new Date('2026-11-23T10:00:00.000Z');
    const initial = createInitialSrsCardState(now);

    const remembered = scheduleNextSrsCardState(initial, 3, now);
    const missed = scheduleNextSrsCardState(initial, 1, now);

    expect(remembered.scheduled_days).toBeGreaterThanOrEqual(1);
    expect(new Date(remembered.due).getTime() - now.getTime()).toBeGreaterThanOrEqual(
      24 * 60 * 60 * 1000
    );
    expect(new Date(remembered.due).getTime()).toBeGreaterThan(
      new Date(missed.due).getTime()
    );

    const encoded = serializeGuestSrsCookie({
      salam: remembered,
      dust: missed,
    });
    const decoded = parseGuestSrsCookie(encoded);

    expect(decoded.salam?.due).toBe(remembered.due);
    expect(decoded.salam?.reps).toBe(remembered.reps);
    expect(decoded.dust?.due).toBe(missed.due);
    expect(formatNextDueLabel(remembered.due, now)).toMatch(/^через /);
  });
});
