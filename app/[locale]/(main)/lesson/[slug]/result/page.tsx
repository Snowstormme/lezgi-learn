import { notFound } from 'next/navigation';
import {
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getPublishedLessonDetail } from '@/features/learning/queries';
import { AnimatedResultStats } from '@/features/learning/components/animated-result-stats';
import { ConfettiBurst } from '@/components/course/ConfettiBurst';
import { Link } from '@/lib/i18n/routing';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Результаты урока',
  description: 'Итоги прохождения урока лезгинского языка на Lezgi Learn.',
  path: '/learn',
  noIndex: true,
});

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
    <div className="space-y-6 py-4">
      {/* Vermillion & Cloud White Trophy Celebration */}
      <div className="space-y-3 text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          {score >= 70 && <ConfettiBurst />}
          <div className="animate-duo-pop relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-b-[6px] border-[#B92B1C] bg-primary text-[#F8FAFC]">
            <Trophy className="h-12 w-12 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {tResult('title')}
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          {tResult('subtitle', { lessonTitle: lesson.title_ru })}
        </p>
      </div>

      {/* 3 Tactile Animated Stat Boxes (Vermillion / Cloud White / Navy) */}
      <AnimatedResultStats
        xpEarned={xpEarned}
        score={score}
        correct={correct}
        total={total}
      />

      {/* Save prompt if guest */}
      {!savedToAccount && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-border bg-card p-4">
          <p className="text-xs font-bold text-muted-foreground">
            Создайте профиль, чтобы сохранить ударный режим и опыт!
          </p>
          <Link
            href="/login"
            className="flex h-10 shrink-0 items-center rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-black uppercase text-[#0B132B] active:translate-y-[1px]"
          >
            Войти
          </Link>
        </div>
      )}

      {/* Words practiced in this lesson */}
      {lesson.practice_words.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            {tResult('wordsLearnedTitle')}
          </p>
          <div className="space-y-2">
            {lesson.practice_words.map((word) => (
              <div
                key={word.slug}
                className="flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-base font-black text-primary">
                    {word.lemma_lez}
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    {word.translation_ru}
                  </p>
                </div>
                <AudioPlayerButton
                  textLez={word.lemma_lez}
                  transcriptionRu={word.transcription_ru}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-height Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          href={
            lesson.next_lesson_slug
              ? `/lesson/${lesson.next_lesson_slug}`
              : '/learn'
          }
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-6 py-3.5 text-base font-black uppercase tracking-wider text-[#F8FAFC] transition-all hover:brightness-105 active:translate-y-[2px] active:border-b-2"
        >
          ПРОДОЛЖИТЬ
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/learn"
            className="flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-b-4 border-border bg-card px-4 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-foreground transition-all hover:bg-secondary active:translate-y-[2px] active:border-b-2"
          >
            К КАРТЕ КУРСА
          </Link>

          <Link
            href={`/lesson/${lesson.slug}`}
            className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#0B132B] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>ПОВТОРИТЬ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
