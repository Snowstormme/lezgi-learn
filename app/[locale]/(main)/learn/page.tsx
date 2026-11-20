import {
  CheckCircle2,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { getCurrentUserSession } from '@/features/profile/queries';
import { Link } from '@/lib/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LessonProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

export default async function UnitMapPage() {
  const tLearn = await getTranslations('learn');
  const [units, session] = await Promise.all([
    getPublishedUnitsWithLessons(),
    getCurrentUserSession(),
  ]);

  return (
    <div className="space-y-5">
      {/* Top stats bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <div className="space-y-0.5">
          <h1 className="text-base font-bold tracking-tight">
            {tLearn('title')}
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {tLearn('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">
            <Flame className="h-3.5 w-3.5" />
            <span>{session.streakDays}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            <Trophy className="h-3.5 w-3.5" />
            <span>{session.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Units & stepping-stone lesson nodes */}
      {units.map((unit) => {
        const totalLessons = unit.lessons.length;
        const firstIncompleteIndex = unit.lessons.findIndex(
          (l) => !l.is_completed
        );
        const activeLessonIndex =
          firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;

        return (
          <Card key={unit.slug} className="overflow-hidden border-border/90">
            <CardHeader className="space-y-2.5 border-b border-border/60 bg-secondary/30">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="verified">{tLearn('verifiedBadge')}</Badge>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {tLearn('unitProgress', {
                    completed: unit.completed_count,
                    total: totalLessons,
                  })}
                </span>
              </div>

              <div>
                <CardTitle className="text-base">{unit.title_ru}</CardTitle>
                {unit.description_ru && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {unit.description_ru}
                  </p>
                )}
              </div>

              <LessonProgressBar
                current={unit.completed_count}
                total={totalLessons}
              />
            </CardHeader>

            <CardContent className="p-4">
              <div className="relative space-y-3">
                {unit.lessons.map((lesson, idx) => {
                  const isCurrentTarget = idx === activeLessonIndex;

                  return (
                    <div
                      key={lesson.slug}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all',
                        lesson.is_completed &&
                          'border-emerald-500/30 bg-emerald-500/5',
                        !lesson.is_completed &&
                          isCurrentTarget &&
                          'border-primary/60 bg-primary/10 ring-1 ring-primary/30',
                        !lesson.is_completed &&
                          !isCurrentTarget &&
                          'border-border bg-background/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Step node circle */}
                        <div
                          className={cn(
                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            lesson.is_completed &&
                              'bg-emerald-500 text-background',
                            !lesson.is_completed &&
                              isCurrentTarget &&
                              'bg-primary text-primary-foreground',
                            !lesson.is_completed &&
                              !isCurrentTarget &&
                              'border border-border bg-secondary text-muted-foreground'
                          )}
                        >
                          {lesson.is_completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            lesson.order_index
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-semibold leading-snug text-foreground">
                            {lesson.title_ru}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline">
                              {tLearn('exercisesCount', {
                                count: lesson.exercises_count,
                              })}
                            </Badge>
                            {lesson.grammar_tip_ru && (
                              <Badge variant="secondary">
                                <Sparkles className="h-2.5 w-2.5 text-primary" />
                                <span>{tLearn('grammarTipBadge')}</span>
                              </Badge>
                            )}
                            {lesson.best_score !== null && (
                              <Badge variant="verified">
                                {lesson.best_score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/lesson/${lesson.slug}`}
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors',
                          lesson.is_completed
                            ? 'border border-border bg-secondary/80 text-foreground hover:bg-secondary'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                      >
                        {lesson.is_completed ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>{tLearn('repeatLesson')}</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            <span>{tLearn('startLesson')}</span>
                          </>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
