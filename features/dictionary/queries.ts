import { isSupabaseConfigured } from '@/lib/env';
import { CONTENT_TTL_MS, memoizeAsync } from '@/lib/server-memo';
import { createSupabasePublicClient } from '@/lib/supabase/public';
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

/**
 * Fetches ONLY published words and published usage examples.
 * Works for guests (anon) and logged-in users alike.
 */
export async function getPublishedDictionaryWords(): Promise<
  DictionaryWordItem[]
> {
  if (isSupabaseConfigured()) {
    try {
      return await memoizeAsync('dictionary-v1', CONTENT_TTL_MS, async () => {
        const supabase = createSupabasePublicClient();
        const [
          { data: words, error: wordsError },
          { data: examples, error: exError },
        ] = await Promise.all([
          supabase
            .from('words')
            .select(
              'id, slug, lemma_lez, translation_ru, transcription_ru, part_of_speech, grammar_notes_ru, audio_path, audio_status'
            )
            .eq('status', 'published')
            .order('lemma_lez', { ascending: true }),
          supabase
            .from('word_examples')
            .select('word_id, slug, sentence_lez, translation_ru')
            .eq('status', 'published'),
        ]);

        if (wordsError || exError || !words || words.length === 0) {
          throw new Error(
            wordsError?.message ??
              exError?.message ??
              'Published dictionary words unavailable'
          );
        }

        const examplesByWordId = new Map<
          string,
          Array<{ slug: string; sentence_lez: string; translation_ru: string }>
        >();
        for (const ex of examples ?? []) {
          const list = examplesByWordId.get(ex.word_id);
          const item = {
            slug: ex.slug,
            sentence_lez: ex.sentence_lez,
            translation_ru: ex.translation_ru,
          };
          if (list) {
            list.push(item);
          } else {
            examplesByWordId.set(ex.word_id, [item]);
          }
        }

        return words.map((w) => ({
          id: w.id,
          slug: w.slug,
          lemma_lez: w.lemma_lez,
          translation_ru: w.translation_ru,
          transcription_ru: w.transcription_ru,
          part_of_speech: w.part_of_speech,
          grammar_notes_ru: w.grammar_notes_ru,
          audio_path: w.audio_path,
          audio_status: w.audio_status,
          examples: examplesByWordId.get(w.id) ?? [],
        }));
      });
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
}
