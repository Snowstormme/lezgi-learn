import { describe, expect, it } from 'vitest';
import { loadAndValidateContentBundle } from '@/content/loader';
import {
  validateContentBundleIntegrity,
  wordSeedSchema,
} from '@/content/schema';

describe('Content JSON bundle & Zod schema integrity', () => {
  it('loads and validates all JSON files in content/ without errors', () => {
    const bundle = loadAndValidateContentBundle();

    expect(bundle.words.length).toBeGreaterThanOrEqual(9);
    expect(bundle.units.length).toBeGreaterThanOrEqual(1);
    expect(bundle.lessons.length).toBeGreaterThanOrEqual(2);

    const publishedWords = bundle.words.filter((w) => w.status === 'published');
    const draftWords = bundle.words.filter((w) => w.status === 'draft');

    expect(publishedWords.length).toBeGreaterThanOrEqual(8);
    expect(draftWords.length).toBeGreaterThanOrEqual(1);
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
