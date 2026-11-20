import { describe, expect, it } from 'vitest';
import {
  applySequentialUnlockAcrossUnits,
  mergeGuestProgress,
  parseGuestProgressCookie,
} from '@/features/learning/progression';

describe('sequential lesson unlocking', () => {
  it('unlocks only Lesson 1 initially when no lessons are completed', () => {
    const [unit] = applySequentialUnlockAcrossUnits([
      {
        slug: 'unit-01',
        lessons: [
          { slug: 'u1-l1', is_completed: false },
          { slug: 'u1-l2', is_completed: false },
          { slug: 'u1-l3', is_completed: false },
        ],
      },
    ]);

    expect(unit.lessons.map((l) => l.is_unlocked)).toEqual([true, false, false]);
  });

  it('unlocks Lesson 2 only after Lesson 1 is completed, keeping Lesson 3 locked', () => {
    const [unit] = applySequentialUnlockAcrossUnits([
      {
        slug: 'unit-01',
        lessons: [
          { slug: 'u1-l1', is_completed: true },
          { slug: 'u1-l2', is_completed: false },
          { slug: 'u1-l3', is_completed: false },
        ],
      },
    ]);

    expect(unit.lessons.map((l) => l.is_unlocked)).toEqual([true, true, false]);
  });

  it('does not unlock skipped lessons if a later lesson is flagged completed out of order', () => {
    const [unit] = applySequentialUnlockAcrossUnits([
      {
        slug: 'unit-01',
        lessons: [
          { slug: 'u1-l1', is_completed: false },
          { slug: 'u1-l2', is_completed: true },
          { slug: 'u1-l3', is_completed: false },
        ],
      },
    ]);

    expect(unit.lessons.map((l) => l.is_unlocked)).toEqual([true, false, true]);
  });

  it('unlocks subsequent units sequentially after the prior unit finishes', () => {
    const units = applySequentialUnlockAcrossUnits([
      {
        slug: 'unit-01',
        lessons: [{ slug: 'u1-l1', is_completed: true }],
      },
      {
        slug: 'unit-02',
        lessons: [
          { slug: 'u2-l1', is_completed: false },
          { slug: 'u2-l2', is_completed: false },
        ],
      },
    ]);

    expect(units[1].lessons.map((l) => l.is_unlocked)).toEqual([true, false]);
  });
});

describe('guest progress cookie helpers', () => {
  it('merges completed lessons and preserves the highest score', () => {
    const first = mergeGuestProgress({}, 'u1-l1-greetings', 80);
    const lowerRetry = mergeGuestProgress(first, 'u1-l1-greetings', 60);
    const higherRetry = mergeGuestProgress(lowerRetry, 'u1-l1-greetings', 95);

    expect(parseGuestProgressCookie(JSON.stringify(higherRetry))).toEqual({
      'u1-l1-greetings': 95,
    });
  });

  it('returns empty progress for malformed cookies', () => {
    expect(parseGuestProgressCookie('not-json')).toEqual({});
    expect(parseGuestProgressCookie('["u1-l1"]')).toEqual({});
  });
});
