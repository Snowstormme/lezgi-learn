import { BookOpen } from 'lucide-react';
import { getSrsReviewDeck } from '@/features/learning/srs-queries';
import { SrsReviewDeck } from '@/features/learning/components/srs-review-deck';
import { Link } from '@/lib/i18n/routing';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Повторение пройденных лезгинских слов (SRS)',
  description:
    'Ежедневная очередь интервального повторения только из тех лезгинских слов, которые вы уже прошли в уроках.',
  path: '/review',
  keywords: [
    'повторение лезгинских слов',
    'интервальное повторение лезгинский язык',
    'карточки лезгинский язык',
  ],
});

export default async function SrsReviewPage() {
  const deck = await getSrsReviewDeck();

  return (
    <div className="space-y-6">
      {/* Vermillion 3D Header Banner matching the main /learn tab */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-5 py-4 text-[#F8FAFC]">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]/90">
            Повтор · {deck.dueCount}/{deck.totalLearnedWords}
          </p>
          <h1 className="text-balance text-base font-extrabold leading-snug text-[#F8FAFC]">
            Изученные слова
          </h1>
        </div>

        <Link
          href="/dictionary"
          title="Открыть словарь"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 pt-[1px] text-xs font-extrabold uppercase tracking-wider text-[#0B132B] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2"
        >
          <BookOpen className="h-4 w-4 -translate-y-[0.5px] stroke-[2.5]" />
          <span>Слова</span>
        </Link>
      </div>

      <SrsReviewDeck
        initialCards={deck.cards}
        allLearnedCards={deck.allLearnedCards}
        totalLearnedWords={deck.totalLearnedWords}
        completedLessonsCount={deck.completedLessonsCount}
        nextDueLabel={deck.nextDueLabel}
        nextLessonSlug={deck.nextLessonSlug}
        isAuthenticated={deck.isAuthenticated}
      />
    </div>
  );
}
