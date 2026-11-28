import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENT_IDS,
  buildLearnerAchievements,
} from '@/components/profile/achievements';

describe('buildLearnerAchievements', () => {
  it('returns all 12 collectible medals locked when progress is zero', () => {
    const items = buildLearnerAchievements({
      completedLessonsCount: 0,
      completedUnitsCount: 0,
      unit1Completed: false,
      hospitalityCompleted: false,
      cultureThemesCompleted: 0,
      perfectExamCount: 0,
      wordsLearned: 0,
      streakDays: 0,
    });

    expect(items).toHaveLength(12);
    expect(items.map((m) => m.id)).toEqual([...ACHIEVEMENT_IDS]);
    expect(items.every((m) => !m.earned)).toBe(true);
  });

  it('unlocks earned medals and caps progress at target values', () => {
    const items = buildLearnerAchievements({
      completedLessonsCount: 10,
      completedUnitsCount: 1,
      unit1Completed: true,
      hospitalityCompleted: true,
      cultureThemesCompleted: 3,
      perfectExamCount: 1,
      wordsLearned: 128,
      streakDays: 12,
      earnedDateLabel: '28 ноября 2026',
    });

    const earnedIds = items.filter((m) => m.earned).map((m) => m.id);
    expect(earnedIds).toEqual(['first', 'fire', 'bridge', 'tea', 'words', 'eagle']);

    const monthMedal = items.find((m) => m.id === 'month');
    expect(monthMedal?.earned).toBe(false);
    expect(monthMedal?.current).toBe(12);
    expect(monthMedal?.target).toBe(30);
    expect(monthMedal?.unit).toBe('дней подряд');

    const firstMedal = items.find((m) => m.id === 'first');
    expect(firstMedal?.date).toBe('28 ноября 2026');
  });
});
