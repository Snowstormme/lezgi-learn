export const GUEST_COMPLETED_COOKIE = 'lezgi_guest_completed';

export type GuestProgressMap = Record<string, number>;

/**
 * Parses serialized guest lesson completion progress from a cookie value.
 * Supports `{ [slug]: score }` maps and tolerates malformed payloads safely.
 */
export function parseGuestProgressCookie(
  raw: string | undefined
): GuestProgressMap {
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const result: GuestProgressMap = {};
    for (const [slug, score] of Object.entries(parsed)) {
      if (
        typeof slug === 'string' &&
        slug.length >= 2 &&
        slug.length <= 80 &&
        typeof score === 'number' &&
        Number.isFinite(score)
      ) {
        result[slug] = Math.max(0, Math.min(100, Math.round(score)));
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Records a completed lesson for a guest session while keeping the best score.
 */
export function mergeGuestProgress(
  current: GuestProgressMap,
  lessonSlug: string,
  score: number
): GuestProgressMap {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const prevScore = current[lessonSlug];
  return {
    ...current,
    [lessonSlug]:
      typeof prevScore === 'number'
        ? Math.max(prevScore, clampedScore)
        : clampedScore,
  };
}

/**
 * Computes sequential unlock state across ordered units and lessons.
 * Lesson 1 starts unlocked; each subsequent lesson unlocks once the preceding lesson is completed.
 */
export function applySequentialUnlockAcrossUnits<
  TUnit extends { lessons: Array<{ is_completed: boolean }> },
>(
  units: TUnit[]
): Array<
  Omit<TUnit, 'lessons'> & {
    lessons: Array<TUnit['lessons'][number] & { is_unlocked: boolean }>;
  }
> {
  let previousCompleted = true;

  return units.map((unit) => {
    const unlockedLessons = unit.lessons.map((lesson) => {
      const is_unlocked = previousCompleted;
      previousCompleted = lesson.is_completed;
      return {
        ...lesson,
        is_unlocked,
      };
    });

    return {
      ...unit,
      lessons: unlockedLessons,
    };
  });
}
