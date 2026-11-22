import { getSrsReviewDeck } from '@/features/learning/srs-queries';
import { SrsReviewDeck } from '@/features/learning/components/srs-review-deck';
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
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight">
          Повторение слов
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          Ежедневная очередь только из пройденных уроков — отмечайте «Помню» или «Не помню», чтобы закреплять слова надолго.
        </p>
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
