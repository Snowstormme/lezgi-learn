import { loadAndValidateContentBundle } from '@/content/loader';
import type { ContentStatus } from '@/features/shared/types';

export interface DictionaryWordItem {
  id?: string;
  slug: string;
  lemma_lez: string;
  translation_ru: string;
  transcription_ru: string | null;
  part_of_speech: string | null;
  grammar_notes_ru: string | null;
  audio_path: string | null;
  audio_status: ContentStatus;
  examples: Array<{
    slug: string;
    sentence_lez: string;
    translation_ru: string;
  }>;
}

let cachedDictionaryWords: DictionaryWordItem[] | null = null;

/**
 * Returns published dictionary words and examples from the validated in-memory bundle.
 * Sorted alphabetically by Lezgi lemma and cached per isolate for 0ms reads.
 */
export async function getPublishedDictionaryWords(): Promise<
  DictionaryWordItem[]
> {
  if (cachedDictionaryWords) {
    return cachedDictionaryWords;
  }

  const bundle = loadAndValidateContentBundle();
  cachedDictionaryWords = bundle.words
    .filter((w) => w.status === 'published')
    .sort((a, b) => a.lemma_lez.localeCompare(b.lemma_lez, 'ru'))
    .map((w) => ({
      slug: w.slug,
      lemma_lez: w.lemma_lez,
      translation_ru: w.translation_ru,
      transcription_ru: w.transcription_ru ?? null,
      part_of_speech: w.part_of_speech ?? null,
      grammar_notes_ru: w.grammar_notes_ru ?? null,
      audio_path: w.audio_path ?? null,
      audio_status: w.audio_status ?? 'draft',
      examples: w.examples
        .filter((ex) => ex.status === 'published')
        .map((ex) => ({
          slug: ex.slug,
          sentence_lez: ex.sentence_lez,
          translation_ru: ex.translation_ru,
        })),
    }));

  return cachedDictionaryWords;
}
