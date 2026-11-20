import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loadAndValidateContentBundle } from '@/content/loader';

export interface LessonSummary {
  slug: string;
  order_index: number;
  title_ru: string;
  grammar_tip_ru: string | null;
  exercises_count: number;
}

export interface UnitWithLessons {
  slug: string;
  order_index: number;
  title_ru: string;
  description_ru: string | null;
  lessons: LessonSummary[];
  source: 'supabase' | 'local-seed-preview';
}

/**
 * Fetches published units and lessons.
 * Works both for authenticated users and guests (anon).
 * Falls back to validated local JSON seed files if .env.local is not configured yet.
 */
export async function getPublishedUnitsWithLessons(): Promise<
  UnitWithLessons[]
> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id, slug, order_index, title_ru, description_ru')
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, unit_id, slug, order_index, title_ru, grammar_tip_ru')
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      if (!unitsError && !lessonsError && units && units.length > 0) {
        return units.map((u) => ({
          slug: u.slug,
          order_index: u.order_index,
          title_ru: u.title_ru,
          description_ru: u.description_ru,
          source: 'supabase',
          lessons: (lessons ?? [])
            .filter((l) => l.unit_id === u.id)
            .map((l) => ({
              slug: l.slug,
              order_index: l.order_index,
              title_ru: l.title_ru,
              grammar_tip_ru: l.grammar_tip_ru,
              exercises_count: 3,
            })),
        }));
      }
    } catch {
      // Fallback to local content bundle if cloud DB is empty or unreachable
    }
  }

  const bundle = loadAndValidateContentBundle();
  const publishedUnits = bundle.units
    .filter((u) => u.status === 'published')
    .sort((a, b) => a.order_index - b.order_index);

  return publishedUnits.map((unit) => ({
    slug: unit.slug,
    order_index: unit.order_index,
    title_ru: unit.title_ru,
    description_ru: unit.description_ru ?? null,
    source: 'local-seed-preview',
    lessons: bundle.lessons
      .filter((l) => l.unit_slug === unit.slug && l.status === 'published')
      .sort((a, b) => a.order_index - b.order_index)
      .map((l) => ({
        slug: l.slug,
        order_index: l.order_index,
        title_ru: l.title_ru,
        grammar_tip_ru: l.grammar_tip_ru ?? null,
        exercises_count: l.exercises.filter((e) => e.status === 'published')
          .length,
      })),
  }));
}
