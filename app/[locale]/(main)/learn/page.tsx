import { getTranslations } from 'next-intl/server';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { Link } from '@/lib/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function LearnPage() {
  const tLearn = await getTranslations('learn');
  const units = await getPublishedUnitsWithLessons();

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">{tLearn('title')}</h1>
        <p className="text-xs text-muted-foreground">{tLearn('subtitle')}</p>
      </div>

      {units.map((unit) => (
        <Card key={unit.slug} className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-secondary/30">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="verified">{tLearn('verifiedBadge')}</Badge>
              <span className="text-[11px] text-muted-foreground">
                Источник: {unit.source === 'supabase' ? 'Supabase DB' : 'Seed JSON'}
              </span>
            </div>
            <CardTitle className="pt-1 text-base">{unit.title_ru}</CardTitle>
            {unit.description_ru && (
              <p className="text-xs text-muted-foreground">
                {unit.description_ru}
              </p>
            )}
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {unit.lessons.map((lesson) => (
              <div
                key={lesson.slug}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary">
                    Урок {lesson.order_index}
                  </p>
                  <p className="text-sm font-semibold">{lesson.title_ru}</p>
                  <p className="text-xs text-muted-foreground">
                    Упражнений: {lesson.exercises_count}
                  </p>
                </div>
                <Link
                  href={`/lesson/${lesson.slug}`}
                  className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {tLearn('startLesson')}
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
