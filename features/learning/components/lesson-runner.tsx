'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  BookOpen,
  Check,
  Flame,
  Keyboard,
  LayoutGrid,
  Lightbulb,
  RotateCcw,
  Trophy,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/routing';
import type {
  LessonDetail,
  LessonExerciseItem,
} from '@/features/learning/queries';
import type { TeachWordItem } from '@/content/schema';
import { completeLessonAction } from '@/features/learning/actions';
import { isLezgiAnswerCorrect } from '@/lib/lezgi-utils';
import { LessonProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LezgiBrandIcon } from '@/components/ui/lezgi-brand-icon';
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

function cleanTokenForLookup(token: string): string {
  return token
    .replace(/^[—«"'(,.:;!?]+|[»"'),.:;!?]+$/g, '')
    .trim();
}

export function LessonRunner({ lesson }: LessonRunnerProps) {
  const t = useTranslations('lesson');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const exercises = lesson.exercises;
  const baseExerciseCount = exercises.length;
  const isUnitExam = lesson.slug.includes('exam');

  // Queue of exercise indices; wrong answers get pushed to the end for Duolingo-style mistake review
  const [exerciseQueue, setExerciseQueue] = useState<number[]>(() =>
    exercises.map((_, idx) => idx)
  );
  const [queueCursor, setQueueCursor] = useState(0);

  // Track which exercises' `teach_words` intro cards have already been studied
  const [dismissedTeachSlugs, setDismissedTeachSlugs] = useState<string[]>([]);

  const [showGrammarTip, setShowGrammarTip] = useState(false);
  const [firstPassCorrectCount, setFirstPassCorrectCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);

  // Per-exercise state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedBankIndices, setSelectedBankIndices] = useState<number[]>([]);
  const [useManualKeyboard, setUseManualKeyboard] = useState(false);
  const [activeHintToken, setActiveHintToken] = useState<{
    token: string;
    meaning: string;
  } | null>(null);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedLefts, setMatchedLefts] = useState<string[]>([]);
  const [mismatchRight, setMismatchRight] = useState<string | null>(null);
  const [hadMatchingMistake, setHadMatchingMistake] = useState(false);

  const [checkResult, setCheckResult] = useState<'correct' | 'wrong' | null>(
    null
  );

  const currentExerciseIndex = exerciseQueue[queueCursor] ?? 0;
  const currentExercise: LessonExerciseItem | undefined =
    exercises[currentExerciseIndex];
  const isMistakeReviewPass = queueCursor >= baseExerciseCount;

  const currentTeachWords: TeachWordItem[] =
    currentExercise?.payload.teach_words ?? [];
  const isShowingTeachCard =
    !isMistakeReviewPass &&
    currentTeachWords.length > 0 &&
    Boolean(currentExercise) &&
    !dismissedTeachSlugs.includes(currentExercise.slug);

  // Build cumulative vocabulary hint dictionary from all taught words & explicit word_hints
  const hintMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const pw of lesson.practice_words) {
      map.set(pw.lemma_lez.toLowerCase(), pw.translation_ru);
    }

    for (const ex of exercises) {
      for (const tw of ex.payload.teach_words ?? []) {
        map.set(tw.lez.toLowerCase(), tw.ru);
        for (const part of tw.lez.split(/\s+/)) {
          const cleaned = cleanTokenForLookup(part).toLowerCase();
          if (cleaned.length >= 2 && !map.has(cleaned)) {
            map.set(cleaned, `${tw.lez} — ${tw.ru}`);
          }
        }
      }
    }

    if (currentExercise?.payload.word_hints) {
      for (const [k, v] of Object.entries(currentExercise.payload.word_hints)) {
        map.set(k.toLowerCase(), v);
      }
    }

    return map;
  }, [currentExercise, exercises, lesson.practice_words]);

  const shuffledRightOptions = useMemo(() => {
    if (!currentExercise || currentExercise.type !== 'matching') return [];
    const items = currentExercise.payload.pairs.map((p) => p.right);
    return [...items].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [currentExercise]);

  if (!currentExercise) {
    return null;
  }

  const wordBankTiles =
    currentExercise.type === 'word_input'
      ? (currentExercise.payload.word_bank ?? [])
      : [];
  const isWordBankMode =
    currentExercise.type === 'word_input' &&
    wordBankTiles.length > 0 &&
    !useManualKeyboard;

  const activeAnswerText = isWordBankMode
    ? selectedBankIndices.map((i) => wordBankTiles[i] ?? '').join(' ')
    : textAnswer;

  function resetExerciseState() {
    setSelectedOption(null);
    setTextAnswer('');
    setSelectedBankIndices([]);
    setUseManualKeyboard(false);
    setActiveHintToken(null);
    setSelectedLeft(null);
    setMatchedLefts([]);
    setMismatchRight(null);
    setHadMatchingMistake(false);
    setCheckResult(null);
  }

  function handleDismissTeachCard() {
    if (!currentExercise) return;
    setDismissedTeachSlugs((prev) =>
      prev.includes(currentExercise.slug)
        ? prev
        : [...prev, currentExercise.slug]
    );
  }

  function handleToggleBankTile(tileIdx: number) {
    if (checkResult !== null) return;
    setSelectedBankIndices((prev) =>
      prev.includes(tileIdx)
        ? prev.filter((i) => i !== tileIdx)
        : [...prev, tileIdx]
    );
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
          setComboStreak((s) => s + 1);
          if (!isMistakeReviewPass) {
            setFirstPassCorrectCount((c) => c + 1);
          }
        } else {
          setComboStreak(0);
          setExerciseQueue((q) => [...q, currentExerciseIndex]);
        }
      }
    } else {
      setHadMatchingMistake(true);
      setComboStreak(0);
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
        setComboStreak((s) => s + 1);
        if (!isMistakeReviewPass) {
          setFirstPassCorrectCount((c) => c + 1);
        }
      } else {
        setComboStreak(0);
        setExerciseQueue((q) => [...q, currentExerciseIndex]);
      }
      return;
    }

    if (currentExercise.type === 'word_input') {
      if (!activeAnswerText.trim()) return;
      const isRight = isLezgiAnswerCorrect(
        activeAnswerText,
        currentExercise.payload.accepted_answers
      );
      setCheckResult(isRight ? 'correct' : 'wrong');
      if (isRight) {
        setComboStreak((s) => s + 1);
        if (!isMistakeReviewPass) {
          setFirstPassCorrectCount((c) => c + 1);
        }
      } else {
        setComboStreak(0);
        setExerciseQueue((q) => [...q, currentExerciseIndex]);
      }
    }
  }

  function handleNextOrFinish() {
    if (queueCursor + 1 < exerciseQueue.length) {
      setQueueCursor((idx) => idx + 1);
      resetExerciseState();
      return;
    }

    const finalScore = Math.round(
      (firstPassCorrectCount / baseExerciseCount) * 100
    );

    startTransition(async () => {
      const res = await completeLessonAction({
        lessonSlug: lesson.slug,
        score: finalScore,
      });

      const xp = res.ok ? res.data.xpEarned : 15;
      const saved = res.ok && res.data.savedToAccount ? '1' : '0';

      router.push(
        `/lesson/${lesson.slug}/result?score=${finalScore}&correct=${firstPassCorrectCount}&total=${baseExerciseCount}&xp=${xp}&saved=${saved}`
      );
    });
  }

  const canCheck =
    !isShowingTeachCard &&
    checkResult === null &&
    ((currentExercise.type === 'multiple_choice' &&
      selectedOption !== null) ||
      (currentExercise.type === 'word_input' &&
        activeAnswerText.trim().length > 0));

  const correctReferenceText =
    currentExercise.type === 'multiple_choice'
      ? currentExercise.payload.options[currentExercise.payload.correct_index]
      : currentExercise.type === 'word_input'
        ? currentExercise.payload.accepted_answers[0] ?? ''
        : '';

  function renderInteractiveBubbleText(text: string) {
    const tokens = text.split(/(\s+)/);

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-xl font-black leading-snug">
          {tokens.map((part, idx) => {
            if (/^\s+$/.test(part)) {
              return <span key={idx}> </span>;
            }
            const lookupKey = cleanTokenForLookup(part).toLowerCase();
            const hint =
              hintMap.get(lookupKey) ?? hintMap.get(text.trim().toLowerCase());

            if (!hint) {
              return <span key={idx}>{part}</span>;
            }

            const isActive = activeHintToken?.token === part;

            return (
              <button
                key={`${part}-${idx}`}
                type="button"
                onClick={() =>
                  setActiveHintToken((prev) =>
                    prev?.token === part ? null : { token: part, meaning: hint }
                  )
                }
                title={`Нажмите для подсказки: ${hint}`}
                className={cn(
                  'cursor-pointer border-b-2 border-dotted transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-[#0B132B]/55 text-[#0B132B] hover:border-primary hover:text-primary'
                )}
              >
                {part}
              </button>
            );
          })}
        </div>

        {activeHintToken && (
          <div className="animate-duo-pop inline-flex items-center gap-2 rounded-xl border-2 border-[#0B132B] bg-[#0B132B] px-3 py-1.5 text-xs font-bold text-[#F8FAFC]">
            <span className="text-primary">
              {cleanTokenForLookup(activeHintToken.token)}:
            </span>
            <span>{activeHintToken.meaning}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col justify-between">
      {/* Top Bar: X + Chunky Progress Bar + Combo Streak + Step Counter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Link
            href="/learn"
            aria-label={t('exitToMap')}
            className="duo-card-3d flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-border bg-card text-muted-foreground hover:text-[#F8FAFC]"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </Link>

          <LessonProgressBar
            current={
              isShowingTeachCard
                ? queueCursor
                : checkResult !== null
                  ? queueCursor + 1
                  : queueCursor
            }
            total={exerciseQueue.length}
            className="flex-1"
          />

          {comboStreak >= 2 && (
            <span
              key={`combo-${comboStreak}`}
              className="animate-duo-pop inline-flex shrink-0 items-center gap-1 rounded-xl border-2 border-[#B92B1C] bg-primary px-2.5 py-1 text-xs font-black uppercase text-[#F8FAFC]"
            >
              <Flame className="h-3.5 w-3.5 fill-[#F8FAFC] text-[#F8FAFC]" />
              <span>{comboStreak} ПОДРЯД!</span>
            </span>
          )}

          <span className="shrink-0 rounded-xl border-2 border-border bg-card px-2.5 py-1 text-xs font-black tabular-nums text-[#F8FAFC]">
            {Math.min(queueCursor + 1, exerciseQueue.length)} /{' '}
            {exerciseQueue.length}
          </span>
        </div>

        {/* TEACHING STEP: Introduce new words BEFORE testing them */}
        {isShowingTeachCard ? (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#B92B1C] bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#F8FAFC]">
                <BookOpen className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Новые слова перед практикой</span>
              </div>

              <h1 className="text-balance text-2xl font-black leading-tight text-[#F8FAFC]">
                {currentExercise.payload.teach_title_ru ??
                  'Изучите слова для следующих заданий'}
              </h1>

              {currentExercise.payload.teach_note_ru && (
                <p className="text-balance text-sm leading-relaxed text-[#C1D0E4]">
                  {currentExercise.payload.teach_note_ru}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {currentTeachWords.map((item) => (
                <div
                  key={item.lez}
                  className="duo-card-3d rounded-2xl border-2 border-b-4 border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xl font-black text-[#F8FAFC]">
                          {item.lez}
                        </span>
                        {item.transcription_ru && (
                          <span className="text-xs font-bold text-[#94A3B8]">
                            [{item.transcription_ru}]
                          </span>
                        )}
                      </div>
                      <p className="text-base font-extrabold text-primary">
                        {item.ru}
                      </p>
                    </div>

                    <AudioPlayerButton textLez={item.lez} />
                  </div>

                  {item.example_lez && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-[#F8FAFC]">
                          «{item.example_lez}»
                        </p>
                        {item.example_ru && (
                          <p className="text-[#C1D0E4]">— {item.example_ru}</p>
                        )}
                      </div>
                      <AudioPlayerButton textLez={item.example_lez} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Prompt Header + Theory Toggle */}
            <div className="space-y-3 pt-2">
              {isUnitExam && !isMistakeReviewPass && (
                <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#FFC800] bg-[#16213E] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FFC800]">
                  <Trophy className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Экзамен раздела</span>
                </div>
              )}

              {isMistakeReviewPass && (
                <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#B92B1C] bg-primary/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
                  <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Работа над ошибками</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2.5">
                <h1 className="text-balance text-2xl font-black leading-tight text-[#F8FAFC]">
                  {currentExercise.prompt_ru}
                </h1>

                {!isUnitExam &&
                  (lesson.grammar_tip_ru ||
                    currentTeachWords.length > 0) && (
                    <button
                      type="button"
                      onClick={() => setShowGrammarTip((v) => !v)}
                      title="Показать шпаргалку к уроку"
                      className={cn(
                        'duo-card-3d flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 px-3 text-xs font-black uppercase tracking-wider',
                        showGrammarTip
                          ? 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B]'
                          : 'border-border bg-card text-[#F8FAFC] hover:border-primary'
                      )}
                    >
                      <Lightbulb className="h-4 w-4 stroke-[2.5] text-primary" />
                      <span>Шпаргалка</span>
                    </button>
                  )}
              </div>

              {showGrammarTip && !isUnitExam && (
                <div className="animate-duo-popover space-y-2 rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] p-4 text-sm font-bold leading-relaxed text-[#0B132B]">
                  {lesson.grammar_tip_ru && <p>{lesson.grammar_tip_ru}</p>}
                  {currentTeachWords.length > 0 && (
                    <div className="grid grid-cols-1 gap-1.5 border-t border-[#CBD5E1] pt-2 text-xs">
                      {currentTeachWords.map((tw) => (
                        <div
                          key={tw.lez}
                          className="flex items-baseline justify-between gap-2"
                        >
                          <span className="font-black text-[#0B132B]">
                            {tw.lez}
                          </span>
                          <span className="text-[#334155]">{tw.ru}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Exercise Workspace */}
            <div className="pt-2">
              {/* 1. MULTIPLE CHOICE */}
              {currentExercise.type === 'multiple_choice' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <LezgiBrandIcon size="lg" />
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3.5 text-[#0B132B]">
                        {renderInteractiveBubbleText(
                          currentExercise.payload.question
                        )}
                        <AudioPlayerButton
                          textLez={currentExercise.payload.question}
                        />
                      </div>
                    </div>
                    <p className="pl-[68px] text-[11px] font-bold text-[#94A3B8]">
                      Нажмите на подчёркнутое слово, чтобы подсмотреть перевод
                    </p>
                  </div>

                  {/* 3D Option Cards with hover-sink and wrong-answer shake */}
                  <div className="space-y-3">
                    {currentExercise.payload.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectOption =
                        idx === currentExercise.payload.correct_index;
                      const isWrongSelected =
                        checkResult === 'wrong' &&
                        isSelected &&
                        !isCorrectOption;

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={checkResult !== null}
                          onClick={() => setSelectedOption(idx)}
                          className={cn(
                            'duo-card-3d flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-base font-extrabold',
                            isWrongSelected && 'animate-duo-shake',
                            checkResult === null &&
                              !isSelected &&
                              'border-border bg-card text-[#F8FAFC] hover:bg-secondary',
                            checkResult === null &&
                              isSelected &&
                              'border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B]',
                            checkResult !== null &&
                              isCorrectOption &&
                              'border-emerald-500 bg-emerald-500/20 text-emerald-200',
                            isWrongSelected &&
                              'border-primary bg-primary/20 text-primary'
                          )}
                        >
                          <span className="leading-snug">{option}</span>
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-black',
                              isSelected && checkResult === null
                                ? 'border-[#0B132B]/30 text-[#0B132B]'
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
                              'duo-card-3d flex min-h-[58px] w-full items-center justify-center rounded-2xl border-2 border-b-4 px-3 py-2.5 text-center text-base font-black',
                              isMatched &&
                                'border-border/40 bg-card/30 text-muted-foreground/40',
                              !isMatched &&
                                isSelected &&
                                'border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B]',
                              !isMatched &&
                                !isSelected &&
                                'border-border bg-card text-[#F8FAFC] hover:bg-secondary'
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
                        const matchedPair =
                          currentExercise.payload.pairs.find(
                            (p) =>
                              p.right === rightText &&
                              matchedLefts.includes(p.left)
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
                              'duo-card-3d flex min-h-[58px] w-full items-center justify-center rounded-2xl border-2 border-b-4 px-3 py-2.5 text-center text-sm font-extrabold',
                              isMatched &&
                                'border-border/40 bg-card/30 text-muted-foreground/40',
                              isMismatch &&
                                'animate-duo-shake border-primary bg-primary/25 text-primary',
                              !isMatched &&
                                !isMismatch &&
                                'border-border bg-card text-[#F8FAFC] hover:bg-secondary'
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

              {/* 3. WORD INPUT (Duolingo Word Bank Tiles OR Keyboard Input) */}
              {currentExercise.type === 'word_input' && (
                <div className="space-y-5">
                  {currentExercise.payload.question_ru && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <LezgiBrandIcon size="lg" />
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3.5 text-[#0B132B]">
                          {renderInteractiveBubbleText(
                            currentExercise.payload.question_ru
                          )}
                        </div>
                      </div>
                      <p className="pl-[68px] text-[11px] font-bold text-[#94A3B8]">
                        Нажмите на слово в облачке, чтобы подсмотреть подсказку
                      </p>
                    </div>
                  )}

                  {isWordBankMode ? (
                    <div className="space-y-4">
                      {/* Assembly Tray */}
                      <div
                        className={cn(
                          'min-h-[68px] rounded-2xl border-2 border-dashed border-border bg-card/60 p-3',
                          checkResult === 'wrong' && 'animate-duo-shake'
                        )}
                      >
                        {selectedBankIndices.length === 0 ? (
                          <p className="py-2 text-center text-xs font-bold text-[#94A3B8]">
                            Нажимайте на плашки со словами ниже, чтобы собрать ответ
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedBankIndices.map((tileIdx) => (
                              <button
                                key={`selected-${tileIdx}`}
                                type="button"
                                disabled={checkResult !== null}
                                onClick={() => handleToggleBankTile(tileIdx)}
                                className="animate-duo-pop duo-card-3d flex h-11 items-center justify-center rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 pt-[1px] text-base font-extrabold text-[#0B132B]"
                              >
                                {wordBankTiles[tileIdx]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Word Bank Tiles */}
                      <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                        {wordBankTiles.map((tile, tileIdx) => {
                          const isUsed =
                            selectedBankIndices.includes(tileIdx);
                          return (
                            <button
                              key={`bank-${tile}-${tileIdx}`}
                              type="button"
                              disabled={isUsed || checkResult !== null}
                              onClick={() => handleToggleBankTile(tileIdx)}
                              className={cn(
                                'duo-card-3d flex h-12 min-w-[64px] items-center justify-center rounded-xl border-2 border-b-4 px-4 pt-[1px] text-base font-extrabold',
                                isUsed
                                  ? 'border-border/30 bg-card/20 text-transparent'
                                  : 'border-border bg-card text-[#F8FAFC] hover:border-[#F8FAFC]/60'
                              )}
                            >
                              {tile}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={checkResult !== null}
                          onClick={() => {
                            setTextAnswer(activeAnswerText);
                            setUseManualKeyboard(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
                        >
                          <Keyboard className="h-3.5 w-3.5" />
                          <span>Ввести вручную с клавиатуры</span>
                        </button>
                      </div>
                    </div>
                  ) : (
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
                        className={cn(
                          'h-14 text-lg font-extrabold',
                          checkResult === 'wrong' && 'animate-duo-shake'
                        )}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-muted-foreground">
                            {t('palochkaHelper')}
                          </p>
                          {wordBankTiles.length > 0 && (
                            <button
                              type="button"
                              disabled={checkResult !== null}
                              onClick={() => setUseManualKeyboard(false)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:underline"
                            >
                              <LayoutGrid className="h-3.5 w-3.5" />
                              <span>Собрать из готовых слов</span>
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {LEZGI_HELPER_KEYS.map((char) => (
                            <button
                              key={char}
                              type="button"
                              disabled={checkResult !== null}
                              onClick={() =>
                                setTextAnswer((prev) => `${prev}${char}`)
                              }
                              className="duo-card-3d flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-b-4 border-border bg-card px-3 text-sm font-black text-[#F8FAFC] hover:border-primary disabled:opacity-50"
                            >
                              {char}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Action Sheet */}
      <div className="mt-8 pt-4">
        {isShowingTeachCard ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleDismissTeachCard}
          >
            ПОНЯТНО, К ПРАКТИКЕ
          </Button>
        ) : checkResult === null ? (
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
              'animate-duo-popover -mx-4 -mb-4 space-y-4 rounded-t-3xl border-t-2 p-5',
              checkResult === 'correct'
                ? 'border-emerald-500/40 bg-[#102926]'
                : 'border-primary/50 bg-[#2A1419]'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#F8FAFC]',
                    checkResult === 'correct' ? 'bg-emerald-500' : 'bg-primary'
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
                        ? 'text-emerald-300'
                        : 'text-primary'
                    )}
                  >
                    {checkResult === 'correct'
                      ? t('correctHeader')
                      : t('wrongHeader')}
                  </p>
                  {checkResult === 'wrong' && correctReferenceText && (
                    <p className="text-sm font-bold text-[#F8FAFC]">
                      {t('correctAnswerLabel')}{' '}
                      <span className="font-black text-emerald-300">
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
              variant={checkResult === 'correct' ? 'cloud' : 'default'}
              className="w-full"
              disabled={isPending}
              onClick={handleNextOrFinish}
            >
              {isPending
                ? 'СОХРАНЕНИЕ...'
                : queueCursor + 1 < exerciseQueue.length
                  ? t('nextExercise')
                  : t('finishLesson')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
