import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Map,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getPublishedLessonDetail } from '@/features/learning/queries';
import { Link } from '@/lib/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function LessonResultScreenPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    score?: string;
    correct?: string;
    total?: string;
    xp?: string;
    saved?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const tResult = await getTranslations('result');

  const lesson = await getPublishedLessonDetail(slug);
  if (!lesson) {
    notFound();
  }

  const total = Math.max(1, Number(sp.total) || lesson.exercises.length);
  const correct = Math.min(total, Math.max(0, Number(sp.correct) || total));
  const score = Math.min(
    100,
    Math.max(0, Number(sp.score) ?? Math.round((correct / total) * 100))
  );
  const xpEarned = Math.max(5, Number(sp.xp) || Math.round(score * 0.15));
  const savedToAccount = sp.saved === '1';

  return (
    <div className="space-y-5">
      {/* Header celebration block */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/15 via-card to-card p-5 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
          <Award className="h-7 w-7" />
        </div>
        <Badge variant="verified">{tResult('badge')}</Badge>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
          {tResult('title')}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {tResult('subtitle', { lessonTitle: lesson.title_ru })}
        </p>

        {/* 3 metrics */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-background/70 p-3">
            <p className="text-lg font-extrabold text-primary">{score}%</p>
            <p className="text-[11px] text-muted-foreground">
              {tResult('accuracyLabel')}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-3">
            <p className="text-lg font-extrabold text-foreground">
              {correct} / {total}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {tResult('correctLabel')}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-3">
            <p className="text-lg font-extrabold text-amber-300">
              +{xpEarned} XP
            </p>
            <p className="text-[11px] text-muted-foreground">
              {tResult('xpEarnedLabel')}
            </p>
          </div>
        </div>
      </div>

      {/* Persistence notice */}
      {savedToAccount ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{tResult('savedNotice')}</span>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <p>{tResult('guestSaveNotice')}</p>
          <Link
            href="/login"
            className="inline-flex items-center font-semibold text-amber-300 underline underline-offset-4"
          >
            Войти или создать аккаунт →
          </Link>
        </div>
      )}

      {/* Practiced words summary */}
      {lesson.practice_words.length > 0 && (
        <Card>
          <CardHeader className="pb-2.5">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{tResult('wordsLearnedTitle')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60">
            {lesson.practice_words.map((word) => (
              <div
                key={word.slug}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-bold text-primary">
                    {word.lemma_lez}
                  </p>
                  {word.transcription_ru && (
                    <p className="text-[11px] text-muted-foreground">
                      [{word.transcription_ru}]
                    </p>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground">
                  {word.translation_ru}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="space-y-2.5 pt-1">
        {lesson.next_lesson_slug && (
          <Link
            href={`/lesson/${lesson.next_lesson_slug}`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90"
          >
            <span>{tResult('nextLessonCta')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/learn"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-4 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <Map className="h-3.5 w-3.5" />
            <span>{tResult('backToMapCta')}</span>
          </Link>

          <Link
            href={`/lesson/${lesson.slug}`}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{tResult('retryLessonCta')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
