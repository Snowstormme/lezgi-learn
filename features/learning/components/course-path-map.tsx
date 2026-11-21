import { Fragment } from 'react';
import { Check, Flag, Lock, Star, Trophy } from 'lucide-react';
import {
  buildCoursePathItems,
  buildRoadSegments,
  getMapHeight,
  getMountainDecor,
  LABEL_GAP,
  LABEL_WIDTH,
  MAP_WIDTH,
} from '@/features/learning/course-path';
import type { LessonSummary } from '@/features/learning/queries';
import { Link } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

function ChestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-12 -12 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="-9"
        y="-5"
        width="18"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line
        x1="-9"
        y1="-0.5"
        x2="9"
        y2="-0.5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <rect x="-2" y="-2.5" width="4" height="5" rx="0.8" fill="currentColor" />
    </svg>
  );
}

interface CoursePathMapProps {
  lessons: LessonSummary[];
}

export function CoursePathMap({ lessons }: CoursePathMapProps) {
  const firstIncompleteIndex = lessons.findIndex(
    (l) => l.is_unlocked && !l.is_completed
  );
  const activeLessonIndex =
    firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;

  const items = buildCoursePathItems(lessons);
  const segments = buildRoadSegments(items);
  const mountains = getMountainDecor(items);
  const height = getMapHeight(items);

  if (items.length === 0) {
    return null;
  }

  const darkSegments = segments.filter((s) => !s.lit);
  const litSegments = segments.filter((s) => s.lit);

  return (
    <div
      className="relative mx-auto"
      style={{ width: MAP_WIDTH, height }}
    >
      {/* Background Mountain Decor & Winding Mountain Road */}
      <svg
        className="pointer-events-none absolute inset-0"
        width={MAP_WIDTH}
        height={height}
        viewBox={`0 0 ${MAP_WIDTH} ${height}`}
        aria-hidden="true"
      >
        {mountains.map((m) => (
          <g
            key={m.key}
            transform={`translate(${m.x}, ${m.y})`}
            opacity={0.45}
          >
            <polygon
              points="0,30 16,2 32,30"
              fill="#16213E"
              stroke="#263859"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <polygon
              points="20,30 32,11 44,30"
              fill="#111A33"
              stroke="#263859"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* Upcoming dark road segments first */}
        {darkSegments.map((seg) => (
          <g key={seg.key}>
            <path
              d={seg.d}
              fill="none"
              stroke="#1D2B4D"
              strokeWidth={26}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke="#111A33"
              strokeWidth={20}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke="#263859"
              strokeWidth={2.5}
              strokeDasharray="7 7"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Completed lit Cloud White road segments */}
        {litSegments.map((seg) => (
          <g key={seg.key}>
            <path
              d={seg.d}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={26}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke="#F8FAFC"
              strokeWidth={20}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke="#F04E37"
              strokeWidth={2.5}
              strokeDasharray="7 7"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      {/* Path Nodes & Sibling Labels */}
      {items.map((item) => {
        const labelStyle =
          item.labelSide === 'right'
            ? {
                left: item.cx + LABEL_GAP,
                top: item.cy,
                width: LABEL_WIDTH,
              }
            : {
                right: MAP_WIDTH - item.cx + LABEL_GAP,
                top: item.cy,
                width: LABEL_WIDTH,
              };

        const labelAlignClass =
          item.labelSide === 'right' ? 'text-left' : 'text-right';

        if (item.kind === 'lesson' && item.lessonIdx !== null) {
          const lesson = lessons[item.lessonIdx];
          if (!lesson) return null;

          const isExam = lesson.slug.includes('exam');
          const isLocked = !lesson.is_unlocked;
          const isCurrent = !isLocked && item.lessonIdx === activeLessonIndex;
          const isCompleted = lesson.is_completed;

          const circleClasses = cn(
            'relative flex h-[74px] w-[74px] items-center justify-center border-2 border-b-[6px] pt-[2px] transition-[transform,colors,filter] duration-75',
            isExam ? 'rounded-3xl' : 'rounded-full',
            isLocked &&
              (isExam
                ? 'cursor-not-allowed border-[#263859] bg-[#16213E] text-[#FFC800]/65'
                : 'cursor-not-allowed border-[#1D2B4D] bg-[#111A33] text-[#64748B]'),
            !isLocked && 'active:translate-y-[4px]',
            !isLocked &&
              isCompleted &&
              'border-[#CBD5E1] bg-[#F8FAFC] text-primary hover:bg-white',
            !isLocked &&
              !isCompleted &&
              isCurrent &&
              'border-[#B92B1C] bg-primary text-[#F8FAFC] hover:brightness-105',
            !isLocked &&
              !isCompleted &&
              !isCurrent &&
              'border-border bg-card text-[#CBD5E1] hover:border-[#F8FAFC]/60 hover:text-[#F8FAFC]'
          );

          const nodeInner = (
            <>
              {isExam ? (
                <Trophy className="h-7 w-7 stroke-[2.5]" />
              ) : (
                <Star className="h-7 w-7 stroke-[2.5]" />
              )}
              {isCompleted && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary">
                  <Check className="h-3.5 w-3.5 stroke-[3.5] text-[#F8FAFC]" />
                </span>
              )}
              {isLocked && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1D2B4D] bg-background">
                  <Lock className="h-3 w-3 text-[#94A3B8]" />
                </span>
              )}
            </>
          );

          const labelTitle = isExam
            ? 'Экзамен раздела'
            : `${lesson.order_index}. ${lesson.title_ru.split(':')[0]}`;

          const labelContent = (
            <>
              <p
                className={cn(
                  'text-balance text-xs font-extrabold leading-snug',
                  isExam && 'uppercase tracking-wider',
                  isCurrent
                    ? 'text-[#F8FAFC]'
                    : isCompleted
                      ? 'text-primary'
                      : isExam
                        ? 'text-[#FFC800]/80'
                        : 'text-[#64748B]'
                )}
              >
                {labelTitle}
              </p>
              {isExam && !isCompleted && (
                <p className="mt-0.5 text-[11px] font-bold text-[#94A3B8]">
                  Итоговый тест модуля
                </p>
              )}
              {lesson.best_score !== null && (
                <span className="mt-1 inline-block text-[11px] font-extrabold text-primary">
                  ★ {lesson.best_score}%
                </span>
              )}
            </>
          );

          return (
            <Fragment key={item.key}>
              <div
                style={{ left: item.cx, top: item.cy }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={cn(
                    'relative transition-all',
                    isExam ? 'rounded-3xl' : 'rounded-full',
                    isCurrent &&
                      'border-4 border-[#F8FAFC]/35 bg-background p-2'
                  )}
                >
                  {isCurrent && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 flex -translate-x-1/2 flex-col items-center">
                      <div className="rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-4 py-1.5 pt-[7px] text-xs font-extrabold uppercase tracking-wider text-primary shadow-md">
                        {isCompleted
                          ? 'Повторить'
                          : isExam
                            ? 'Экзамен'
                            : 'Начать'}
                      </div>
                      <div className="h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-[#CBD5E1]" />
                    </div>
                  )}

                  {isLocked ? (
                    <div
                      aria-disabled="true"
                      title={
                        isExam
                          ? 'Пройдите все 10 уроков модуля, чтобы открыть экзамен раздела'
                          : 'Сначала завершите предыдущий урок'
                      }
                      className={circleClasses}
                    >
                      {nodeInner}
                    </div>
                  ) : (
                    <Link
                      href={`/lesson/${lesson.slug}`}
                      className={circleClasses}
                    >
                      {nodeInner}
                    </Link>
                  )}
                </div>
              </div>

              {isLocked ? (
                <div
                  style={labelStyle}
                  className={cn(
                    'absolute -translate-y-1/2',
                    labelAlignClass
                  )}
                >
                  {labelContent}
                </div>
              ) : (
                <Link
                  href={`/lesson/${lesson.slug}`}
                  style={labelStyle}
                  className={cn(
                    'absolute -translate-y-1/2 transition-opacity duration-75 hover:opacity-90',
                    labelAlignClass
                  )}
                >
                  {labelContent}
                </Link>
              )}
            </Fragment>
          );
        }

        if (item.kind === 'chest') {
          return (
            <Fragment key={item.key}>
              <div
                style={{ left: item.cx, top: item.cy }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={cn(
                    'flex h-[52px] w-[60px] items-center justify-center rounded-2xl border-2 border-b-[6px]',
                    item.reached
                      ? 'border-[#FFC800] bg-[#16213E] text-[#FFC800]'
                      : 'border-[#1D2B4D] bg-[#111A33] text-[#64748B]'
                  )}
                >
                  <ChestIcon className="h-7 w-7" />
                </div>
              </div>

              <div
                style={labelStyle}
                className={cn('absolute -translate-y-1/2', labelAlignClass)}
              >
                <p
                  className={cn(
                    'text-balance text-xs font-extrabold leading-snug',
                    item.reached ? 'text-[#FFC800]' : 'text-[#64748B]'
                  )}
                >
                  Сундук этапа
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-[#94A3B8]">
                  {item.reached ? 'Этап пройден' : 'Пройдите 5 уроков'}
                </p>
              </div>
            </Fragment>
          );
        }

        return (
          <Fragment key={item.key}>
            <div
              style={{ left: item.cx, top: item.cy }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className={cn(
                  'flex h-[46px] w-[54px] items-center justify-center rounded-2xl border-2 border-b-[6px] bg-[#16213E]',
                  item.reached
                    ? 'border-[#263859] text-primary'
                    : 'border-[#1D2B4D] text-[#64748B]'
                )}
              >
                <Flag className="h-5 w-5 stroke-[2.5]" />
              </div>
            </div>

            <div
              style={labelStyle}
              className={cn('absolute -translate-y-1/2', labelAlignClass)}
            >
              <p
                className={cn(
                  'text-balance text-xs font-extrabold uppercase tracking-wider leading-snug',
                  item.reached ? 'text-[#F8FAFC]' : 'text-[#64748B]'
                )}
              >
                Финиш модуля
              </p>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
