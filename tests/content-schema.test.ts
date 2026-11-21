import { describe, expect, it } from 'vitest';
import { loadAndValidateContentBundle } from '@/content/loader';
import {
  validateContentBundleIntegrity,
  wordSeedSchema,
} from '@/content/schema';

describe('Content JSON bundle & Zod schema integrity (Stage 3)', () => {
  it('loads and validates all 155 words, 11 lessons (10 lessons + 1 unit exam), and 66 exercises in Unit 1 without errors', () => {
    const bundle = loadAndValidateContentBundle();

    expect(bundle.words.length).toBe(155);
    expect(bundle.units.length).toBe(1);
    expect(bundle.lessons.length).toBe(11);
    expect(bundle.phrases.length).toBe(40);

    const publishedWords = bundle.words.filter((w) => w.status === 'published');
    const nonPublishedWords = bundle.words.filter(
      (w) => w.status !== 'published'
    );

    expect(publishedWords.length).toBe(150);
    expect(nonPublishedWords.length).toBe(5);

    const allExercises = bundle.lessons.flatMap((l) => l.exercises);
    expect(allExercises.length).toBe(66);

    const mcCount = allExercises.filter(
      (e) => e.type === 'multiple_choice'
    ).length;
    const matchingCount = allExercises.filter(
      (e) => e.type === 'matching'
    ).length;
    const inputCount = allExercises.filter(
      (e) => e.type === 'word_input'
    ).length;

    expect(mcCount).toBe(22);
    expect(matchingCount).toBe(22);
    expect(inputCount).toBe(22);
  });

  it('normalizes palochka automatically when parsing a word via wordSeedSchema', () => {
    const parsed = wordSeedSchema.parse({
      slug: 'kval-test',
      lemma_lez: 'к1вал',
      translation_ru: 'дом',
      status: 'draft',
    });

    expect(parsed.lemma_lez).toBe('кӀвал');
  });

  it('rejects dangling word_slug references in exercises', () => {
    const bundle = loadAndValidateContentBundle();
    const brokenBundle = structuredClone(bundle);
    brokenBundle.lessons[0].exercises[0].word_slug = 'non-existent-word';

    expect(() => validateContentBundleIntegrity(brokenBundle)).toThrow(
      /references unknown word_slug/
    );
  });
});
