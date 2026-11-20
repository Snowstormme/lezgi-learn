import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loadAndValidateContentBundle } from '@/content/loader';

export interface DictionaryWordItem {
  slug: string;
  lemma_lez: string;
  translation_ru: string;
  transcription_ru: string | null;
  part_of_speech: string | null;
  grammar_notes_ru: string | null;
  examples: Array<{
    slug: string;
    sentence_lez: string;
    translation_ru: string;
  }>;
}

/**
 * Fetches ONLY published words and published usage examples.
 * Works for guests (anon) and logged-in users alike.
 */
export async function getPublishedDictionaryWords(): Promise<
  DictionaryWordItem[]
> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: words, error: wordsError } = await supabase
        .from('words')
        .select(
          'id, slug, lemma_lez, translation_ru, transcription_ru, part_of_speech, grammar_notes_ru'
        )
        .eq('status', 'published')
        .order('lemma_lez', { ascending: true });

      const { data: examples, error: exError } = await supabase
        .from('word_examples')
        .select('word_id, slug, sentence_lez, translation_ru')
        .eq('status', 'published');

      if (!wordsError && !exError && words && words.length > 0) {
        return words.map((w) => ({
          slug: w.slug,
          lemma_lez: w.lemma_lez,
          translation_ru: w.translation_ru,
          transcription_ru: w.transcription_ru,
          part_of_speech: w.part_of_speech,
          grammar_notes_ru: w.grammar_notes_ru,
          examples: (examples ?? [])
            .filter((ex) => ex.word_id === w.id)
            .map((ex) => ({
              slug: ex.slug,
              sentence_lez: ex.sentence_lez,
              translation_ru: ex.translation_ru,
            })),
        }));
      }
    } catch {
      // Fallback to local content bundle
    }
  }

  const bundle = loadAndValidateContentBundle();
  return bundle.words
    .filter((w) => w.status === 'published')
    .map((w) => ({
      slug: w.slug,
      lemma_lez: w.lemma_lez,
      translation_ru: w.translation_ru,
      transcription_ru: w.transcription_ru ?? null,
      part_of_speech: w.part_of_speech ?? null,
      grammar_notes_ru: w.grammar_notes_ru ?? null,
      examples: w.examples
        .filter((ex) => ex.status === 'published')
        .map((ex) => ({
          slug: ex.slug,
          sentence_lez: ex.sentence_lez,
          translation_ru: ex.translation_ru,
        })),
    }));
}
