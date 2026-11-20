import { Check } from 'lucide-react';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { Link } from '@/lib/i18n/routing';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';

export default async function UnitMapPage() {
  const units = await getPublishedUnitsWithLessons();

  return (
    <div className="space-y-8">
      {units.map((unit) => {
        const firstIncompleteIndex = unit.lessons.findIndex(
          (l) => !l.is_completed
        );
        const activeLessonIndex =
          firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;
        const unitTitle = unit.title_ru.replace(/^Юнит \d+\.\s*/, '');

        return (
          <section key={unit.slug} className="space-y-6">
            {/* Geometric Lezgi sumakh carpet divider */}
            <LezgiOrnament />

            {/* Clean editorial unit header — grouped with spacing, no filler pills */}
            <div className="space-y-1.5 pt-1 text-center">
              <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-[#F8FAFC]">
                Модуль {unit.order_index} · {unitTitle}
              </h1>
              <p className="text-xs font-medium text-[#CBD5E1]">
                {unit.lessons.length} уроков · пройдено {unit.completed_count}
              </p>
            </div>

            {/* Vertical chapter-style lesson list */}
            <div className="space-y-3.5">
              {unit.lessons.map((lesson, idx) => {
                const isActive = idx === activeLessonIndex;
                const isCompleted = lesson.is_completed;
                const indexText = String(lesson.order_index).padStart(2, '0');
                const previewLine = lesson.preview_words.join(' · ');

                if (isActive) {
                  return (
                    <div
                      key={lesson.slug}
                      className="relative rounded-xl bg-[#F8FAFC] p-5 text-[#0B132B]"
                    >
                      {/* Subtle Vermillion active dot aligned optically on left edge */}
                      <span
                        aria-hidden="true"
                        className="absolute -left-1.5 top-6 h-3 w-3 rounded-full bg-primary"
                      />

                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2.5">
                          <span className="shrink-0 text-base font-bold tabular-nums text-[#0B132B]">
                            {indexText} ·
                          </span>
                          <h2 className="text-balance text-lg font-bold leading-snug text-[#0B132B]">
                            {lesson.title_ru}
                          </h2>
                        </div>

                        {previewLine && (
                          <p className="text-pretty text-sm font-medium leading-relaxed text-[#334155]">
                            {previewLine}
                          </p>
                        )}

                        <div className="pt-1">
                          <Link
                            href={`/lesson/${lesson.slug}`}
                            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-[#F8FAFC] transition-colors hover:bg-[#DC3D26] active:scale-[0.99]"
                          >
                            {isCompleted ? 'Повторить урок' : 'Начать урок'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={lesson.slug}
                    href={`/lesson/${lesson.slug}`}
                    className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-[#41578E] hover:bg-[#19264A]"
                  >
                    <div className="flex items-start gap-4">
                      <span className="mt-[2px] flex w-7 shrink-0 items-center justify-start text-base font-semibold tabular-nums text-[#CBD5E1]">
                        {isCompleted ? (
                          <Check className="h-4 w-4 stroke-[2.5] text-primary" />
                        ) : (
                          indexText
                        )}
                      </span>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <h2 className="text-balance text-sm font-semibold leading-snug text-[#F8FAFC]">
                            {lesson.title_ru}
                          </h2>
                          {lesson.best_score !== null && (
                            <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">
                              {lesson.best_score}%
                            </span>
                          )}
                        </div>

                        {previewLine && (
                          <p className="text-pretty text-xs leading-relaxed text-[#CBD5E1]">
                            {previewLine}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
