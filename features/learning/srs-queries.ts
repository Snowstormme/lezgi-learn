import { isSupabaseConfigured } from '@/lib/env';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import {
  createInitialSrsCardState,
  type StoredSrsCardState,
} from './fsrs';
import type { ContentStatus } from '@/features/shared/types';

export interface SrsReviewCardItem {
  wordId?: string;
  slug: string;
  lemma_lez: string;
  translation_ru: string;
  transcription_ru: string | null;
  part_of_speech: string | null;
  grammar_notes_ru: string | null;
  audio_path: string | null;
  audio_status: ContentStatus;
  example_lez: string | null;
  example_ru: string | null;
  cardState: StoredSrsCardState;
  isDue: boolean;
}

export interface SrsDeckSummary {
  cards: SrsReviewCardItem[];
  totalEnrolled: number;
  dueCount: number;
  isAuthenticated: boolean;
}

export async function getSrsReviewDeck(): Promise<SrsDeckSummary> {
  const [allWords, user] = await Promise.all([
    getPublishedDictionaryWords(),
    isSupabaseConfigured() ? getCurrentAuthUser().catch(() => null) : Promise.resolve(null),
  ]);
  const now = new Date();
  const defaultState = createInitialSrsCardState(now);

  if (isSupabaseConfigured() && user) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: userCards } = await supabase
          .from('user_word_cards')
          .select('*')
          .eq('user_id', user.id)
          .order('due', { ascending: true });

        const cardByWordId = new Map(
          (userCards ?? []).map((c) => [c.word_id, c])
        );

        const dueCards: SrsReviewCardItem[] = [];
        const newCards: SrsReviewCardItem[] = [];

        for (const word of allWords) {
          const existing = word.id ? cardByWordId.get(word.id) : undefined;
          if (existing) {
            const isDue = new Date(existing.due).getTime() <= now.getTime();
            if (isDue) {
              dueCards.push({
                wordId: word.id,
                slug: word.slug,
                lemma_lez: word.lemma_lez,
                translation_ru: word.translation_ru,
                transcription_ru: word.transcription_ru,
                part_of_speech: word.part_of_speech,
                grammar_notes_ru: word.grammar_notes_ru,
                audio_path: word.audio_path,
                audio_status: word.audio_status,
                example_lez: word.examples[0]?.sentence_lez ?? null,
                example_ru: word.examples[0]?.translation_ru ?? null,
                cardState: {
                  state: existing.state,
                  due: existing.due,
                  stability: existing.stability,
                  difficulty: existing.difficulty,
                  elapsed_days: existing.elapsed_days,
                  scheduled_days: existing.scheduled_days,
                  reps: existing.reps,
                  lapses: existing.lapses,
                  last_review: existing.last_review,
                },
                isDue: true,
              });
            }
          } else if (newCards.length < 15) {
            newCards.push({
              wordId: word.id,
              slug: word.slug,
              lemma_lez: word.lemma_lez,
              translation_ru: word.translation_ru,
              transcription_ru: word.transcription_ru,
              part_of_speech: word.part_of_speech,
              grammar_notes_ru: word.grammar_notes_ru,
              audio_path: word.audio_path,
              audio_status: word.audio_status,
              example_lez: word.examples[0]?.sentence_lez ?? null,
              example_ru: word.examples[0]?.translation_ru ?? null,
              cardState: defaultState,
              isDue: true,
            });
          }
        }

        const sessionCards = [...dueCards, ...newCards].slice(0, 15);
        return {
          cards: sessionCards,
          totalEnrolled: userCards?.length ?? 0,
          dueCount: dueCards.length,
          isAuthenticated: true,
        };
    } catch {
      // Fallback to starter deck
    }
  }

  // Starter deck of 15 core words for guests or offline mode
  const starterCards: SrsReviewCardItem[] = allWords.slice(0, 15).map((word) => ({
    wordId: word.id,
    slug: word.slug,
    lemma_lez: word.lemma_lez,
    translation_ru: word.translation_ru,
    transcription_ru: word.transcription_ru,
    part_of_speech: word.part_of_speech,
    grammar_notes_ru: word.grammar_notes_ru,
    audio_path: word.audio_path,
    audio_status: word.audio_status,
    example_lez: word.examples[0]?.sentence_lez ?? null,
    example_ru: word.examples[0]?.translation_ru ?? null,
    cardState: defaultState,
    isDue: true,
  }));

  return {
    cards: starterCards,
    totalEnrolled: 0,
    dueCount: starterCards.length,
    isAuthenticated: false,
  };
}
