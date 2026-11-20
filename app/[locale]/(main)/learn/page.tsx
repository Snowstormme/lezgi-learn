import {
  Award,
  BookOpen,
  Check,
  Compass,
  HeartHandshake,
  MessageCircle,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { Link } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

const PATH_OFFSETS = [
  'translate-x-0',
  '-translate-x-7',
  '-translate-x-11',
  '-translate-x-6',
  'translate-x-2',
  'translate-x-8',
  'translate-x-11',
  'translate-x-6',
  '-translate-x-2',
  'translate-x-0',
];

const NODE_ICONS = [
  Star,
  Sparkles,
  MessageCircle,
  Users,
  BookOpen,
  Compass,
  MessageCircle,
  HeartHandshake,
  Award,
  Trophy,
];

export default async function UnitMapPage() {
  const units = await getPublishedUnitsWithLessons();

  return (
    <div className="space-y-8 overflow-x-hidden">
      {units.map((unit) => {
        const firstIncompleteIndex = unit.lessons.findIndex(
          (l) => !l.is_completed
        );
        const activeLessonIndex =
          firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;

        return (
          <div key={unit.slug} className="space-y-8">
            {/* Vermillion Unit Header Banner with Cloud White action button */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-5 py-4 text-[#F8FAFC]">
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]/85">
                  МОДУЛЬ {unit.order_index} • {unit.completed_count} ИЗ{' '}
                  {unit.lessons.length}
                </p>
                <h1 className="text-lg font-black leading-snug text-[#F8FAFC]">
                  {unit.title_ru.replace(/^Юнит \d+\.\s*/, '')}
                </h1>
              </div>

              <Link
                href="/dictionary"
                title="Открыть словарь модуля"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-black uppercase tracking-wider text-[#0B132B] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2"
              >
                <BookOpen className="h-4 w-4 stroke-[2.5]" />
                <span>Слова</span>
              </Link>
            </div>

            {/* Winding Stepping-Stone Snake Path */}
            <div className="flex flex-col items-center space-y-6 py-2">
              {unit.lessons.map((lesson, idx) => {
                const isCurrentTarget = idx === activeLessonIndex;
                const isCompleted = lesson.is_completed;
                const offsetClass =
                  PATH_OFFSETS[idx % PATH_OFFSETS.length] ?? 'translate-x-0';
                const NodeIcon =
                  NODE_ICONS[idx % NODE_ICONS.length] ?? Star;

                return (
                  <div
                    key={lesson.slug}
                    className={cn(
                      'relative flex flex-col items-center transition-transform',
                      offsetClass
                    )}
                  >
                    {/* Cloud White speech bubble above active current lesson */}
                    {isCurrentTarget && (
                      <div className="mb-2.5 flex flex-col items-center animate-bounce">
                        <div className="rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-primary shadow-md">
                          {isCompleted ? 'ПОВТОРИТЬ' : 'НАЧАТЬ'}
                        </div>
                        <div className="h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-[#CBD5E1]" />
                      </div>
                    )}

                    {/* Outer ring for active target */}
                    <div
                      className={cn(
                        'rounded-full transition-all',
                        isCurrentTarget &&
                          'border-4 border-[#F8FAFC]/30 bg-background p-2'
                      )}
                    >
                      <Link
                        href={`/lesson/${lesson.slug}`}
                        className={cn(
                          'flex h-[72px] w-[78px] items-center justify-center rounded-full transition-all active:translate-y-[4px]',
                          isCompleted &&
                            'border-2 border-b-[6px] border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B] hover:bg-white',
                          !isCompleted &&
                            isCurrentTarget &&
                            'border-2 border-b-[6px] border-[#B92B1C] bg-primary text-[#F8FAFC] hover:brightness-105',
                          !isCompleted &&
                            !isCurrentTarget &&
                            'border-2 border-b-[6px] border-border bg-card text-muted-foreground hover:border-[#F8FAFC]/50 hover:text-[#F8FAFC]'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-8 w-8 stroke-[3.5] text-primary" />
                        ) : (
                          <NodeIcon className="h-7 w-7 stroke-[2.5]" />
                        )}
                      </Link>
                    </div>

                    {/* Lesson title under node */}
                    <Link
                      href={`/lesson/${lesson.slug}`}
                      className="mt-2 max-w-[184px] text-center"
                    >
                      <p
                        className={cn(
                          'text-xs font-extrabold leading-tight',
                          isCurrentTarget
                            ? 'text-[#F8FAFC]'
                            : isCompleted
                              ? 'text-primary'
                              : 'text-muted-foreground'
                        )}
                      >
                        {lesson.order_index}. {lesson.title_ru.split(':')[0]}
                      </p>
                      {lesson.best_score !== null && (
                        <span className="mt-1 inline-block rounded-lg border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary">
                          ★ {lesson.best_score}%
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
