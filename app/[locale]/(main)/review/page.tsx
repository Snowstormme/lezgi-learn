import { getSrsReviewDeck } from '@/features/learning/srs-queries';
import { SrsReviewDeck } from '@/features/learning/components/srs-review-deck';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';

export default async function SrsReviewPage() {
  const deck = await getSrsReviewDeck();

  return (
    <div className="space-y-6">
      <LezgiOrnament />

      <div className="space-y-1.5">
        <h1 className="text-balance text-2xl font-bold leading-tight text-[#F8FAFC]">
          Повторение слов
        </h1>
        <p className="text-xs leading-relaxed text-[#CBD5E1]">
          Карточки планируются автоматически по мере того, как вы их запоминаете.
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
