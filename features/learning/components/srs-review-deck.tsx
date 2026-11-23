'use client';

import { useState, useTransition } from 'react';
import {
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  X,
} from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import type { SrsReviewCardItem } from '@/features/learning/srs-queries';
import type { SrsRatingGrade } from '@/features/learning/fsrs';
import { reviewWordCardAction } from '@/features/learning/srs-actions';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { ConfettiBurst } from '@/components/course/ConfettiBurst';
import { LessonProgressBar } from '@/components/ui/progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SrsReviewDeckProps {
  initialCards: SrsReviewCardItem[];
  allLearnedCards: SrsReviewCardItem[];
  totalLearnedWords: number;
  completedLessonsCount: number;
  nextDueLabel: string | null;
  nextLessonSlug: string;
  isAuthenticated: boolean;
}

export function SrsReviewDeck({
  initialCards,
  allLearnedCards,
  totalLearnedWords,
  nextDueLabel,
  nextLessonSlug,
  isAuthenticated,
}: SrsReviewDeckProps) {
  const [queue, setQueue] = useState<SrsReviewCardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [hasCompletedSession, setHasCompletedSession] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentCard = queue[currentIndex];

  function handleGrade(remembered: boolean) {
    if (!currentCard || isPending) return;
    const grade: SrsRatingGrade = remembered ? 3 : 1;

    startTransition(async () => {
      const res = await reviewWordCardAction({
        wordId: currentCard.wordId,
        slug: currentCard.slug,
        grade,
        currentState: currentCard.cardState,
      });

      const updatedState = res.ok ? res.data.nextState : currentCard.cardState;

      if (!remembered) {
        // Re-queue missed card at the end of today's session so user practices it again
        setQueue((prev) => [
          ...prev,
          { ...currentCard, cardState: updatedState },
        ]);
        setMissedCount((c) => c + 1);
      } else {
        setRememberedCount((c) => c + 1);
      }

      const nextIndex = currentIndex + 1;
      const nextQueueLen = remembered ? queue.length : queue.length + 1;
      if (nextIndex >= nextQueueLen) {
        setHasCompletedSession(true);
      }

      setIsRevealed(false);
      setCurrentIndex(nextIndex);
    });
  }

  function handleStartEarlyPractice() {
    setQueue(allLearnedCards);
    setCurrentIndex(0);
    setRememberedCount(0);
    setMissedCount(0);
    setHasCompletedSession(false);
    setIsRevealed(false);
  }

  // 1. No completed lessons yet -> strict "only what you've learned" empty state
  if (totalLearnedWords === 0) {
    return (
      <Card className="border-2 border-b-[6px] border-border bg-card">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-b-4 border-border bg-secondary text-primary dark:border-[#1D2B4D] dark:bg-[#111A33]">
            <BookOpen className="h-8 w-8 stroke-[2.2]" />
          </div>
          <CardTitle className="text-lg font-extrabold text-foreground">
            Пока нет пройденных слов
          </CardTitle>
          <p className="mx-auto max-w-xs text-xs font-bold leading-relaxed text-muted-foreground">
            В повторение попадают только слова из уроков, которые вы уже прошли.
            Завершите первый урок — и здесь сразу появится ваша ежедневная
            очередь карточек!
          </p>
        </CardHeader>
        <CardContent>
          <Link
            href={`/lesson/${nextLessonSlug}`}
            className="duo-node-3d flex min-h-[52px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-6 py-3 text-center text-sm font-black uppercase tracking-wider text-[#F8FAFC] transition-all hover:brightness-105 active:translate-y-[2px] active:border-b-2"
          >
            Пройти 1-й урок →
          </Link>
        </CardContent>
      </Card>
    );
  }

  // 2. Daily queue finished (either just completed or already caught up for today)
  if (!currentCard) {
    const justFinished = hasCompletedSession && rememberedCount + missedCount > 0;

    return (
      <Card className="relative overflow-visible border-2 border-b-[6px] border-primary/60 bg-card">
        {justFinished && <ConfettiBurst />}
        <CardHeader className="space-y-2 text-center">
          <div className="animate-duo-pop mx-auto mb-1 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary text-[#F8FAFC]">
            <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
          </div>
          <CardTitle className="text-lg font-extrabold text-foreground">
            {justFinished
              ? 'Дневное повторение завершено!'
              : 'На сегодня всё повторено!'}
          </CardTitle>
          {nextDueLabel && !justFinished && (
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-extrabold text-amber-600 dark:border-[#263859] dark:bg-[#111A33] dark:text-[#FFC800]">
              <Clock className="h-3.5 w-3.5" />
              <span>Следующее повторение {nextDueLabel}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAuthenticated && (
            <div className="rounded-xl border border-border bg-secondary p-3 text-xs font-semibold text-muted-foreground dark:border-[#263859] dark:bg-[#111A33]">
              Прогресс повторения сохранён на этом устройстве. Войдите в
              аккаунт, чтобы синхронизировать его между устройствами.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="default"
              className="w-full"
              onClick={handleStartEarlyPractice}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Повторить ещё</span>
            </Button>
            <Link
              href="/learn"
              className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#F8FAFC] transition-all hover:brightness-105 active:translate-y-[2px]"
            >
              К урокам
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daily queue progress & stats header */}
      <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Brain className="h-4 w-4 text-primary" />
          <span>Пройдено слов: {totalLearnedWords}</span>
        </span>
        <span className="tabular-nums text-amber-600 dark:text-[#FFC800]">
          {currentIndex + 1} / {queue.length}
        </span>
      </div>

      <LessonProgressBar current={currentIndex} total={queue.length} />

      {/* Interactive Flashcard — spacious full-focus card */}
      <Card className="flex min-h-[440px] flex-col justify-between border-2 border-b-[6px] border-border bg-card">
        <CardHeader className="flex flex-1 flex-col justify-between space-y-4 pb-4">
          <div className="flex items-center justify-end">
            <AudioPlayerButton
              textLez={currentCard.lemma_lez}
              transcriptionRu={currentCard.transcription_ru}
              audioPath={currentCard.audio_path}
              audioStatus={currentCard.audio_status}
            />
          </div>

          <div className="my-auto py-10 text-center">
            <p className="text-4xl font-black tracking-tight text-foreground">
              {currentCard.lemma_lez}
            </p>
            {currentCard.transcription_ru && (
              <p className="mt-2.5 text-sm font-bold text-muted-foreground">
                [{currentCard.transcription_ru}]
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          {!isRevealed ? (
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              className="duo-card-3d flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-border bg-secondary px-6 py-3.5 text-sm font-black uppercase tracking-wider text-foreground hover:bg-secondary/80 dark:border-[#CBD5E1] dark:bg-[#F8FAFC] dark:text-[#0B132B] dark:hover:bg-white"
            >
              <Eye className="h-5 w-5 stroke-[2.5]" />
              <span>Показать перевод</span>
            </button>
          ) : (
            <div className="animate-duo-popover space-y-5">
              {/* Revealed Answer Panel */}
              <div className="space-y-2.5 rounded-2xl border-2 border-border bg-secondary p-5 text-center dark:border-[#263859] dark:bg-[#111A33]">
                <p className="text-2xl font-black text-primary dark:text-[#FFC800]">
                  {currentCard.translation_ru}
                </p>
                {currentCard.example_lez && (
                  <div className="border-t border-border/80 pt-3 text-sm dark:border-[#263859]/80">
                    <p className="font-extrabold text-foreground">
                      «{currentCard.example_lez}»
                    </p>
                    {currentCard.example_ru && (
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {currentCard.example_ru}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Simple 2-button grading: Didn't remember / Remembered */}
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(false)}
                  className="duo-card-3d flex min-h-[60px] cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary/15 px-3 py-3 text-sm font-black uppercase tracking-wider text-primary transition-all hover:bg-primary/25 disabled:opacity-50"
                >
                  <X className="h-4 w-4 stroke-[3]" />
                  <span>Не помню</span>
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(true)}
                  className="duo-card-3d flex min-h-[60px] cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-emerald-600 bg-emerald-500 px-3 py-3 text-sm font-black uppercase tracking-wider text-[#0B132B] transition-all hover:brightness-105 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Помню</span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
