import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/env';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import {
  createInitialSrsCardState,
  type StoredSrsCardState,
} from './fsrs';
import {
  collectLearnedWordSlugs,
  formatNextDueLabel,
  GUEST_SRS_COOKIE,
  parseGuestSrsCookie,
} from './srs-guest-cookie';
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
  allLearnedCards: SrsReviewCardItem[];
  totalEnrolled: number;
  totalLearnedWords: number;
  completedLessonsCount: number;
  dueCount: number;
  nextDueLabel: string | null;
  nextLessonSlug: string;
  isAuthenticated: boolean;
}

async function readGuestSrsSafe() {
  try {
    const cookieStore = await cookies();
    return parseGuestSrsCookie(cookieStore.get(GUEST_SRS_COOKIE)?.value);
  } catch {
    return {};
  }
}

export async function getSrsReviewDeck(): Promise<SrsDeckSummary> {
  const [units, allWords, user] = await Promise.all([
    getPublishedUnitsWithLessons(),
    getPublishedDictionaryWords(),
    isSupabaseConfigured()
      ? getCurrentAuthUser().catch(() => null)
      : Promise.resolve(null),
  ]);

  const allLessons = units.flatMap((u) => u.lessons);
  const completedLessons = allLessons.filter((l) => l.is_completed);
  const nextAvailableLesson =
    allLessons.find((l) => l.is_unlocked && !l.is_completed) ?? allLessons[0];
  const nextLessonSlug = nextAvailableLesson?.slug ?? 'u1-l1-hello';

  const learnedSlugs = collectLearnedWordSlugs(
    completedLessons.map((l) => l.slug)
  );

  // If the user has not completed any lessons yet, the review queue is intentionally empty.
  if (learnedSlugs.length === 0) {
    return {
      cards: [],
      allLearnedCards: [],
      totalEnrolled: 0,
      totalLearnedWords: 0,
      completedLessonsCount: 0,
      dueCount: 0,
      nextDueLabel: null,
      nextLessonSlug,
      isAuthenticated: Boolean(user),
    };
  }

  const now = new Date();
  const defaultState = createInitialSrsCardState(now);
  const wordBySlug = new Map(allWords.map((w) => [w.slug, w]));

  // Load saved SRS states (Supabase for authenticated users, cookie for guests)
  const stateBySlug = new Map<string, StoredSrsCardState>();
  const wordIdBySlug = new Map<string, string>();

  if (isSupabaseConfigured() && user) {
    try {
      const supabase = await createSupabaseServerClient();
      const [{ data: dbWords }, { data: userCards }] = await Promise.all([
        supabase
          .from('words')
          .select('id, slug')
          .in('slug', learnedSlugs),
        supabase
          .from('user_word_cards')
          .select('*')
          .eq('user_id', user.id),
      ]);

      const slugById = new Map<string, string>();
      for (const row of dbWords ?? []) {
        wordIdBySlug.set(row.slug, row.id);
        slugById.set(row.id, row.slug);
      }

      for (const c of userCards ?? []) {
        const slug = slugById.get(c.word_id);
        if (!slug) continue;
        stateBySlug.set(slug, {
          state: c.state,
          due: c.due,
          stability: c.stability,
          difficulty: c.difficulty,
          elapsed_days: c.elapsed_days,
          scheduled_days: c.scheduled_days,
          reps: c.reps,
          lapses: c.lapses,
          last_review: c.last_review,
        });
      }
    } catch {
      // Fallback to guest cookie state if Supabase query fails
    }
  } else {
    const guestMap = await readGuestSrsSafe();
    for (const [slug, st] of Object.entries(guestMap)) {
      stateBySlug.set(slug, st);
    }
  }

  const allLearnedCards: SrsReviewCardItem[] = [];
  const dueCards: SrsReviewCardItem[] = [];
  let earliestFutureDueMs: number | null = null;

  for (const slug of learnedSlugs) {
    const word = wordBySlug.get(slug);
    if (!word) continue;

    const savedState = stateBySlug.get(slug);
    const cardState = savedState ?? defaultState;
    const dueMs = new Date(cardState.due).getTime();
    const isDue = !savedState || dueMs <= now.getTime();

    if (!isDue) {
      if (earliestFutureDueMs === null || dueMs < earliestFutureDueMs) {
        earliestFutureDueMs = dueMs;
      }
    }

    const item: SrsReviewCardItem = {
      wordId: wordIdBySlug.get(slug) ?? word.id,
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
      cardState,
      isDue,
    };

    allLearnedCards.push(item);
    if (isDue) {
      dueCards.push(item);
    }
  }

  // Sort due cards: most overdue first, then newly learned words
  dueCards.sort(
    (a, b) =>
      new Date(a.cardState.due).getTime() - new Date(b.cardState.due).getTime()
  );

  const dailyQueue = dueCards.slice(0, 20);
  const nextDueLabel =
    dailyQueue.length === 0 && earliestFutureDueMs !== null
      ? formatNextDueLabel(new Date(earliestFutureDueMs).toISOString(), now)
      : null;

  return {
    cards: dailyQueue,
    allLearnedCards,
    totalEnrolled: allLearnedCards.length,
    totalLearnedWords: allLearnedCards.length,
    completedLessonsCount: completedLessons.length,
    dueCount: dueCards.length,
    nextDueLabel,
    nextLessonSlug,
    isAuthenticated: Boolean(user),
  };
}
