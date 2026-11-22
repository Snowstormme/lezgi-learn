'use client';

import { useMemo, useState, useTransition } from 'react';
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
import {
  getSrsIntervalPreviews,
  type SrsRatingGrade,
} from '@/features/learning/fsrs';
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
  completedLessonsCount,
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

  const intervalPreviews = useMemo(() => {
    if (!currentCard) return { 1: 'скоро', 2: '10 мин', 3: '1 д', 4: '4 д' };
    return getSrsIntervalPreviews(currentCard.cardState);
  }, [currentCard]);

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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-b-4 border-[#1D2B4D] bg-[#111A33] text-primary">
            <BookOpen className="h-8 w-8 stroke-[2.2]" />
          </div>
          <CardTitle className="text-lg font-extrabold text-[#F8FAFC]">
            Пока нет пройденных слов
          </CardTitle>
          <p className="mx-auto max-w-xs text-xs font-bold leading-relaxed text-[#C1D0E4]">
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
          <CardTitle className="text-lg font-extrabold text-[#F8FAFC]">
            {justFinished
              ? 'Дневное повторение завершено!'
              : 'На сегодня всё повторено!'}
          </CardTitle>
          <p className="text-xs font-bold text-[#CBD5E1]">
            {justFinished
              ? `Запомнили: ${rememberedCount} · Повторили снова: ${missedCount}`
              : `Изучено слов: ${totalLearnedWords} (из ${completedLessonsCount} ур.)`}
          </p>
          {nextDueLabel && !justFinished && (
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#263859] bg-[#111A33] px-3 py-1 text-[11px] font-extrabold text-[#FFC800]">
              <Clock className="h-3.5 w-3.5" />
              <span>Следующее повторение {nextDueLabel}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAuthenticated && (
            <div className="rounded-xl border border-[#263859] bg-[#111A33] p-3 text-xs font-semibold text-[#C1D0E4]">
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
        <span className="tabular-nums text-[#FFC800]">
          {currentIndex + 1} / {queue.length}
        </span>
      </div>

      <LessonProgressBar current={currentIndex} total={queue.length} />

      {/* Interactive Flashcard */}
      <Card className="min-h-64 border-2 border-b-[6px] border-border bg-card">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between">
            <span className="rounded-lg border border-[#263859] bg-[#111A33] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#CBD5E1]">
              {currentCard.part_of_speech ?? 'изученное слово'}
            </span>
            <AudioPlayerButton
              textLez={currentCard.lemma_lez}
              transcriptionRu={currentCard.transcription_ru}
              audioPath={currentCard.audio_path}
              audioStatus={currentCard.audio_status}
            />
          </div>

          <div className="py-5 text-center">
            <p className="text-3xl font-black tracking-tight text-[#F8FAFC]">
              {currentCard.lemma_lez}
            </p>
            {currentCard.transcription_ru && (
              <p className="mt-1.5 text-xs font-bold text-[#94A3B8]">
                [{currentCard.transcription_ru}]
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isRevealed ? (
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              className="duo-card-3d flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#0B132B] hover:bg-white"
            >
              <Eye className="h-4 w-4 stroke-[2.5]" />
              <span>Показать перевод</span>
            </button>
          ) : (
            <div className="animate-duo-popover space-y-4">
              {/* Revealed Answer Panel */}
              <div className="space-y-2 rounded-2xl border-2 border-[#263859] bg-[#111A33] p-4 text-center">
                <p className="text-xl font-black text-[#FFC800]">
                  {currentCard.translation_ru}
                </p>
                {currentCard.example_lez && (
                  <div className="border-t border-[#263859]/80 pt-2.5 text-xs">
                    <p className="font-extrabold text-[#F8FAFC]">
                      «{currentCard.example_lez}»
                    </p>
                    {currentCard.example_ru && (
                      <p className="mt-0.5 font-semibold text-[#94A3B8]">
                        {currentCard.example_ru}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Simple 2-button grading: Didn't remember / Remembered */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(false)}
                  className="duo-card-3d flex min-h-[64px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary/15 px-3 py-2.5 text-primary transition-all hover:bg-primary/25 disabled:opacity-50"
                >
                  <span className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider">
                    <X className="h-4 w-4 stroke-[3]" />
                    <span>Не помню</span>
                  </span>
                  <span className="text-[11px] font-bold opacity-80">
                    повторим снова
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(true)}
                  className="duo-card-3d flex min-h-[64px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-b-4 border-emerald-600 bg-emerald-500 px-3 py-2.5 text-[#0B132B] transition-all hover:brightness-105 disabled:opacity-50"
                >
                  <span className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider">
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Помню</span>
                  </span>
                  <span className="text-[11px] font-extrabold opacity-85">
                    через {intervalPreviews[3]}
                  </span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subtle, non-intrusive Spaced Repetition Retention Curve widget */}
      <div className="rounded-2xl border border-[#1E2D52] bg-[#0D1630]/80 px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
          <span className="uppercase tracking-wider text-[#94A3B8]">
            Кривая памяти · SRS
          </span>
          <span className="tabular-nums text-[#64748B]">
            Повторений: {currentCard.cardState.reps}
          </span>
        </div>

        <svg
          viewBox="0 0 320 76"
          className="h-[72px] w-full overflow-visible"
          aria-hidden="true"
        >
          {/* Subtle horizontal reference lines */}
          <line
            x1="8"
            y1="14"
            x2="312"
            y2="14"
            stroke="#1E2D52"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <line
            x1="8"
            y1="60"
            x2="312"
            y2="60"
            stroke="#1E2D52"
            strokeWidth="1"
          />

          {/* Fading curve without review (dashed muted vermillion) */}
          <path
            d="M 12 14 Q 44 54 124 58"
            fill="none"
            stroke="#F04E37"
            strokeWidth="1.6"
            strokeDasharray="4 4"
            opacity="0.55"
          />

          {/* Reinforced SRS retention curve (1d -> 4d -> 10d -> 30d) */}
          <path
            d="M 12 14 Q 36 38 66 42 L 66 14 Q 108 32 150 36 L 150 14 Q 202 27 244 30 L 244 14 Q 280 20 310 22"
            fill="none"
            stroke="#34D399"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Review checkpoint dots */}
          {[
            { x: 66, label: '1д' },
            { x: 150, label: '4д' },
            { x: 244, label: '10д' },
            { x: 306, label: '30д' },
          ].map((pt) => (
            <g key={pt.label}>
              <circle
                cx={pt.x}
                cy={pt.x === 306 ? 22 : 14}
                r="3.2"
                fill="#FFC800"
                stroke="#0D1630"
                strokeWidth="1.4"
              />
              <text
                x={pt.x}
                y="72"
                textAnchor="middle"
                fill="#64748B"
                fontSize="9.5"
                fontWeight="700"
                fontFamily="var(--font-mono), monospace"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-[#94A3B8]">
          Каждое <span className="font-extrabold text-emerald-400">«Помню»</span>{' '}
          поднимает память до 100% и увеличивает интервал, а{' '}
          <span className="font-extrabold text-primary">«Не помню»</span>{' '}
          возвращает слово сразу.
        </p>
      </div>
    </div>
  );
}
