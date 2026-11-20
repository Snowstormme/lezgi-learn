import { describe, expect, it } from 'vitest';
import { loadAndValidateContentBundle } from '@/content/loader';

describe('Duolingo-style pedagogical progression across all lessons', () => {
  const bundle = loadAndValidateContentBundle();
  const orderedLessons = [...bundle.lessons].sort(
    (a, b) => a.order_index - b.order_index
  );

  it('starts every lesson wave with explicit teach_words cards before testing', () => {
    for (const lesson of orderedLessons) {
      const waveIntros = lesson.exercises.filter(
        (ex) => (ex.payload.teach_words?.length ?? 0) > 0
      );
      expect(
        waveIntros.length,
        `Lesson ${lesson.slug} should have at least 2 teaching waves`
      ).toBeGreaterThanOrEqual(2);
      expect(
        lesson.exercises[0]?.payload.teach_words?.length ?? 0,
        `First exercise of ${lesson.slug} must introduce new words first`
      ).toBeGreaterThan(0);
    }
  });

  it('never tests an untaught Lezgi item in matching exercises', () => {
    const cumulativeTaughtLez = new Set<string>();

    for (const lesson of orderedLessons) {
      for (const ex of lesson.exercises) {
        for (const tw of ex.payload.teach_words ?? []) {
          const normalized = tw.lez
            .toLowerCase()
            .replace(/[!?.,]/g, '')
            .trim();
          cumulativeTaughtLez.add(normalized);
        }

        if (ex.type === 'matching') {
          for (const pair of ex.payload.pairs) {
            const normalizedLeft = pair.left
              .toLowerCase()
              .replace(/[!?.,]/g, '')
              .trim();
            expect(
              cumulativeTaughtLez.has(normalizedLeft),
              `Untaught word "${pair.left}" tested in matching exercise "${ex.slug}" (${lesson.slug})`
            ).toBe(true);
          }
        }
      }
    }
  });

  it('includes Duolingo-style word_bank tile assembly in every lesson', () => {
    for (const lesson of orderedLessons) {
      const hasWordBank = lesson.exercises.some(
        (ex) =>
          ex.type === 'word_input' && (ex.payload.word_bank?.length ?? 0) >= 2
      );
      expect(
        hasWordBank,
        `Lesson ${lesson.slug} should include at least one word_bank tile exercise`
      ).toBe(true);
    }
  });
});
