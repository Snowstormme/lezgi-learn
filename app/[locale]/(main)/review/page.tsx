import { getSrsReviewDeck } from '@/features/learning/srs-queries';
import { SrsReviewDeck } from '@/features/learning/components/srs-review-deck';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Тренировка и повторение лезгинских слов',
  description:
    'Умные карточки интервального повторения (SRS) для быстрого запоминания лезгинских слов и выражений.',
  path: '/review',
  keywords: [
    'повторение лезгинских слов',
    'карточки лезгинский язык',
    'учить лезгинские слова',
  ],
});

export default async function SrsReviewPage() {
  const deck = await getSrsReviewDeck();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight">
          Тренировка слов
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          Умные карточки показывают слова именно тогда, когда их пора освежить в памяти.
        </p>
      </div>

      <SrsReviewDeck
        initialCards={deck.cards}
        isAuthenticated={deck.isAuthenticated}
        totalEnrolled={deck.totalEnrolled}
      />
    </div>
  );
}
