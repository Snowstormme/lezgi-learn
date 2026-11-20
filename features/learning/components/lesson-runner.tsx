'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/routing';
import type { LessonDetail, LessonExerciseItem } from '@/features/learning/queries';
import { completeLessonAction } from '@/features/learning/actions';
import { isLezgiAnswerCorrect } from '@/lib/lezgi-utils';
import { LessonProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ReportMistakeTrigger } from '@/features/shared/components/report-mistake-trigger';
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
  const [showGrammarTip, setShowGrammarTip] = useState(
    Boolean(lesson.grammar_tip_ru)
  );
  const [correctCount, setCorrectCount] = useState(0);

  // Per-exercise state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedLefts, setMatchedLefts] = useState<string[]>([]);
  const [mismatchRight, setMismatchRight] = useState<string | null>(null);
  const [hadMatchingMistake, setHadMatchingMistake] = useState(false);

  // Check result state: null = not checked yet, 'correct' | 'wrong'
  const [checkResult, setCheckResult] = useState<'correct' | 'wrong' | null>(
    null
  );

  const currentExercise: LessonExerciseItem | undefined =
    exercises[currentIndex];

  // Deterministic shuffle for matching right-side options based on exercise slug
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
      if (isRight) setCorrectCount((c) => c + 1);
      return;
    }

    if (currentExercise.type === 'word_input') {
      if (!textAnswer.trim()) return;
      const isRight = isLezgiAnswerCorrect(
        textAnswer,
        currentExercise.payload.accepted_answers
      );
      setCheckResult(isRight ? 'correct' : 'wrong');
      if (isRight) setCorrectCount((c) => c + 1);
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

      const xp = res.ok ? res.data.xpEarned : 10;
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
    <div className="flex flex-col space-y-5">
      {/* Top progress header */}
      <div className="flex items-center gap-3">
        <Link
          href="/learn"
          aria-label={t('exitToMap')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Link>

        <LessonProgressBar
          current={
            checkResult !== null ? currentIndex + 1 : currentIndex
          }
          total={totalExercises}
          className="flex-1"
        />

        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
          {currentIndex + 1} / {totalExercises}
        </span>
      </div>

      {/* Lesson title & collapsible grammar tip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-primary">
            Урок {lesson.order_index} • {lesson.title_ru}
          </p>
          {lesson.grammar_tip_ru && (
            <button
              type="button"
              onClick={() => setShowGrammarTip((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
            >
              <Sparkles className="h-3 w-3" />
              <span>Теория</span>
            </button>
          )}
        </div>

        {showGrammarTip && lesson.grammar_tip_ru && (
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-xs leading-relaxed text-foreground/90">
            <p className="mb-1 font-semibold text-primary">
              {t('grammarTipTitle')}
            </p>
            <p>{lesson.grammar_tip_ru}</p>
          </div>
        )}
      </div>

      {/* Active exercise card */}
      <Card className="border-border/90">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Задание {currentIndex + 1}
            </Badge>
            <Badge variant="verified">Проверено носителем</Badge>
          </div>
          <CardTitle className="text-base leading-snug">
            {currentExercise.prompt_ru}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 1. MULTIPLE CHOICE */}
          {currentExercise.type === 'multiple_choice' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-5 text-center">
                <p className="text-2xl font-bold tracking-tight text-primary">
                  {currentExercise.payload.question}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
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
                        'flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all',
                        checkResult === null &&
                          !isSelected &&
                          'border-border bg-background/60 hover:border-primary/50 hover:bg-secondary/50',
                        checkResult === null &&
                          isSelected &&
                          'border-primary bg-primary/15 text-primary ring-1 ring-primary',
                        checkResult !== null &&
                          isCorrectOption &&
                          'border-emerald-500/60 bg-emerald-500/15 text-emerald-200',
                        checkResult === 'wrong' &&
                          isSelected &&
                          !isCorrectOption &&
                          'border-destructive/60 bg-destructive/15 text-destructive'
                      )}
                    >
                      <span>{option}</span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border/80 bg-background/60 text-xs text-muted-foreground">
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
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {t('matchingInstruction')}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Left column: Lezgi */}
                <div className="space-y-2">
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
                          'flex min-h-12 w-full items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-all',
                          isMatched &&
                            'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 opacity-75',
                          !isMatched &&
                            isSelected &&
                            'border-primary bg-primary/15 text-primary ring-1 ring-primary',
                          !isMatched &&
                            !isSelected &&
                            'border-border bg-background/70 hover:border-primary/40'
                        )}
                      >
                        {pair.left}
                      </button>
                    );
                  })}
                </div>

                {/* Right column: Russian */}
                <div className="space-y-2">
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
                          'flex min-h-12 w-full items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-all',
                          isMatched &&
                            'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 opacity-75',
                          isMismatch &&
                            'border-destructive bg-destructive/20 text-destructive',
                          !isMatched &&
                            !isMismatch &&
                            'border-border bg-background/70 hover:border-primary/40 disabled:opacity-60'
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
            <div className="space-y-3">
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
                className="h-12 text-base font-medium"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />

              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground">
                  {t('palochkaHelper')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LEZGI_HELPER_KEYS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      disabled={checkResult !== null}
                      onClick={() => setTextAnswer((prev) => `${prev}${char}`)}
                      className="rounded-lg border border-border bg-secondary/70 px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/15 active:scale-95 disabled:opacity-50"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Check / Feedback Panel */}
      {checkResult === null ? (
        currentExercise.type !== 'matching' && (
          <Button
            type="button"
            size="lg"
            className="w-full font-semibold"
            disabled={!canCheck}
            onClick={handleCheckAnswer}
          >
            {t('checkAnswer')}
          </Button>
        )
      ) : (
        <div
          className={cn(
            'space-y-3 rounded-xl border p-4',
            checkResult === 'correct'
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-destructive/50 bg-destructive/10'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {checkResult === 'correct' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              )}
              <div className="space-y-1">
                <p
                  className={cn(
                    'text-sm font-bold',
                    checkResult === 'correct'
                      ? 'text-emerald-300'
                      : 'text-destructive'
                  )}
                >
                  {checkResult === 'correct'
                    ? t('correctHeader')
                    : t('wrongHeader')}
                </p>
                {checkResult === 'wrong' && correctReferenceText && (
                  <p className="text-xs text-foreground/90">
                    {t('correctAnswerLabel')}{' '}
                    <strong className="font-semibold text-emerald-300">
                      {correctReferenceText}
                    </strong>
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
            className="w-full font-semibold"
            disabled={isPending}
            onClick={handleNextOrFinish}
          >
            <BookOpenCheck className="h-4 w-4" />
            <span>
              {isPending
                ? 'Сохранение...'
                : currentIndex + 1 < totalExercises
                  ? t('nextExercise')
                  : t('finishLesson')}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
