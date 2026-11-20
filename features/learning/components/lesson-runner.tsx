'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/routing';
import type { LessonDetail, LessonExerciseItem } from '@/features/learning/queries';
import { completeLessonAction } from '@/features/learning/actions';
import { isLezgiAnswerCorrect } from '@/lib/lezgi-utils';
import { LessonProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportMistakeTrigger } from '@/features/shared/components/report-mistake-trigger';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { cn } from '@/lib/utils';

const LEZGI_HELPER_KEYS = [
  'Ӏ',
  'кӀ',
  'пӀ',
  'тӀ',
  'цӀ',
  'чӀ',
  'гъ',
  'къ',
  'хъ',
  'уь',
];

interface LessonRunnerProps {
  lesson: LessonDetail;
}

export function LessonRunner({ lesson }: LessonRunnerProps) {
  const t = useTranslations('lesson');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const exercises = lesson.exercises;
  const totalExercises = exercises.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGrammarTip, setShowGrammarTip] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedLefts, setMatchedLefts] = useState<string[]>([]);
  const [mismatchRight, setMismatchRight] = useState<string | null>(null);
  const [hadMatchingMistake, setHadMatchingMistake] = useState(false);

  const [checkResult, setCheckResult] = useState<'correct' | 'wrong' | null>(
    null
  );

  const currentExercise: LessonExerciseItem | undefined =
    exercises[currentIndex];

  const shuffledRightOptions = useMemo(() => {
    if (!currentExercise || currentExercise.type !== 'matching') return [];
    const items = currentExercise.payload.pairs.map((p) => p.right);
    return [...items].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [currentExercise]);

  if (!currentExercise) {
    return null;
  }

  function resetExerciseState() {
    setSelectedOption(null);
    setTextAnswer('');
    setSelectedLeft(null);
    setMatchedLefts([]);
    setMismatchRight(null);
    setHadMatchingMistake(false);
    setCheckResult(null);
  }

  function handleSelectRightPair(rightValue: string) {
    if (
      !currentExercise ||
      currentExercise.type !== 'matching' ||
      !selectedLeft ||
      checkResult !== null
    ) {
      return;
    }

    const expectedPair = currentExercise.payload.pairs.find(
      (p) => p.left === selectedLeft
    );

    if (expectedPair && expectedPair.right === rightValue) {
      const nextMatched = [...matchedLefts, selectedLeft];
      setMatchedLefts(nextMatched);
      setSelectedLeft(null);
      setMismatchRight(null);

      if (nextMatched.length === currentExercise.payload.pairs.length) {
        const isCleanRun = !hadMatchingMistake;
        setCheckResult('correct');
        if (isCleanRun) {
          setCorrectCount((c) => c + 1);
        }
      }
    } else {
      setHadMatchingMistake(true);
      setMismatchRight(rightValue);
      setTimeout(() => {
        setMismatchRight(null);
      }, 500);
    }
  }

  function handleCheckAnswer() {
    if (checkResult !== null || !currentExercise) return;

    if (currentExercise.type === 'multiple_choice') {
      if (selectedOption === null) return;
      const isRight =
        selectedOption === currentExercise.payload.correct_index;
      setCheckResult(isRight ? 'correct' : 'wrong');
      if (isRight) {
        setCorrectCount((c) => c + 1);
      }
      return;
    }

    if (currentExercise.type === 'word_input') {
      if (!textAnswer.trim()) return;
      const isRight = isLezgiAnswerCorrect(
        textAnswer,
        currentExercise.payload.accepted_answers
      );
      setCheckResult(isRight ? 'correct' : 'wrong');
      if (isRight) {
        setCorrectCount((c) => c + 1);
      }
    }
  }

  function handleNextOrFinish() {
    if (currentIndex + 1 < totalExercises) {
      setCurrentIndex((idx) => idx + 1);
      resetExerciseState();
      return;
    }

    const finalScore = Math.round((correctCount / totalExercises) * 100);

    startTransition(async () => {
      const res = await completeLessonAction({
        lessonSlug: lesson.slug,
        score: finalScore,
      });

      const xp = res.ok ? res.data.xpEarned : 15;
      const saved = res.ok && res.data.savedToAccount ? '1' : '0';

      router.push(
        `/lesson/${lesson.slug}/result?score=${finalScore}&correct=${correctCount}&total=${totalExercises}&xp=${xp}&saved=${saved}`
      );
    });
  }

  const canCheck =
    checkResult === null &&
    ((currentExercise.type === 'multiple_choice' &&
      selectedOption !== null) ||
      (currentExercise.type === 'word_input' &&
        textAnswer.trim().length > 0));

  const correctReferenceText =
    currentExercise.type === 'multiple_choice'
      ? currentExercise.payload.options[currentExercise.payload.correct_index]
      : currentExercise.type === 'word_input'
        ? currentExercise.payload.accepted_answers.join(' / ')
        : '';

  return (
    <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-between">
      {/* Top Bar */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/learn"
            aria-label={t('exitToMap')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#CBD5E1] transition-colors hover:bg-card hover:text-[#F8FAFC]"
          >
            <X className="h-5 w-5 stroke-[2]" />
          </Link>

          <LessonProgressBar
            current={checkResult !== null ? currentIndex + 1 : currentIndex}
            total={totalExercises}
            className="flex-1"
          />

          <span className="shrink-0 text-xs font-semibold tabular-nums text-[#CBD5E1]">
            {currentIndex + 1}/{totalExercises}
          </span>
        </div>

        {/* Prompt Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-balance text-xl font-bold leading-snug text-[#F8FAFC]">
              {currentExercise.prompt_ru}
            </h1>

            {lesson.grammar_tip_ru && (
              <button
                type="button"
                onClick={() => setShowGrammarTip((v) => !v)}
                className={cn(
                  'shrink-0 pt-0.5 text-xs font-semibold underline-offset-4 transition-colors hover:underline',
                  showGrammarTip ? 'text-primary' : 'text-[#CBD5E1]'
                )}
              >
                {showGrammarTip ? 'Скрыть' : 'Правило'}
              </button>
            )}
          </div>

          {showGrammarTip && lesson.grammar_tip_ru && (
            <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-[#CBD5E1]">
              {lesson.grammar_tip_ru}
            </div>
          )}
        </div>

        {/* Exercise Workspace */}
        <div className="space-y-5">
          {/* 1. MULTIPLE CHOICE */}
          {currentExercise.type === 'multiple_choice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] p-5 text-[#0B132B]">
                <span className="text-balance text-xl font-bold leading-snug">
                  {currentExercise.payload.question}
                </span>
                <AudioPlayerButton
                  textLez={currentExercise.payload.question}
                  lightSurface
                />
              </div>

              <div className="space-y-2.5">
                {currentExercise.payload.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOption =
                    idx === currentExercise.payload.correct_index;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={checkResult !== null}
                      onClick={() => setSelectedOption(idx)}
                      className={cn(
                        'flex min-h-[52px] w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                        checkResult === null &&
                          !isSelected &&
                          'border-border bg-card text-[#F8FAFC] hover:border-[#41578E]',
                        checkResult === null &&
                          isSelected &&
                          'border-[#F8FAFC] bg-[#F8FAFC] font-semibold text-[#0B132B]',
                        checkResult !== null &&
                          isCorrectOption &&
                          'border-emerald-400 bg-emerald-500/15 text-emerald-200',
                        checkResult === 'wrong' &&
                          isSelected &&
                          !isCorrectOption &&
                          'border-primary bg-primary/15 text-primary'
                      )}
                    >
                      <span className="leading-snug">{option}</span>
                      <span
                        className={cn(
                          'shrink-0 text-xs tabular-nums',
                          isSelected && checkResult === null
                            ? 'text-[#334155]'
                            : 'text-[#CBD5E1]'
                        )}
                      >
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. MATCHING */}
          {currentExercise.type === 'matching' && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-[#CBD5E1]">
                {t('matchingInstruction')}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2.5">
                  {currentExercise.payload.pairs.map((pair) => {
                    const isMatched = matchedLefts.includes(pair.left);
                    const isSelected = selectedLeft === pair.left;

                    return (
                      <button
                        key={pair.left}
                        type="button"
                        disabled={isMatched}
                        onClick={() => setSelectedLeft(pair.left)}
                        className={cn(
                          'flex min-h-[54px] w-full items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors',
                          isMatched &&
                            'border-border/40 bg-background text-[#CBD5E1]/35',
                          !isMatched &&
                            isSelected &&
                            'border-[#F8FAFC] bg-[#F8FAFC] text-[#0B132B]',
                          !isMatched &&
                            !isSelected &&
                            'border-border bg-card text-[#F8FAFC] hover:border-[#41578E]'
                        )}
                      >
                        {pair.left}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2.5">
                  {shuffledRightOptions.map((rightText) => {
                    const matchedPair = currentExercise.payload.pairs.find(
                      (p) =>
                        p.right === rightText && matchedLefts.includes(p.left)
                    );
                    const isMatched = Boolean(matchedPair);
                    const isMismatch = mismatchRight === rightText;

                    return (
                      <button
                        key={rightText}
                        type="button"
                        disabled={isMatched || !selectedLeft}
                        onClick={() => handleSelectRightPair(rightText)}
                        className={cn(
                          'flex min-h-[54px] w-full items-center justify-center rounded-xl border px-3 py-2.5 text-center text-xs font-medium transition-colors',
                          isMatched &&
                            'border-border/40 bg-background text-[#CBD5E1]/35',
                          isMismatch &&
                            'border-primary bg-primary/20 text-primary',
                          !isMatched &&
                            !isMismatch &&
                            'border-border bg-card text-[#F8FAFC] hover:border-[#41578E]'
                        )}
                      >
                        {rightText}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. WORD INPUT */}
          {currentExercise.type === 'word_input' && (
            <div className="space-y-4">
              <Input
                value={textAnswer}
                disabled={checkResult !== null}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canCheck) {
                    e.preventDefault();
                    handleCheckAnswer();
                  }
                }}
                placeholder={t('inputPlaceholder')}
                className="h-14 text-base font-semibold"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />

              <div className="space-y-2.5">
                <p className="text-xs text-[#CBD5E1]">{t('palochkaHelper')}</p>
                <div className="flex flex-wrap gap-2">
                  {LEZGI_HELPER_KEYS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      disabled={checkResult !== null}
                      onClick={() => setTextAnswer((prev) => `${prev}${char}`)}
                      className="flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-border bg-card px-3 text-sm font-semibold text-[#F8FAFC] transition-colors hover:border-primary disabled:opacity-45"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 pt-4">
        {checkResult === null ? (
          currentExercise.type !== 'matching' && (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={!canCheck}
              onClick={handleCheckAnswer}
            >
              {t('checkAnswer')}
            </Button>
          )
        ) : (
          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#F8FAFC]',
                  checkResult === 'correct' ? 'bg-emerald-500' : 'bg-primary'
                )}
              >
                {checkResult === 'correct' ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <X className="h-4 w-4 stroke-[2.5]" />
                )}
              </span>

              <div className="space-y-1">
                <p
                  className={cn(
                    'text-sm font-bold',
                    checkResult === 'correct'
                      ? 'text-emerald-300'
                      : 'text-primary'
                  )}
                >
                  {checkResult === 'correct'
                    ? t('correctHeader')
                    : t('wrongHeader')}
                </p>
                {checkResult === 'wrong' && correctReferenceText && (
                  <p className="text-xs leading-relaxed text-[#CBD5E1]">
                    {t('correctAnswerLabel')}{' '}
                    <span className="font-semibold text-[#F8FAFC]">
                      {correctReferenceText}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <ReportMistakeTrigger
              entityType="exercise"
              entityId={currentExercise.id}
            />

            <Button
              type="button"
              size="lg"
              variant={checkResult === 'correct' ? 'cloud' : 'default'}
              className="w-full"
              disabled={isPending}
              onClick={handleNextOrFinish}
            >
              {isPending
                ? 'Сохранение...'
                : currentIndex + 1 < totalExercises
                  ? t('nextExercise')
                  : t('finishLesson')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
