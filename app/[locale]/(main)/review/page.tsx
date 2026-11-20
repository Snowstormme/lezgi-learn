import { getSrsReviewDeck } from '@/features/learning/srs-queries';
import { SrsReviewDeck } from '@/features/learning/components/srs-review-deck';

export default async function SrsReviewPage() {
  const deck = await getSrsReviewDeck();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">
          Интервальное повторение слов
        </h1>
        <p className="text-xs text-muted-foreground">
          Умные карточки по алгоритму FSRS (`ts-fsrs`) — слова показываются
          именно тогда, когда вы начинаете их забывать.
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
