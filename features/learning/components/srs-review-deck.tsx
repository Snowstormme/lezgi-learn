'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Brain,
  CheckCircle2,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import type { SrsReviewCardItem } from '@/features/learning/srs-queries';
import {
  getSrsIntervalPreviews,
  type SrsRatingGrade,
} from '@/features/learning/fsrs';
import { reviewWordCardAction } from '@/features/learning/srs-actions';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { LessonProgressBar } from '@/components/ui/progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  totalEnrolled,
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

      // If rated "Again" (1), re-queue card at the end of current session
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
      <Card className="border-primary/50 bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border-b-4 border-[#B92B1C] bg-primary text-[#F8FAFC]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-extrabold text-[#F8FAFC]">
            Повторение завершено!
          </CardTitle>
          <p className="text-xs font-bold text-[#CBD5E1]">
            Пройдено карточек: {reviewedCount}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAuthenticated && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              Войдите в аккаунт, чтобы интервалы FSRS сохранялись между сессиями.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="default"
              className="w-full"
              onClick={() => {
                setQueue(initialCards);
                setCurrentIndex(0);
                setReviewedCount(0);
                setIsRevealed(false);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Ещё круг</span>
            </Button>
            <Link
              href="/learn"
              className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#F8FAFC] transition-all active:translate-y-[2px]"
            >
              К урокам
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ratingButtons: Array<{
    grade: SrsRatingGrade;
    label: string;
    colorClass: string;
  }> = [
    {
      grade: 1,
      label: 'Снова',
      colorClass:
        'border-2 border-b-4 border-[#B92B1C] bg-primary/20 text-primary',
    },
    {
      grade: 2,
      label: 'Трудно',
      colorClass:
        'border-2 border-b-4 border-border bg-secondary text-[#F8FAFC]',
    },
    {
      grade: 3,
      label: 'Хорошо',
      colorClass:
        'border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B]',
    },
    {
      grade: 4,
      label: 'Легко',
      colorClass:
        'border-2 border-b-4 border-emerald-500/60 bg-emerald-500/15 text-emerald-300',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Progress & stats header */}
      <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Brain className="h-4 w-4 text-primary" />
          <span>Карточек в тренировке: {totalEnrolled || queue.length}</span>
        </span>
        <span className="tabular-nums">
          {currentIndex + 1} / {queue.length}
        </span>
      </div>

      <LessonProgressBar current={currentIndex} total={queue.length} />

      {/* Flashcard */}
      <Card className="min-h-64 border-border/90">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">
              {currentCard.part_of_speech ?? 'слово'}
            </span>
            <AudioPlayerButton
              textLez={currentCard.lemma_lez}
              transcriptionRu={currentCard.transcription_ru}
              audioPath={currentCard.audio_path}
              audioStatus={currentCard.audio_status}
            />
          </div>

          <div className="py-4 text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">
              {currentCard.lemma_lez}
            </CardTitle>
            {currentCard.transcription_ru && (
              <p className="mt-1 text-xs text-muted-foreground">
                [{currentCard.transcription_ru}]
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isRevealed ? (
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="w-full font-semibold"
              onClick={() => setIsRevealed(true)}
            >
              <Eye className="h-4 w-4" />
              <span>Показать перевод</span>
            </Button>
          ) : (
            <div className="space-y-4 border-t border-border/70 pt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {currentCard.translation_ru}
                </p>
                {currentCard.grammar_notes_ru && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currentCard.grammar_notes_ru}
                  </p>
                )}
              </div>

              {currentCard.example_lez && (
                <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-xs">
                  <p className="flex items-center gap-1 font-semibold text-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>«{currentCard.example_lez}»</span>
                  </p>
                  {currentCard.example_ru && (
                    <p className="mt-0.5 text-muted-foreground">
                      {currentCard.example_ru}
                    </p>
                  )}
                </div>
              )}

              {/* 4 FSRS grade buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {ratingButtons.map((btn) => (
                  <button
                    key={btn.grade}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRate(btn.grade)}
                    className={cn(
                      'flex min-h-[58px] w-full flex-col items-center justify-center rounded-2xl px-2 py-2.5 text-center transition-all active:translate-y-[2px] disabled:opacity-50',
                      btn.colorClass
                    )}
                  >
                    <span className="text-xs font-bold">{btn.label}</span>
                    <span className="mt-0.5 text-[10px] opacity-85">
                      {intervalPreviews[btn.grade]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
