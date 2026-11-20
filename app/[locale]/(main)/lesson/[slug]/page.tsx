import { Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
  getLessonAccessStatus,
  getPublishedLessonDetail,
} from '@/features/learning/queries';
import { LessonRunner } from '@/features/learning/components/lesson-runner';
import { Link } from '@/lib/i18n/routing';

export default async function LessonScreenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [lesson, access] = await Promise.all([
    getPublishedLessonDetail(slug),
    getLessonAccessStatus(slug),
  ]);

  if (!lesson) {
    notFound();
  }

  if (!access.isUnlocked) {
    const prevTitle = access.previousLessonTitle
      ? `«${access.previousLessonTitle}»`
      : 'предыдущий урок';

    return (
      <div className="mx-auto max-w-md py-10">
        <div className="space-y-5 rounded-3xl border-2 border-b-[6px] border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-b-4 border-[#1D2B4D] bg-[#111A33] pt-[2px] text-[#94A3B8]">
            <Lock className="h-7 w-7 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-balance text-xl font-extrabold text-[#F8FAFC]">
              Урок пока закрыт
            </h1>
            <p className="text-balance text-sm leading-relaxed text-[#C1D0E4]">
              Уроки открываются поэтапно. Сначала пройдите {prevTitle}, чтобы открыть{' '}
              {lesson.order_index}-й урок «{lesson.title_ru}».
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {access.activeLessonSlug && (
              <Link
                href={`/lesson/${access.activeLessonSlug}`}
                className="flex h-12 w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary pt-[1px] text-sm font-extrabold uppercase tracking-wider text-[#F8FAFC] transition-all hover:brightness-105 active:translate-y-[2px] active:border-b-2"
              >
                Перейти к доступному уроку
              </Link>
            )}
            <Link
              href="/learn"
              className="flex h-11 w-full items-center justify-center rounded-2xl border-2 border-b-4 border-border bg-background pt-[1px] text-xs font-extrabold uppercase tracking-wider text-[#CBD5E1] transition-all hover:text-[#F8FAFC] active:translate-y-[2px] active:border-b-2"
            >
              К карте курса
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LessonRunner lesson={lesson} />;
}
