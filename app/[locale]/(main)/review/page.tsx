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
    <SrsReviewDeck
      initialCards={deck.cards}
      allLearnedCards={deck.allLearnedCards}
      totalLearnedWords={deck.totalLearnedWords}
      completedLessonsCount={deck.completedLessonsCount}
      nextDueLabel={deck.nextDueLabel}
      nextLessonSlug={deck.nextLessonSlug}
      isAuthenticated={deck.isAuthenticated}
    />
  );
}
