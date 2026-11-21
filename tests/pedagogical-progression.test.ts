import { describe, expect, it } from 'vitest';
import { loadAndValidateContentBundle } from '@/content/loader';

describe('Duolingo-style pedagogical progression across all lessons', () => {
  const bundle = loadAndValidateContentBundle();
  const orderedLessons = [...bundle.lessons].sort(
    (a, b) => a.order_index - b.order_index
  );

  it('starts every regular lesson wave with explicit teach_words cards and keeps the final unit exam free of intro cheat cards', () => {
    for (const lesson of orderedLessons) {
      const waveIntros = lesson.exercises.filter(
        (ex) => (ex.payload.teach_words?.length ?? 0) > 0
      );

      if (lesson.slug.includes('exam')) {
        expect(
          waveIntros.length,
          `Unit exam ${lesson.slug} should test without intro teach_words cards`
        ).toBe(0);
      } else {
        expect(
          waveIntros.length,
          `Lesson ${lesson.slug} should have at least 2 teaching waves`
        ).toBeGreaterThanOrEqual(2);
        expect(
          lesson.exercises[0]?.payload.teach_words?.length ?? 0,
          `First exercise of ${lesson.slug} must introduce new words first`
        ).toBeGreaterThan(0);
      }
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
