'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Check,
  Heart,
  Lightbulb,
  X,
} from 'lucide-react';
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
  const [hearts, setHearts] = useState(5);

  // Per-exercise state
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
      setHearts((h) => Math.max(1, h - 1));
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
      } else {
        setHearts((h) => Math.max(1, h - 1));
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
      } else {
        setHearts((h) => Math.max(1, h - 1));
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
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col justify-between">
      {/* Top Bar: X + Chunky Glossy Progress Bar + Hearts */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            aria-label={t('exitToMap')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-6 w-6 stroke-[2.5]" />
          </Link>

          <LessonProgressBar
            current={checkResult !== null ? currentIndex + 1 : currentIndex}
            total={totalExercises}
            className="flex-1"
          />

          <div className="flex shrink-0 items-center gap-1 text-sm font-black text-destructive">
            <Heart className="h-5 w-5 fill-destructive" />
            <span>{hearts}</span>
          </div>
        </div>

        {/* Prompt Header + Theory Toggle */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-black leading-tight text-foreground">
              {currentExercise.prompt_ru}
            </h1>

            {lesson.grammar_tip_ru && (
              <button
                type="button"
                onClick={() => setShowGrammarTip((v) => !v)}
                title="Показать подсказку к уроку"
                className={cn(
                  'flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 px-3 text-xs font-extrabold uppercase tracking-wider transition-all active:translate-y-[1px]',
                  showGrammarTip
                    ? 'border-[#CC9F00] bg-[#FFC800] text-primary-foreground'
                    : 'border-border bg-card text-[#FFC800]'
                )}
              >
                <Lightbulb className="h-4 w-4 stroke-[2.5]" />
                <span>Подсказка</span>
              </button>
            )}
          </div>

          {showGrammarTip && lesson.grammar_tip_ru && (
            <div className="rounded-2xl border-2 border-b-4 border-border bg-card p-4 text-sm font-bold leading-relaxed text-secondary-foreground">
              {lesson.grammar_tip_ru}
            </div>
          )}
        </div>

        {/* Exercise Workspace directly on canvas */}
        <div className="pt-2">
          {/* 1. MULTIPLE CHOICE */}
          {currentExercise.type === 'multiple_choice' && (
            <div className="space-y-5">
              {/* Character + Speech Bubble */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#46a302] bg-primary text-lg font-black text-primary-foreground">
                  ЛӀ
                </div>
                <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-border bg-card px-4 py-3.5">
                  <span className="text-xl font-black text-foreground">
                    {currentExercise.payload.question}
                  </span>
                  <AudioPlayerButton
                    textLez={currentExercise.payload.question}
                  />
                </div>
              </div>

              {/* 3D Option Cards */}
              <div className="space-y-3">
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
                        'flex min-h-14 w-full items-center justify-between rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-base font-extrabold transition-all active:translate-y-[2px]',
                        checkResult === null &&
                          !isSelected &&
                          'border-border bg-card text-foreground hover:bg-secondary',
                        checkResult === null &&
                          isSelected &&
                          'border-accent bg-accent/15 text-accent',
                        checkResult !== null &&
                          isCorrectOption &&
                          'border-primary bg-primary/20 text-primary',
                        checkResult === 'wrong' &&
                          isSelected &&
                          !isCorrectOption &&
                          'border-destructive bg-destructive/20 text-destructive'
                      )}
                    >
                      <span>{option}</span>
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-black',
                          isSelected
                            ? 'border-accent text-accent'
                            : 'border-border text-muted-foreground'
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
              <p className="text-sm font-bold text-muted-foreground">
                {t('matchingInstruction')}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Left column: Lezgi */}
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
                          'flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-b-4 px-3 py-2.5 text-center text-base font-black transition-all active:translate-y-[2px]',
                          isMatched &&
                            'border-border/40 bg-card/30 text-muted-foreground/40',
                          !isMatched &&
                            isSelected &&
                            'border-accent bg-accent/15 text-accent',
                          !isMatched &&
                            !isSelected &&
                            'border-border bg-card text-foreground hover:bg-secondary'
                        )}
                      >
                        {pair.left}
                      </button>
                    );
                  })}
                </div>

                {/* Right column: Russian */}
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
                          'flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-b-4 px-3 py-2.5 text-center text-sm font-extrabold transition-all active:translate-y-[2px]',
                          isMatched &&
                            'border-border/40 bg-card/30 text-muted-foreground/40',
                          isMismatch &&
                            'border-destructive bg-destructive/20 text-destructive',
                          !isMatched &&
                            !isMismatch &&
                            'border-border bg-card text-foreground hover:bg-secondary'
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
                className="h-14 text-lg font-extrabold"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />

              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground">
                  {t('palochkaHelper')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {LEZGI_HELPER_KEYS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      disabled={checkResult !== null}
                      onClick={() => setTextAnswer((prev) => `${prev}${char}`)}
                      className="rounded-xl border-2 border-b-4 border-border bg-card px-3.5 py-2 text-sm font-black text-foreground transition-all hover:border-accent active:translate-y-[2px] disabled:opacity-50"
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

      {/* Bottom Action Sheet */}
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
          <div
            className={cn(
              '-mx-4 -mb-4 space-y-4 rounded-t-3xl border-t-2 p-5',
              checkResult === 'correct'
                ? 'border-primary/40 bg-[#182B19]'
                : 'border-destructive/40 bg-[#2C161B]'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground',
                    checkResult === 'correct' ? 'bg-primary' : 'bg-destructive'
                  )}
                >
                  {checkResult === 'correct' ? (
                    <Check className="h-6 w-6 stroke-[3]" />
                  ) : (
                    <X className="h-6 w-6 stroke-[3]" />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      'text-lg font-black',
                      checkResult === 'correct'
                        ? 'text-primary'
                        : 'text-destructive'
                    )}
                  >
                    {checkResult === 'correct'
                      ? t('correctHeader')
                      : t('wrongHeader')}
                  </p>
                  {checkResult === 'wrong' && correctReferenceText && (
                    <p className="text-sm font-bold text-foreground">
                      {t('correctAnswerLabel')}{' '}
                      <span className="font-black text-primary">
                        {correctReferenceText}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <ReportMistakeTrigger
              entityType="exercise"
              entityId={currentExercise.id}
            />

            <Button
              type="button"
              size="lg"
              variant={checkResult === 'correct' ? 'default' : 'destructive'}
              className="w-full"
              disabled={isPending}
              onClick={handleNextOrFinish}
            >
              {isPending
                ? 'СОХРАНЕНИЕ...'
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
