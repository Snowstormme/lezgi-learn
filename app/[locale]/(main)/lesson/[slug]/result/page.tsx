import { notFound } from 'next/navigation';
import {
  Check,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getPublishedLessonDetail } from '@/features/learning/queries';
import { Link } from '@/lib/i18n/routing';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';

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
      {/* Golden Trophy Celebration */}
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-b-[6px] border-[#CC9F00] bg-[#FFC800] text-primary-foreground">
          <Trophy className="h-12 w-12 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#FFC800]">
          {tResult('title')}
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          {tResult('subtitle', { lessonTitle: lesson.title_ru })}
        </p>
      </div>

      {/* 3 Colored-Header Stat Boxes */}
      <div className="grid grid-cols-3 gap-3">
        {/* XP Box */}
        <div className="overflow-hidden rounded-2xl border-2 border-b-4 border-[#FFC800] bg-[#FFC800]">
          <p className="py-1 text-center text-[11px] font-black uppercase tracking-wider text-primary-foreground">
            ОПЫТ
          </p>
          <div className="flex items-center justify-center gap-1 rounded-xl bg-background py-3 text-lg font-black text-[#FFC800]">
            <Zap className="h-5 w-5 fill-[#FFC800]" />
            <span>+{xpEarned}</span>
          </div>
        </div>

        {/* Accuracy Box */}
        <div className="overflow-hidden rounded-2xl border-2 border-b-4 border-primary bg-primary">
          <p className="py-1 text-center text-[11px] font-black uppercase tracking-wider text-primary-foreground">
            ТОЧНОСТЬ
          </p>
          <div className="flex items-center justify-center gap-1 rounded-xl bg-background py-3 text-lg font-black text-primary">
            <Target className="h-5 w-5" />
            <span>{score}%</span>
          </div>
        </div>

        {/* Correct Answers Box */}
        <div className="overflow-hidden rounded-2xl border-2 border-b-4 border-accent bg-accent">
          <p className="py-1 text-center text-[11px] font-black uppercase tracking-wider text-primary-foreground">
            ВЕРНО
          </p>
          <div className="flex items-center justify-center gap-1 rounded-xl bg-background py-3 text-lg font-black text-accent">
            <Check className="h-5 w-5 stroke-[3]" />
            <span>
              {correct}/{total}
            </span>
          </div>
        </div>
      </div>

      {/* Save prompt if guest */}
      {!savedToAccount && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-border bg-card p-4">
          <p className="text-xs font-bold text-muted-foreground">
            Создайте профиль, чтобы сохранить ударный режим и опыт!
          </p>
          <Link
            href="/login"
            className="shrink-0 rounded-xl border-b-4 border-[#1899D6] bg-accent px-3.5 py-2 text-xs font-black uppercase text-primary-foreground"
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
                className="flex items-center justify-between rounded-2xl border-2 border-b-4 border-border bg-card px-4 py-3"
              >
                <div>
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

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          href={
            lesson.next_lesson_slug
              ? `/lesson/${lesson.next_lesson_slug}`
              : '/learn'
          }
          className="flex h-13 w-full items-center justify-center rounded-2xl border-b-4 border-[#46a302] bg-primary px-6 text-base font-black uppercase tracking-wider text-primary-foreground transition-all hover:brightness-105 active:translate-y-[2px]"
        >
          ПРОДОЛЖИТЬ
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/learn"
            className="flex h-12 items-center justify-center rounded-2xl border-2 border-b-4 border-border bg-card px-4 text-xs font-extrabold uppercase tracking-wider text-foreground transition-all active:translate-y-[2px]"
          >
            К КАРТЕ КУРСА
          </Link>

          <Link
            href={`/lesson/${lesson.slug}`}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-border bg-background px-4 text-xs font-extrabold uppercase tracking-wider text-accent transition-all active:translate-y-[2px]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>ПОВТОРИТЬ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
