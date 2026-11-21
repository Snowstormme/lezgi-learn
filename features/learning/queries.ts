import { cache } from 'react';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/env';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import { loadAndValidateContentBundle } from '@/content/loader';
import { type ExerciseSeed } from '@/content/schema';
import {
  applySequentialUnlockAcrossUnits,
  GUEST_COMPLETED_COOKIE,
  parseGuestProgressCookie,
  type GuestProgressMap,
} from './progression';

export interface LessonSummary {
  id?: string;
  slug: string;
  order_index: number;
  title_ru: string;
  grammar_tip_ru: string | null;
  exercises_count: number;
  is_completed: boolean;
  is_unlocked: boolean;
  best_score: number | null;
}

export interface LessonAccessStatus {
  exists: boolean;
  isUnlocked: boolean;
  activeLessonSlug: string | null;
  previousLessonTitle: string | null;
}

export interface UnitWithLessons {
  slug: string;
  order_index: number;
  title_ru: string;
  description_ru: string | null;
  lessons: LessonSummary[];
  completed_count: number;
  source: 'supabase' | 'local-seed-preview';
}

export interface LessonPracticeWord {
  id?: string;
  slug: string;
  lemma_lez: string;
  translation_ru: string;
  transcription_ru: string | null;
}

export type LessonExerciseItem = ExerciseSeed & {
  id?: string;
};

export interface LessonDetail {
  id?: string;
  slug: string;
  unit_slug: string;
  unit_title_ru: string;
  order_index: number;
  title_ru: string;
  grammar_tip_ru: string | null;
  exercises: LessonExerciseItem[];
  practice_words: LessonPracticeWord[];
  next_lesson_slug: string | null;
}

async function readGuestProgressSafe(): Promise<GuestProgressMap> {
  try {
    const cookieStore = await cookies();
    return parseGuestProgressCookie(
      cookieStore.get(GUEST_COMPLETED_COOKIE)?.value
    );
  } catch {
    return {};
  }
}

export const getPublishedUnitsWithLessons = cache(
  async (): Promise<UnitWithLessons[]> => {
    const bundle = loadAndValidateContentBundle();
    const user = await getCurrentAuthUser();

    const progressBySlug = new Map<
      string,
      { status: string; score: number | null }
    >();

    if (user && isSupabaseConfigured()) {
      try {
        const supabase = await createSupabaseServerClient();
        const [{ data: dbLessons }, { data: progressRows }] = await Promise.all(
          [
            supabase
              .from('lessons')
              .select('id, slug')
              .eq('status', 'published'),
            supabase
              .from('user_progress')
              .select('lesson_id, status, score')
              .eq('user_id', user.id),
          ]
        );

        const slugByLessonId = new Map(
          (dbLessons ?? []).map((l) => [l.id, l.slug])
        );

        for (const row of progressRows ?? []) {
          const lessonSlug = slugByLessonId.get(row.lesson_id);
          if (lessonSlug) {
            progressBySlug.set(lessonSlug, {
              status: row.status,
              score: row.score,
            });
          }
        }
      } catch {
        // Fallback to local progress
      }
    }

    const guestProgress = user ? {} : await readGuestProgressSafe();

    const publishedUnits = [...bundle.units]
      .filter((u) => u.status === 'published')
      .sort((a, b) => a.order_index - b.order_index);

    const units = publishedUnits.map((unit) => {
      const unitLessons = [...bundle.lessons]
        .filter((l) => l.unit_slug === unit.slug && l.status === 'published')
        .sort((a, b) => a.order_index - b.order_index)
        .map((l) => {
          const prog = progressBySlug.get(l.slug);
          const guestScore = user ? undefined : guestProgress[l.slug];
          const isCompleted =
            prog?.status === 'completed' || guestScore !== undefined;
          return {
            slug: l.slug,
            order_index: l.order_index,
            title_ru: l.title_ru,
            grammar_tip_ru: l.grammar_tip_ru ?? null,
            exercises_count: l.exercises.filter((e) => e.status === 'published')
              .length,
            is_completed: isCompleted,
            best_score: prog?.score ?? guestScore ?? null,
          };
        });

      return {
        slug: unit.slug,
        order_index: unit.order_index,
        title_ru: unit.title_ru,
        description_ru: unit.description_ru ?? null,
        source: user ? ('supabase' as const) : ('local-seed-preview' as const),
        lessons: unitLessons,
        completed_count: unitLessons.filter((l) => l.is_completed).length,
      };
    });

    return applySequentialUnlockAcrossUnits(units);
  }
);

