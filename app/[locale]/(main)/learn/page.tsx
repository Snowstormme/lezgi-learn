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
  '-translate-x-10',
  '-translate-x-16',
  '-translate-x-8',
  'translate-x-2',
  'translate-x-12',
  'translate-x-16',
  'translate-x-8',
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
    <div className="space-y-8">
      {units.map((unit) => {
        const firstIncompleteIndex = unit.lessons.findIndex(
          (l) => !l.is_completed
        );
        const activeLessonIndex =
          firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;

        return (
          <div key={unit.slug} className="space-y-8">
            {/* Solid Green Unit Header Banner */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border-b-4 border-[#46a302] bg-primary px-5 py-4 text-primary-foreground">
              <div className="space-y-0.5">
                <p className="text-xs font-black uppercase tracking-wider opacity-80">
                  МОДУЛЬ {unit.order_index} • {unit.completed_count} ИЗ{' '}
                  {unit.lessons.length}
                </p>
                <h1 className="text-lg font-black leading-snug">
                  {unit.title_ru.replace(/^Юнит \d+\.\s*/, '')}
                </h1>
              </div>

              <Link
                href="/dictionary"
                title="Открыть словарь модуля"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 border-primary-foreground/25 bg-black/15 px-3 text-xs font-black uppercase tracking-wider text-primary-foreground transition-transform active:translate-y-[2px]"
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
                    {/* Floating speech bubble above active current lesson */}
                    {isCurrentTarget && (
                      <div className="mb-2.5 flex flex-col items-center animate-bounce">
                        <div className="rounded-xl border-2 border-b-4 border-border bg-card px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-primary shadow-md">
                          {isCompleted ? 'ПОВТОРИТЬ' : 'НАЧАТЬ'}
                        </div>
                        <div className="h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-border" />
                      </div>
                    )}

                    {/* Outer ring for active target */}
                    <div
                      className={cn(
                        'rounded-full transition-all',
                        isCurrentTarget &&
                          'border-4 border-border bg-background p-2'
                      )}
                    >
                      <Link
                        href={`/lesson/${lesson.slug}`}
                        className={cn(
                          'flex h-[70px] w-[76px] items-center justify-center rounded-full transition-all active:translate-y-[4px]',
                          isCompleted &&
                            'border-b-[6px] border-[#CC9F00] bg-[#FFC800] text-primary-foreground hover:brightness-105',
                          !isCompleted &&
                            isCurrentTarget &&
                            'border-b-[6px] border-[#46a302] bg-primary text-primary-foreground hover:brightness-105',
                          !isCompleted &&
                            !isCurrentTarget &&
                            'border-2 border-b-[6px] border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-8 w-8 stroke-[3.5]" />
                        ) : (
                          <NodeIcon className="h-7 w-7 stroke-[2.5]" />
                        )}
                      </Link>
                    </div>

                    {/* Lesson title pill under node */}
                    <Link
                      href={`/lesson/${lesson.slug}`}
                      className="mt-2 max-w-[200px] text-center"
                    >
                      <p
                        className={cn(
                          'text-xs font-extrabold leading-tight',
                          isCurrentTarget
                            ? 'text-primary'
                            : isCompleted
                              ? 'text-[#FFC800]'
                              : 'text-muted-foreground'
                        )}
                      >
                        {lesson.order_index}. {lesson.title_ru.split(':')[0]}
                      </p>
                      {lesson.best_score !== null && (
                        <span className="mt-0.5 inline-block rounded-lg bg-[#FFC800]/15 px-2 py-0.5 text-[10px] font-black text-[#FFC800]">
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
