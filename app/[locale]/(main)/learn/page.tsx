import { BookOpen } from 'lucide-react';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { CoursePathMap } from '@/features/learning/components/course-path-map';
import { Link } from '@/lib/i18n/routing';

export default async function UnitMapPage() {
  const units = await getPublishedUnitsWithLessons();

  return (
    <div className="space-y-8 overflow-x-hidden">
      {units.map((unit) => (
        <div key={unit.slug} className="space-y-6">
          {/* Vermillion Unit Header Banner with Cloud White action button */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-5 py-4 text-[#F8FAFC]">
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]/90">
                Модуль {unit.order_index} · {unit.completed_count}/
                {unit.lessons.length}
              </p>
              <h1 className="text-balance text-base font-extrabold leading-snug text-[#F8FAFC]">
                {unit.title_ru.replace(/^Юнит \d+\.\s*/, '')}
              </h1>
            </div>

            <Link
              href="/dictionary"
              title="Открыть словарь модуля"
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 pt-[1px] text-xs font-extrabold uppercase tracking-wider text-[#0B132B] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2"
            >
              <BookOpen className="h-4 w-4 -translate-y-[0.5px] stroke-[2.5]" />
              <span>Слова</span>
            </Link>
          </div>

          <CoursePathMap lessons={unit.lessons} />
        </div>
      ))}
    </div>
  );
}
