'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Check,
  Lightbulb,
  Lock,
  MessageSquareQuote,
  NotebookText,
  Sparkles,
  X,
} from 'lucide-react';
import type { UnitWithLessons } from '@/features/learning/queries';
import { cn } from '@/lib/utils';

interface GuidebookPhrase {
  lez: string;
  ru: string;
  transcription: string;
  note?: string;
}

const UNIT_1_GUIDEBOOK_PHRASES: readonly GuidebookPhrase[] = [
  {
    lez: 'Салам алейкум, стха!',
    ru: 'Здравствуй, брат!',
    transcription: 'сала́м але́йкум, стха',
    note: 'Традиционное уважительное приветствие (ответ: «Алейкум салам!»).',
  },
  {
    lez: 'Пакаман хийирар!',
    ru: 'Доброе утро!',
    transcription: 'пакама́н хийира́р',
    note: 'Днём говорят «Нисинин хийирар», вечером — «Нянин хийирар».',
  },
  {
    lez: 'Ви кӀвалахар гьикӀ я? — Чухсагъул, хъсан я!',
    ru: 'Как твои дела? — Спасибо, хорошо!',
    transcription: 'ви кӀвалаха́р гьикӀ я? — чухсагъу́л, хъсан я',
  },
  {
    lez: 'Ви тӀвар вуж я? — Зи тӀвар Али я.',
    ru: 'Как тебя зовут? — Меня зовут Али.',
    transcription: 'ви тӀвар вуж я? — зи тӀвар Али́ я',
    note: 'Зун — я, вун — ты; зи — мой, ви — твой.',
  },
  {
    lez: 'Вун гьинай я? — Зун Дагъустандай я.',
    ru: 'Откуда ты? — Я из Дагестана.',
    transcription: 'вун гьина́й я? — зун Дагъустанда́й я',
  },
  {
    lez: 'Зун лезги чӀалал рахазва.',
    ru: 'Я говорю на лезгинском языке.',
    transcription: 'зун лезги́ чӀала́л рахазва́',
  },
  {
    lez: 'Мугьмандиз шад я! Буюр, чай хъухъ.',
    ru: 'Гостю рады! Пожалуйста, выпей чаю.',
    transcription: 'мугьманди́з шад я! бую́р, чай хъухъ',
  },
  {
    lez: 'Сагъ хьухь! Геже хийир!',
    ru: 'До свидания (будь здоров)! Спокойной ночи!',
    transcription: 'сагъ хьухь! геже́ хийи́р',
  },
] as const;

interface UpcomingModulePreview {
  orderIndex: number;
  title: string;
  description: string;
  lessonsPlanned: number;
}

const UPCOMING_MODULES: readonly UpcomingModulePreview[] = [
  {
    orderIndex: 2,
    title: 'Семья, родня и дом',
    description: 'Диде, буба, хизан, кӀвал — рассказ о близких и родном ауле.',
    lessonsPlanned: 10,
  },
  {
    orderIndex: 3,
    title: 'Числа, счёт и время',
    description: 'Числительные от 1 до 100, возраст, дни недели и время суток.',
    lessonsPlanned: 10,
  },
  {
    orderIndex: 4,
    title: 'Гостеприимство и трапеза',
    description: 'Чай, чуду, хинкал, угощение гостей и застольный этикет.',
    lessonsPlanned: 10,
  },
  {
    orderIndex: 5,
    title: 'Признаки и природа гор',
    description: 'Прилагательные, цвета, погода, реки и горные вершины.',
    lessonsPlanned: 11,
  },
] as const;

interface UnitHeaderBannerProps {
  unit: UnitWithLessons;
  allUnits: UnitWithLessons[];
}

