import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loadAndValidateContentBundle } from '@/content/loader';
import {
  exerciseSeedSchema,
  type ExerciseSeed,
} from '@/content/schema';

export interface LessonSummary {
  id?: string;
  slug: string;
  order_index: number;
  title_ru: string;
  grammar_tip_ru: string | null;
  exercises_count: number;
  preview_words: string[];
  is_completed: boolean;
  best_score: number | null;
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

export async function getPublishedUnitsWithLessons(): Promise<
  UnitWithLessons[]
> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const [
        { data: units, error: unitsError },
        { data: lessons, error: lessonsError },
        { data: exercises, error: exercisesError },
        { data: wordsRows },
        {
          data: { user },
        },
      ] = await Promise.all([
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
          .select('id, lesson_id, type, word_id, payload')
          .eq('status', 'published')
          .order('order_index', { ascending: true }),
        supabase
          .from('words')
          .select('id, lemma_lez')
          .eq('status', 'published'),
        supabase.auth.getUser(),
      ]);

      const wordLemmaById = new Map(
        (wordsRows ?? []).map((w) => [w.id, w.lemma_lez])
      );

      const progressByLessonId = new Map<
        string,
        { status: string; score: number | null }
      >();

      if (user) {
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

      if (!unitsError && !lessonsError && !exercisesError && units?.length) {
        return units.map((u) => {
          const unitLessons = (lessons ?? [])
            .filter((l) => l.unit_id === u.id)
            .map((l) => {
              const lessonEx = (exercises ?? []).filter(
                (ex) => ex.lesson_id === l.id
              );
              const previewSet = new Set<string>();
              for (const ex of lessonEx) {
                if (ex.word_id) {
                  const lemma = wordLemmaById.get(ex.word_id);
                  if (lemma) previewSet.add(lemma);
                }
                if (
                  ex.type === 'matching' &&
                  ex.payload &&
                  typeof ex.payload === 'object' &&
                  'pairs' in ex.payload &&
                  Array.isArray(ex.payload.pairs)
                ) {
                  for (const pair of ex.payload.pairs) {
                    if (
                      pair &&
                      typeof pair === 'object' &&
                      'left' in pair &&
                      typeof pair.left === 'string'
                    ) {
                      previewSet.add(pair.left);
                    }
                  }
                }
              }
              const prog = progressByLessonId.get(l.id);
              return {
                id: l.id,
                slug: l.slug,
                order_index: l.order_index,
                title_ru: l.title_ru,
                grammar_tip_ru: l.grammar_tip_ru,
                exercises_count: lessonEx.length || 6,
                preview_words: Array.from(previewSet).slice(0, 4),
                is_completed: prog?.status === 'completed',
                best_score: prog?.score ?? null,
              };
            });

          return {
            slug: u.slug,
            order_index: u.order_index,
            title_ru: u.title_ru,
            description_ru: u.description_ru,
            source: 'supabase',
            lessons: unitLessons,
            completed_count: unitLessons.filter((l) => l.is_completed).length,
          };
        });
      }
    } catch {
      // Fallback to local content bundle
    }
  }

  const bundle = loadAndValidateContentBundle();
  const publishedUnits = bundle.units
    .filter((u) => u.status === 'published')
    .sort((a, b) => a.order_index - b.order_index);

  return publishedUnits.map((unit) => {
    const unitLessons = bundle.lessons
      .filter((l) => l.unit_slug === unit.slug && l.status === 'published')
      .sort((a, b) => a.order_index - b.order_index)
      .map((l) => {
        const previewSet = new Set<string>();
        const publishedEx = l.exercises.filter((e) => e.status === 'published');
        for (const ex of publishedEx) {
          if (ex.word_slug) {
            const w = bundle.words.find((word) => word.slug === ex.word_slug);
            if (w) previewSet.add(w.lemma_lez);
          }
          if (ex.type === 'matching') {
            for (const p of ex.payload.pairs) {
              previewSet.add(p.left);
            }
          }
        }
        return {
          slug: l.slug,
          order_index: l.order_index,
          title_ru: l.title_ru,
          grammar_tip_ru: l.grammar_tip_ru ?? null,
          exercises_count: publishedEx.length,
          preview_words: Array.from(previewSet).slice(0, 4),
          is_completed: false,
          best_score: null,
        };
      });

    return {
      slug: unit.slug,
      order_index: unit.order_index,
      title_ru: unit.title_ru,
      description_ru: unit.description_ru ?? null,
      source: 'local-seed-preview',
      lessons: unitLessons,
      completed_count: 0,
    };
  });
}

export async function getPublishedLessonDetail(
  slug: string
): Promise<LessonDetail | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: lesson } = await supabase
        .from('lessons')
        .select('id, unit_id, slug, order_index, title_ru, grammar_tip_ru')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (lesson) {
        const [
          { data: unit },
          { data: unitLessons },
          { data: exercisesRows },
          { data: wordsRows },
        ] = await Promise.all([
          supabase
            .from('units')
            .select('slug, title_ru')
            .eq('id', lesson.unit_id)
            .single(),
          supabase
            .from('lessons')
            .select('slug, order_index')
            .eq('unit_id', lesson.unit_id)
            .eq('status', 'published')
            .order('order_index', { ascending: true }),
          supabase
            .from('exercises')
            .select('id, slug, order_index, type, word_id, prompt_ru, payload, status')
            .eq('lesson_id', lesson.id)
            .eq('status', 'published')
            .order('order_index', { ascending: true }),
          supabase
            .from('words')
            .select('id, slug, lemma_lez, translation_ru, transcription_ru')
            .eq('status', 'published'),
        ]);

        const wordById = new Map(
          (wordsRows ?? []).map((w) => [w.id, w])
        );

        const parsedExercises: LessonExerciseItem[] = [];
        const practiceWordMap = new Map<string, LessonPracticeWord>();

        for (const row of exercisesRows ?? []) {
          const linkedWord = row.word_id ? wordById.get(row.word_id) : undefined;
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
          (unitLessons ?? []).find(
            (l) => l.order_index > lesson.order_index
          ) ?? null;

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