export async function getLessonAccessStatus(
  slug: string
): Promise<LessonAccessStatus> {
  const units = await getPublishedUnitsWithLessons();
  const orderedLessons = units.flatMap((u) => u.lessons);
  const targetIdx = orderedLessons.findIndex((l) => l.slug === slug);

  if (targetIdx === -1) {
    return {
      exists: false,
      isUnlocked: false,
      activeLessonSlug: orderedLessons[0]?.slug ?? null,
      previousLessonTitle: null,
    };
  }

  const target = orderedLessons[targetIdx];
  const prev = targetIdx > 0 ? orderedLessons[targetIdx - 1] : null;
  const active =
    orderedLessons.find((l) => l.is_unlocked && !l.is_completed) ??
    orderedLessons[0] ??
    null;

  return {
    exists: true,
    isUnlocked: target.is_unlocked,
    activeLessonSlug: active?.slug ?? null,
    previousLessonTitle: prev?.title_ru ?? null,
  };
}

let cachedLessonDetailsBySlug: Map<string, LessonDetail> | null = null;

export async function getPublishedLessonDetail(
  slug: string
): Promise<LessonDetail | null> {
  if (!cachedLessonDetailsBySlug) {
    const bundle = loadAndValidateContentBundle();
    const wordBySlug = new Map(
      bundle.words
        .filter((w) => w.status === 'published')
        .map((w) => [w.slug, w])
    );
    const unitBySlug = new Map(bundle.units.map((u) => [u.slug, u]));

    const map = new Map<string, LessonDetail>();
    const publishedLessons = bundle.lessons.filter(
      (l) => l.status === 'published'
    );

    for (const lesson of publishedLessons) {
      const unit = unitBySlug.get(lesson.unit_slug);
      const unitLessons = publishedLessons
        .filter((l) => l.unit_slug === lesson.unit_slug)
        .sort((a, b) => a.order_index - b.order_index);

      const nextLesson =
        unitLessons.find((l) => l.order_index > lesson.order_index) ?? null;

      const publishedExercises = lesson.exercises.filter(
        (ex) => ex.status === 'published'
      );

      const practiceWords: LessonPracticeWord[] = [];
      const seenSlugs = new Set<string>();
      for (const ex of publishedExercises) {
        if (ex.word_slug && !seenSlugs.has(ex.word_slug)) {
          const word = wordBySlug.get(ex.word_slug);
          if (word) {
            seenSlugs.add(word.slug);
            practiceWords.push({
              slug: word.slug,
              lemma_lez: word.lemma_lez,
              translation_ru: word.translation_ru,
              transcription_ru: word.transcription_ru ?? null,
            });
          }
        }
      }

      map.set(lesson.slug, {
        slug: lesson.slug,
        unit_slug: lesson.unit_slug,
        unit_title_ru: unit?.title_ru ?? 'Курс лезгинского языка',
        order_index: lesson.order_index,
        title_ru: lesson.title_ru,
        grammar_tip_ru: lesson.grammar_tip_ru ?? null,
        exercises: publishedExercises,
        practice_words: practiceWords,
        next_lesson_slug: nextLesson?.slug ?? null,
      });
    }

    cachedLessonDetailsBySlug = map;
  }

  return cachedLessonDetailsBySlug.get(slug) ?? null;
}
