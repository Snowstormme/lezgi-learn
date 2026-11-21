import { cache } from 'react';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/env';
import { CONTENT_TTL_MS, memoizeAsync } from '@/lib/server-memo';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import { loadAndValidateContentBundle } from '@/content/loader';
import {
  exerciseSeedSchema,
  type ExerciseSeed,
} from '@/content/schema';
import type { ContentStatus } from '@/features/shared/types';
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

export interface PublishedContentSnapshot {
  units: Array<{
    id: string;
    slug: string;
    order_index: number;
    title_ru: string;
    description_ru: string | null;
  }>;
  lessons: Array<{
    id: string;
    unit_id: string;
    slug: string;
    order_index: number;
    title_ru: string;
    grammar_tip_ru: string | null;
  }>;
  exercises: Array<{
    id: string;
    lesson_id: string;
    slug: string;
    order_index: number;
    type: string;
    word_id: string | null;
    prompt_ru: string;
    payload: unknown;
    status: ContentStatus;
  }>;
  words: Array<{
    id: string;
    slug: string;
    lemma_lez: string;
    translation_ru: string;
    transcription_ru: string | null;
  }>;
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

export async function getPublishedContentSnapshot(): Promise<PublishedContentSnapshot> {
  return memoizeAsync('learning-content-v1', CONTENT_TTL_MS, async () => {
    const supabase = createSupabasePublicClient();
    const [unitsRes, lessonsRes, exercisesRes, wordsRes] = await Promise.all([
      supabase
        .from('units')
        .select('id, slug, order_index, title_ru, description_ru')
        .eq('status', 'published')
        .order('order_index', { ascending: true }),
      supabase
        .from('lessons')
        .select('id, unit_id, slug, order_index, title_ru, grammar_tip_ru')
        .eq('status', 'published')
        .order('order_index', { ascending: true }),
      supabase
        .from('exercises')
        .select(
          'id, lesson_id, slug, order_index, type, word_id, prompt_ru, payload, status'
        )
        .eq('status', 'published')
        .order('order_index', { ascending: true }),
      supabase
        .from('words')
        .select('id, slug, lemma_lez, translation_ru, transcription_ru')
        .eq('status', 'published'),
    ]);

    if (
      unitsRes.error ||
      lessonsRes.error ||
      exercisesRes.error ||
      wordsRes.error ||
      !unitsRes.data?.length
    ) {
      throw new Error(
        unitsRes.error?.message ??
          lessonsRes.error?.message ??
          exercisesRes.error?.message ??
          wordsRes.error?.message ??
          'Published learning content snapshot unavailable'
      );
    }

    return {
      units: unitsRes.data,
      lessons: lessonsRes.data ?? [],
      exercises: exercisesRes.data ?? [],
      words: wordsRes.data ?? [],
    };
  });
}

export const getPublishedUnitsWithLessons = cache(
  async (): Promise<UnitWithLessons[]> => {
    if (isSupabaseConfigured()) {
      try {
        const [snapshot, user] = await Promise.all([
          getPublishedContentSnapshot(),
          getCurrentAuthUser(),
        ]);

        const progressByLessonId = new Map<
          string,
          { status: string; score: number | null }
        >();

        if (user) {
          const supabase = await createSupabaseServerClient();
          const { data: progressRows } = await supabase
            .from('user_progress')
            .select('lesson_id, status, score')
            .eq('user_id', user.id);

          for (const row of progressRows ?? []) {
            progressByLessonId.set(row.lesson_id, {
              status: row.status,
              score: row.score,
            });
          }
        }

        const guestProgress = user ? {} : await readGuestProgressSafe();

        const rawUnits = snapshot.units.map((u) => {
          const unitLessons = snapshot.lessons
            .filter((l) => l.unit_id === u.id)
            .map((l) => {
              const exCount = snapshot.exercises.filter(
                (ex) => ex.lesson_id === l.id
              ).length;
              const prog = progressByLessonId.get(l.id);
              const guestScore = user ? undefined : guestProgress[l.slug];
              const isCompleted =
                prog?.status === 'completed' || guestScore !== undefined;
              return {
                id: l.id,
                slug: l.slug,
                order_index: l.order_index,
                title_ru: l.title_ru,
                grammar_tip_ru: l.grammar_tip_ru,
                exercises_count: exCount || 3,
                is_completed: isCompleted,
                best_score: prog?.score ?? guestScore ?? null,
              };
            });

          return {
            slug: u.slug,
            order_index: u.order_index,
            title_ru: u.title_ru,
            description_ru: u.description_ru,
            source: 'supabase' as const,
            lessons: unitLessons,
            completed_count: unitLessons.filter((l) => l.is_completed).length,
          };
        });

        return applySequentialUnlockAcrossUnits(rawUnits);
      } catch {
        // Fallback to local content bundle
      }
    }

    const bundle = loadAndValidateContentBundle();
    const guestProgress = await readGuestProgressSafe();
    const publishedUnits = [...bundle.units]
      .filter((u) => u.status === 'published')
      .sort((a, b) => a.order_index - b.order_index);

    const fallbackUnits = publishedUnits.map((unit) => {
      const unitLessons = bundle.lessons
        .filter((l) => l.unit_slug === unit.slug && l.status === 'published')
        .sort((a, b) => a.order_index - b.order_index)
        .map((l) => {
          const guestScore = guestProgress[l.slug];
          return {
            slug: l.slug,
            order_index: l.order_index,
            title_ru: l.title_ru,
            grammar_tip_ru: l.grammar_tip_ru ?? null,
            exercises_count: l.exercises.filter((e) => e.status === 'published')
              .length,
            is_completed: guestScore !== undefined,
            best_score: guestScore ?? null,
          };
        });

      return {
        slug: unit.slug,
        order_index: unit.order_index,
        title_ru: unit.title_ru,
        description_ru: unit.description_ru ?? null,
        source: 'local-seed-preview' as const,
        lessons: unitLessons,
        completed_count: unitLessons.filter((l) => l.is_completed).length,
      };
    });

    return applySequentialUnlockAcrossUnits(fallbackUnits);
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

export const getPublishedLessonDetail = cache(
  async (slug: string): Promise<LessonDetail | null> => {
    if (isSupabaseConfigured()) {
      try {
        const snapshot = await getPublishedContentSnapshot();
        const lesson = snapshot.lessons.find((l) => l.slug === slug);

        if (lesson) {
          const unit =
            snapshot.units.find((u) => u.id === lesson.unit_id) ?? null;
          const unitLessons = snapshot.lessons
            .filter((l) => l.unit_id === lesson.unit_id)
            .sort((a, b) => a.order_index - b.order_index);
          const exercisesRows = snapshot.exercises
            .filter((ex) => ex.lesson_id === lesson.id)
            .sort((a, b) => a.order_index - b.order_index);

          const wordById = new Map(snapshot.words.map((w) => [w.id, w]));

          const parsedExercises: LessonExerciseItem[] = [];
          const practiceWordMap = new Map<string, LessonPracticeWord>();

          for (const row of exercisesRows) {
            const linkedWord = row.word_id
              ? wordById.get(row.word_id)
              : undefined;
            if (linkedWord) {
              practiceWordMap.set(linkedWord.slug, {
                id: linkedWord.id,
                slug: linkedWord.slug,
                lemma_lez: linkedWord.lemma_lez,
                translation_ru: linkedWord.translation_ru,
                transcription_ru: linkedWord.transcription_ru,
              });
            }

            const parsed = exerciseSeedSchema.safeParse({
              slug: row.slug,
              order_index: row.order_index,
              type: row.type,
              word_slug: linkedWord?.slug ?? null,
              prompt_ru: row.prompt_ru,
              status: row.status,
              payload: row.payload,
            });

            if (parsed.success) {
              parsedExercises.push({
                ...parsed.data,
                id: row.id,
              });
            }
          }

          const nextLesson =
            unitLessons.find((l) => l.order_index > lesson.order_index) ??
            null;

          if (parsedExercises.length > 0) {
            return {
              id: lesson.id,
              slug: lesson.slug,
              unit_slug: unit?.slug ?? 'unit-01-greetings',
              unit_title_ru: unit?.title_ru ?? 'Курс лезгинского языка',
              order_index: lesson.order_index,
              title_ru: lesson.title_ru,
              grammar_tip_ru: lesson.grammar_tip_ru,
              exercises: parsedExercises,
              practice_words: Array.from(practiceWordMap.values()),
              next_lesson_slug: nextLesson?.slug ?? null,
            };
          }
        }
      } catch {
        // Fallback to local bundle
      }
    }

    const bundle = loadAndValidateContentBundle();
    const lesson = bundle.lessons.find(
      (l) => l.slug === slug && l.status === 'published'
    );
    if (!lesson) return null;

    const unit = bundle.units.find((u) => u.slug === lesson.unit_slug);
    const unitLessons = bundle.lessons
      .filter((l) => l.unit_slug === lesson.unit_slug && l.status === 'published')
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
        const word = bundle.words.find((w) => w.slug === ex.word_slug);
        if (word && word.status === 'published') {
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

    return {
      slug: lesson.slug,
      unit_slug: lesson.unit_slug,
      unit_title_ru: unit?.title_ru ?? 'Курс лезгинского языка',
      order_index: lesson.order_index,
      title_ru: lesson.title_ru,
      grammar_tip_ru: lesson.grammar_tip_ru ?? null,
      exercises: publishedExercises,
      practice_words: practiceWords,
      next_lesson_slug: nextLesson?.slug ?? null,
    };
  }
);