export function UnitHeaderBanner({ unit, allUnits }: UnitHeaderBannerProps) {
  const [openModal, setOpenModal] = useState<'sections' | 'guidebook' | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenModal(null);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openModal]);

  const cleanUnitTitle = unit.title_ru.replace(/^Юнит \d+\.\s*/, '');
  const lessonsWithTips = unit.lessons.filter(
    (l) => Boolean(l.grammar_tip_ru) && !l.slug.includes('exam')
  );

  return (
    <>
      {/* Duolingo-style Unit Header Banner */}
      <div className="flex items-stretch justify-between overflow-hidden rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary text-[#F8FAFC] shadow-[0_8px_20px_-8px_rgba(240,78,55,0.5)]">
        {/* Left interactive area: opens Sections / Modules overview */}
        <button
          type="button"
          onClick={() => setOpenModal('sections')}
          className="group flex min-w-0 flex-1 flex-col items-start justify-center gap-1 px-4 py-3.5 text-left transition-colors hover:bg-black/10 active:bg-black/15"
          aria-label="Открыть разделы и модули курса"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#F8FAFC]/85">
            <ArrowLeft
              className="h-3.5 w-3.5 shrink-0 stroke-[2.8] transition-transform duration-150 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>
              Раздел 1, Модуль {unit.order_index}
            </span>
            <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-[10px] tabular-nums text-[#F8FAFC]">
              {unit.completed_count}/{unit.lessons.length}
            </span>
          </span>
          <h1 className="text-balance text-[15px] font-black leading-snug text-[#F8FAFC] sm:text-base">
            {cleanUnitTitle}
          </h1>
        </button>

        {/* Duolingo vertical divider + compact right-side Guidebook icon button */}
        <div className="flex shrink-0 items-center border-l-2 border-[#B92B1C]/60 px-3 py-3">
          <button
            type="button"
            onClick={() => setOpenModal('guidebook')}
            aria-label="Справочник модуля"
            title="Справочник модуля — фразы и подсказки"
            className="duo-card-3d flex h-11 w-11 items-center justify-center rounded-xl border-2 border-b-4 border-[#B92B1C] bg-[#D93D26] text-[#F8FAFC] transition-colors hover:bg-[#C8351F] active:translate-y-[2px] active:border-b-2"
          >
            <NotebookText className="h-5 w-5 stroke-[2.3]" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Modal 1: Course Sections & Modules Roadmap (rendered via Portal on document.body) */}
      {mounted &&
        openModal === 'sections' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setOpenModal(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-sections-title"
              className="animate-duo-popover flex max-h-[86dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-2 border-border bg-background text-foreground shadow-2xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b-2 border-border bg-card px-5 py-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    Раздел 1 · Основы (A1)
                  </p>
                  <h2
                    id="course-sections-title"
                    className="text-lg font-black tracking-tight"
                  >
                    Модули курса
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenModal(null)}
                  aria-label="Закрыть"
                  className="duo-card-3d flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto p-4 pb-6">
                {allUnits.map((u) => {
                  const total = Math.max(1, u.lessons.length);
                  const pct = Math.min(
                    100,
                    Math.round((u.completed_count / total) * 100)
                  );
                  const isDone = u.completed_count >= u.lessons.length;

                  return (
                    <div
                      key={u.slug}
                      className="rounded-2xl border-2 border-b-4 border-primary bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                            <Sparkles className="h-3 w-3" />
                            {isDone ? 'Модуль пройден' : 'Текущий модуль'}
                          </span>
                          <h3 className="mt-1.5 text-base font-black leading-snug">
                            Модуль {u.order_index}.{' '}
                            {u.title_ru.replace(/^Юнит \d+\.\s*/, '')}
                          </h3>
                        </div>
                        <span className="shrink-0 rounded-xl border border-border bg-secondary px-2.5 py-1 text-xs font-extrabold tabular-nums">
                          {u.completed_count}/{u.lessons.length}
                        </span>
                      </div>

                      {u.description_ru && (
                        <p className="mt-1.5 text-xs font-semibold leading-relaxed text-muted-foreground">
                          {u.description_ru}
                        </p>
                      )}

                      <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-border bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{
                            width: `${Math.max(pct, u.completed_count > 0 ? 10 : 0)}%`,
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenModal(null)}
                        className="duo-card-3d mt-3.5 flex h-10 w-full items-center justify-center rounded-xl border-2 border-b-4 border-[#B92B1C] bg-primary text-xs font-extrabold uppercase tracking-wider text-[#F8FAFC]"
                      >
                        {isDone ? 'Повторить модуль' : 'Продолжить обучение'}
                      </button>
                    </div>
                  );
                })}

                <div className="pt-1">
                  <p className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Следующие модули в программе
                  </p>
                  <div className="space-y-2.5">
                    {UPCOMING_MODULES.map((mod) => (
                      <div
                        key={mod.orderIndex}
                        className="flex items-start gap-3 rounded-2xl border-2 border-border bg-card/65 p-3.5 opacity-80"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-secondary text-muted-foreground">
                          <Lock className="h-4 w-4 stroke-[2.3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="truncate text-sm font-extrabold">
                              Модуль {mod.orderIndex}. {mod.title}
                            </h4>
                            <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                              Скоро
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-snug text-muted-foreground">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 2: Duolingo-style Unit Guidebook (rendered via Portal on document.body) */}
      {mounted &&
        openModal === 'guidebook' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setOpenModal(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="unit-guidebook-title"
              className="animate-duo-popover flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-2 border-border bg-background text-foreground shadow-2xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Vermillion Guidebook Header */}
              <div className="flex items-start justify-between gap-3 border-b-2 border-[#B92B1C] bg-primary px-5 py-4 text-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#F8FAFC]/30 bg-black/15">
                    <NotebookText className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#F8FAFC]/85">
                      Справочник · Модуль {unit.order_index}
                    </p>
                    <h2
                      id="unit-guidebook-title"
                      className="text-base font-black leading-snug"
                    >
                      {cleanUnitTitle}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenModal(null)}
                  aria-label="Закрыть справочник"
                  className="duo-card-3d flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#B92B1C] bg-[#D93D26] text-[#F8FAFC] hover:bg-[#C8351F]"
                >
                  <X className="h-4 w-4 stroke-[2.6]" />
                </button>
              </div>

              <div className="space-y-5 overflow-y-auto p-4 pb-6">
                {/* Key Phrases Section */}
                <section className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <MessageSquareQuote className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                      Ключевые фразы модуля
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {UNIT_1_GUIDEBOOK_PHRASES.map((phrase) => (
                      <div
                        key={phrase.lez}
                        className="rounded-2xl border-2 border-border bg-card p-3.5"
                      >
                        <p className="text-sm font-black text-foreground">
                          {phrase.lez}
                        </p>
                        <p className="mt-0.5 text-[11px] font-bold text-primary">
                          [{phrase.transcription}]
                        </p>
                        <p className="mt-1 text-xs font-bold text-muted-foreground">
                          {phrase.ru}
                        </p>
                        {phrase.note && (
                          <p className="mt-1.5 border-t border-border/70 pt-1.5 text-[11px] leading-snug text-muted-foreground">
                            {phrase.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Grammar & Cultural Tips per Lesson */}
                {lessonsWithTips.length > 0 && (
                  <section className="space-y-2.5">
                    <div className="flex items-center gap-2 px-1">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        Подсказки и грамматика по урокам
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {lessonsWithTips.map((lesson) => (
                        <div
                          key={lesson.slug}
                          className="rounded-2xl border-2 border-border bg-card p-3.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary">
                              <span>Урок {lesson.order_index}</span>
                            </span>
                            {lesson.is_completed && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3 w-3 stroke-[3]" />
                                Пройден
                              </span>
                            )}
                          </div>
                          <h4 className="mt-1 text-xs font-black text-foreground">
                            {lesson.title_ru}
                          </h4>
                          <p
                            className={cn(
                              'mt-1.5 text-xs leading-relaxed text-muted-foreground'
                            )}
                          >
                            {lesson.grammar_tip_ru}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
