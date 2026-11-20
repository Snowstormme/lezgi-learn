import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getPublishedLessonDetail } from '@/features/learning/queries';
import { Link } from '@/lib/i18n/routing';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';
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
    <div className="space-y-8 py-4">
      <LezgiOrnament />

      {/* Editorial summary header */}
      <div className="space-y-2 text-center">
        <h1 className="text-balance text-2xl font-bold leading-tight text-[#F8FAFC]">
          {tResult('title')}
        </h1>
        <p className="text-pretty text-xs leading-relaxed text-[#CBD5E1]">
          {tResult('subtitle', { lessonTitle: lesson.title_ru })}
        </p>
      </div>

      {/* Clean spaced stats strip */}
      <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card py-4 text-center">
        <div className="space-y-1 px-2">
          <p className="text-xl font-bold tabular-nums text-primary">
            +{xpEarned}
          </p>
          <p className="text-[11px] text-[#CBD5E1]">опыт</p>
        </div>
        <div className="space-y-1 px-2">
          <p className="text-xl font-bold tabular-nums text-[#F8FAFC]">
            {score}%
          </p>
          <p className="text-[11px] text-[#CBD5E1]">точность</p>
        </div>
        <div className="space-y-1 px-2">
          <p className="text-xl font-bold tabular-nums text-[#F8FAFC]">
            {correct}/{total}
          </p>
          <p className="text-[11px] text-[#CBD5E1]">верно</p>
        </div>
      </div>

      {!savedToAccount && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
          <p className="text-xs leading-relaxed text-[#CBD5E1]">
            Войдите, чтобы сохранить пройденные уроки.
          </p>
          <Link
            href="/login"
            className="shrink-0 rounded-lg bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-[#0B132B]"
          >
            Войти
          </Link>
        </div>
      )}

      {/* Practiced words */}
      {lesson.practice_words.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-[#CBD5E1]">
            Слова из урока
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-card px-4">
            {lesson.practice_words.map((word) => (
              <div
                key={word.slug}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#F8FAFC]">
                    {word.lemma_lez}
                  </p>
                  <p className="mt-0.5 text-xs text-[#CBD5E1]">
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

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Link
          href={
            lesson.next_lesson_slug
              ? `/lesson/${lesson.next_lesson_slug}`
              : '/learn'
          }
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-[#F8FAFC] transition-colors hover:bg-[#DC3D26]"
        >
          {lesson.next_lesson_slug ? 'Следующий урок' : 'К карте курса'}
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/learn"
            className="flex min-h-[46px] items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:bg-secondary"
          >
            К карте
          </Link>

          <Link
            href={`/lesson/${lesson.slug}`}
            className="flex min-h-[46px] items-center justify-center rounded-xl bg-[#F8FAFC] px-4 py-2.5 text-xs font-semibold text-[#0B132B] transition-colors hover:bg-[#E2E8F0]"
          >
            Повторить
          </Link>
        </div>
      </div>
    </div>
  );
}
