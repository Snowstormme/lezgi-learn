'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, Eye, RotateCcw } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import type { SrsReviewCardItem } from '@/features/learning/srs-queries';
import {
  getSrsIntervalPreviews,
  type SrsRatingGrade,
} from '@/features/learning/fsrs';
import { reviewWordCardAction } from '@/features/learning/srs-actions';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { LessonProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SrsReviewDeckProps {
  initialCards: SrsReviewCardItem[];
  isAuthenticated: boolean;
  totalEnrolled: number;
}

export function SrsReviewDeck({
  initialCards,
  isAuthenticated,
}: SrsReviewDeckProps) {
  const [queue, setQueue] = useState<SrsReviewCardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const currentCard = queue[currentIndex];

  const intervalPreviews = useMemo(() => {
    if (!currentCard) return { 1: '1 мин', 2: '10 мин', 3: '1 д', 4: '4 д' };
    return getSrsIntervalPreviews(currentCard.cardState);
  }, [currentCard]);

  function handleRate(grade: SrsRatingGrade) {
    if (!currentCard) return;

    startTransition(async () => {
      const res = await reviewWordCardAction({
        wordId: currentCard.wordId,
        grade,
        currentState: currentCard.cardState,
      });

      const updatedState = res.ok ? res.data.nextState : currentCard.cardState;

      if (grade === 1) {
        setQueue((prev) => [
          ...prev,
          { ...currentCard, cardState: updatedState },
        ]);
      }

      setReviewedCount((c) => c + 1);
      setIsRevealed(false);
      setCurrentIndex((idx) => idx + 1);
    });
  }

  if (!currentCard) {
    return (
      <div className="space-y-6 rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[#F8FAFC]">
          <Check className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-balance text-lg font-bold text-[#F8FAFC]">
            Повторение завершено
          </h2>
          <p className="text-xs text-[#CBD5E1]">
            Пройдено карточек: {reviewedCount}
          </p>
        </div>

        {!isAuthenticated && (
          <p className="text-xs leading-relaxed text-[#CBD5E1]">
            Войдите, чтобы сохранять прогресс интервалов между сессиями.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              setQueue(initialCards);
              setCurrentIndex(0);
              setReviewedCount(0);
              setIsRevealed(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Ещё раз</span>
          </Button>
          <Link
            href="/learn"
            className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-[#F8FAFC] transition-colors hover:bg-[#DC3D26]"
          >
            К курсу
          </Link>
        </div>
      </div>
    );
  }

  const ratingButtons: Array<{
    grade: SrsRatingGrade;
    label: string;
    styleClass: string;
  }> = [
    {
      grade: 1,
      label: 'Снова',
      styleClass:
        'border-primary/60 bg-primary/15 text-primary hover:bg-primary/25',
    },
    {
      grade: 2,
      label: 'Трудно',
      styleClass:
        'border-border bg-secondary text-[#F8FAFC] hover:border-[#41578E]',
    },
    {
      grade: 3,
      label: 'Хорошо',
      styleClass:
        'border-[#F8FAFC] bg-[#F8FAFC] text-[#0B132B] hover:bg-[#E2E8F0]',
    },
    {
      grade: 4,
      label: 'Легко',
      styleClass:
        'border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <LessonProgressBar
          current={currentIndex}
          total={queue.length}
          className="flex-1"
        />
        <span className="shrink-0 text-xs font-semibold tabular-nums text-[#CBD5E1]">
          {currentIndex + 1}/{queue.length}
        </span>
      </div>

      {/* Main Flashcard */}
      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#CBD5E1]">
            {currentCard.part_of_speech ?? 'слово'}
          </span>
          <AudioPlayerButton
            textLez={currentCard.lemma_lez}
            transcriptionRu={currentCard.transcription_ru}
            audioPath={currentCard.audio_path}
            audioStatus={currentCard.audio_status}
          />
        </div>

        <div className="space-y-2 py-6 text-center">
          <h2 className="text-balance text-3xl font-bold leading-tight text-[#F8FAFC]">
            {currentCard.lemma_lez}
          </h2>
          {currentCard.transcription_ru && (
            <p className="text-xs text-[#CBD5E1]">
              [{currentCard.transcription_ru}]
            </p>
          )}
        </div>

        {!isRevealed ? (
          <Button
            type="button"
            variant="cloud"
            size="lg"
            className="w-full"
            onClick={() => setIsRevealed(true)}
          >
            <Eye className="h-4 w-4" />
            <span>Показать перевод</span>
          </Button>
        ) : (
          <div className="space-y-5 border-t border-border pt-5">
            <div className="space-y-1.5 text-center">
              <p className="text-lg font-bold text-[#F8FAFC]">
                {currentCard.translation_ru}
              </p>
              {currentCard.grammar_notes_ru && (
                <p className="text-xs leading-relaxed text-[#CBD5E1]">
                  {currentCard.grammar_notes_ru}
                </p>
              )}
            </div>

            {currentCard.example_lez && (
              <div className="rounded-xl border border-border bg-background p-4 text-xs leading-relaxed">
                <p className="font-semibold text-[#F8FAFC]">
                  {currentCard.example_lez}
                </p>
                {currentCard.example_ru && (
                  <p className="mt-1 text-[#CBD5E1]">
                    {currentCard.example_ru}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {ratingButtons.map((btn) => (
                <button
                  key={btn.grade}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleRate(btn.grade)}
                  className={cn(
                    'flex min-h-[56px] w-full flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-center transition-colors disabled:opacity-50',
                    btn.styleClass
                  )}
                >
                  <span className="text-xs font-semibold">{btn.label}</span>
                  <span className="mt-0.5 text-[10px] opacity-85">
                    {intervalPreviews[btn.grade]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
