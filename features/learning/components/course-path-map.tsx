'use client';

import { Fragment, useState, useTransition } from 'react';
import { Check, Flag, Lock, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import {
  buildCoursePathItems,
  buildRoadSegments,
  getMapHeight,
  getMountainDecor,
  LABEL_GAP,
  LABEL_WIDTH,
  MAP_WIDTH,
  type MountainDecor,
} from '@/features/learning/course-path';
import { claimMilestoneChestAction } from '@/features/learning/actions';
import type { LessonSummary } from '@/features/learning/queries';
import { Link, useRouter } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

const POPOVER_WIDTH = 272;
const POPOVER_LEFT = (MAP_WIDTH - POPOVER_WIDTH) / 2;

function AnimatedSideLandmark({ decor }: { decor: MountainDecor }) {
  const { kind, x, y } = decor;

  if (kind === 'campfire') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* 3D Stone Hearth Pedestal */}
        <rect x="-26" y="16" width="52" height="10" rx="5" fill="#1D2B4D" />
        <rect
          x="-26"
          y="13"
          width="52"
          height="9"
          rx="4.5"
          fill="#16213E"
          stroke="#263859"
          strokeWidth="1.8"
        />
        {/* Crossed Firewood Logs */}
        <path
          d="M-15 15 L13 7 M15 15 L-13 7"
          stroke="#94A3B8"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        {/* Stones ring */}
        <circle cx="-15" cy="15" r="3.5" fill="#263859" />
        <circle cx="-8" cy="17" r="3.8" fill="#3B5284" />
        <circle cx="0" cy="17.5" r="4" fill="#263859" />
        <circle cx="8" cy="17" r="3.8" fill="#3B5284" />
        <circle cx="15" cy="15" r="3.5" fill="#263859" />

        {/* Pulsing Fire Aura */}
        <circle
          cx="0"
          cy="-5"
          r="21"
          fill="#F04E37"
          className="svg-glow-pulse"
        />

        {/* Animated Multi-Layer Flame */}
        <g className="svg-flame-outer">
          <path
            d="M0 -27 C11 -17 15 -6 11 4 C7 10 -7 10 -11 4 C-15 -6 -11 -17 0 -27 Z"
            fill="#F04E37"
          />
          <path
            d="M-9 -12 C-13 -5 -12 3 -7 7 C-10 1 -9 -6 -5 -10 Z"
            fill="#B92B1C"
          />
        </g>

        <g className="svg-flame-inner">
          <path
            d="M0 -18 C6.5 -11 8.5 -3 5.5 4 C2.5 8 -2.5 8 -5.5 4 C-8.5 -3 -6.5 -11 0 -18 Z"
            fill="#FFC800"
          />
          <ellipse cx="0" cy="2" rx="3" ry="4.5" fill="#F8FAFC" />
        </g>

        {/* Rising Animated Embers */}
        <circle cx="-5" cy="-16" r="1.8" fill="#FFC800" className="svg-ember-1" />
        <circle cx="6" cy="-19" r="1.6" fill="#F8FAFC" className="svg-ember-2" />
        <circle cx="1" cy="-23" r="1.4" fill="#F04E37" className="svg-ember-1" />
      </g>
    );
  }

  if (kind === 'watchtower') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* 3D Pedestal */}
        <rect x="-28" y="17" width="56" height="10" rx="5" fill="#1D2B4D" />
        <rect
          x="-28"
          y="14"
          width="56"
          height="9"
          rx="4.5"
          fill="#16213E"
          stroke="#263859"
          strokeWidth="1.8"
        />

        {/* Drifting Night Cloud behind tower */}
        <g className="svg-cloud-drift">
          <path
            d="M-24 -14 H-6 A4.5 4.5 0 0 0 -6 -23 A6 6 0 0 0 -18 -24 A4.5 4.5 0 0 0 -24 -14 Z"
            fill="#1D2B4D"
            stroke="#3B5284"
            strokeWidth="1.4"
          />
        </g>

        {/* Caucasian Stone Watchtower (Къала) */}
        <polygon
          points="-14,14 -10,-20 10,-20 14,14"
          fill="#16213E"
          stroke="#3B5284"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Stone masonry horizontal lines */}
        <line x1="-11" y1="-8" x2="11" y2="-8" stroke="#263859" strokeWidth="1.4" />
        <line x1="-12.5" y1="3" x2="12.5" y2="3" stroke="#263859" strokeWidth="1.4" />

        {/* Crenellated Battlement Crown */}
        <path
          d="M-13 -20 H-8 V-25 H-3 V-20 H3 V-25 H8 V-20 H13 V-16 H-13 Z"
          fill="#263859"
          stroke="#47649E"
          strokeWidth="1.5"
        />

        {/* Pulsing Golden Beacon Window */}
        <circle
          cx="0"
          cy="-4"
          r="12"
          fill="#FFC800"
          className="svg-glow-pulse"
        />
        <rect
          x="-4"
          y="-10"
          width="8"
          height="11"
          rx="4"
          fill="#FFC800"
          stroke="#0B132B"
          strokeWidth="1.6"
        />
        <circle cx="0" cy="-5" r="2" fill="#F8FAFC" />

        {/* Adjacent Aul House */}
        <rect
          x="10"
          y="1"
          width="14"
          height="13"
          rx="2"
          fill="#111A33"
          stroke="#3B5284"
          strokeWidth="1.6"
        />
        <rect x="14.5" y="5.5" width="5" height="5" rx="1" fill="#F04E37" />

        {/* Twinkling Stars */}
        <circle
          cx="20"
          cy="-21"
          r="1.8"
          fill="#FFC800"
          className="svg-star-twinkle-1"
        />
        <circle
          cx="-21"
          cy="-4"
          r="1.5"
          fill="#F8FAFC"
          className="svg-star-twinkle-2"
        />
      </g>
    );
  }

  if (kind === 'bridge') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* River Basin */}
        <rect
          x="-30"
          y="11"
          width="60"
          height="14"
          rx="7"
          fill="#111A33"
          stroke="#263859"
          strokeWidth="1.8"
        />

        {/* Animated Flowing Samur River Waves */}
        <path
          d="M-23 16 Q-15 13 -7 16 T9 16 T23 16"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="svg-river-flow"
        />
        <path
          d="M-20 21 Q-12 18 -4 21 T12 21 T22 21"
          fill="none"
          stroke="#7DD3FC"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="svg-river-flow"
        />

        {/* Stone Arch Bridge Body */}
        <path
          d="M-27 12 V-4 L-15 -10 H15 L27 -4 V12 H16 C16 0 -16 0 -16 12 Z"
          fill="#16213E"
          stroke="#3B5284"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Bridge Keystone & Arch Trim */}
        <path
          d="M-17 11 C-17 -2 17 -2 17 11"
          fill="none"
          stroke="#47649E"
          strokeWidth="1.6"
          strokeDasharray="4 2"
        />
        {/* Parapet Rail & Lanterns */}
        <rect
          x="-20"
          y="-14"
          width="40"
          height="4.5"
          rx="2"
          fill="#263859"
          stroke="#47649E"
          strokeWidth="1.4"
        />
        <circle
          cx="-14"
          cy="-17"
          r="2.2"
          fill="#FFC800"
          className="svg-star-twinkle-1"
        />
        <circle
          cx="14"
          cy="-17"
          r="2.2"
          fill="#FFC800"
          className="svg-star-twinkle-2"
        />
      </g>
    );
  }

  if (kind === 'samovar') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* 3D Tray Base */}
        <rect x="-26" y="16" width="52" height="10" rx="5" fill="#1D2B4D" />
        <rect
          x="-26"
          y="13"
          width="52"
          height="9"
          rx="4.5"
          fill="#16213E"
          stroke="#263859"
          strokeWidth="1.8"
        />

        {/* Hospitality Tea Kettle / Samovar */}
        <path
          d="M-12 13 L-15 -4 C-15 -11 15 -11 15 -4 L12 13 Z"
          fill="#F04E37"
          stroke="#B92B1C"
          strokeWidth="2"
        />
        {/* Sumag Diamond Motif on Kettle */}
        <polygon points="0,-4 5,1 0,6 -5,1" fill="#FFC800" />
        <rect x="-2" y="-1" width="4" height="4" fill="#0B132B" />

        {/* Lid, Spout & Handle */}
        <rect
          x="-9"
          y="-13"
          width="18"
          height="4.5"
          rx="2.2"
          fill="#F8FAFC"
        />
        <circle cx="0" cy="-15" r="2.2" fill="#FFC800" />
        <path
          d="M14 2 C21 2 21 -7 24 -9"
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M-14 -2 C-21 -2 -21 8 -13 8"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="2.2"
        />

        {/* Animated Curling Steam Wisps */}
        <path
          d="M-5 -19 Q-8 -25 -3 -30"
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="svg-steam-1"
        />
        <path
          d="M5 -20 Q2 -26 7 -31"
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="2"
          strokeLinecap="round"
          className="svg-steam-2"
        />
      </g>
    );
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Pulsing & Spinning Rising Sun behind Mount Shalbuzdag */}
      <circle
        cx="11"
        cy="-14"
        r="14"
        fill="#F04E37"
        className="svg-glow-pulse"
      />
      <circle
        cx="11"
        cy="-14"
        r="11.5"
        fill="none"
        stroke="#FFC800"
        strokeWidth="1.6"
        strokeDasharray="3 3.5"
        className="svg-sun-spin"
      />
      <circle cx="11" cy="-14" r="7.5" fill="#F04E37" />
      <circle cx="11" cy="-14" r="4" fill="#FFC800" />

      {/* Twin Peaks of Mount Shalbuzdag */}
      <polygon
        points="-28,18 -7,-16 14,18"
        fill="#16213E"
        stroke="#3B5284"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Crisp Cloud White Snow Cap */}
      <polygon
        points="-7,-16 -14,-4 -9,-1 -7,-6 -3,-1 1,-4"
        fill="#F8FAFC"
      />
      <polygon
        points="2,18 16,-4 29,18"
        fill="#111A33"
        stroke="#263859"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <polygon points="16,-4 11,4 15,2 18,5 21,4" fill="#CBD5E1" />

      {/* Soaring Caucasian Eagle «Лекь» */}
      <g className="svg-eagle-soar">
        <path
          d="M-23 -21 Q-15 -27 -9 -19 Q-3 -27 5 -21 Q-3 -22 -9 -15 Q-15 -22 -23 -21 Z"
          fill="#F8FAFC"
        />
      </g>
    </g>
  );
}

function ChestIcon({
  className,
  isOpen = false,
}: {
  className?: string;
  isOpen?: boolean;
}) {
  return (
    <svg
      viewBox="-12 -12 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="-9"
        y={isOpen ? '-6.5' : '-5'}
        width="18"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line
        x1="-9"
        y1={isOpen ? '-2' : '-0.5'}
        x2="9"
        y2={isOpen ? '-2' : '-0.5'}
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <rect
        x="-2"
        y={isOpen ? '-3.5' : '-2.5'}
        width="4"
        height="5"
        rx="0.8"
        fill="currentColor"
      />
    </svg>
  );
}

interface CoursePathMapProps {
  lessons: LessonSummary[];
}

export function CoursePathMap({ lessons }: CoursePathMapProps) {
  const router = useRouter();
  const [isClaimingChest, startChestTransition] = useTransition();

  const firstIncompleteIndex = lessons.findIndex(
    (l) => l.is_unlocked && !l.is_completed
  );
  const activeLessonIndex =
    firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [claimedChests, setClaimedChests] = useState<string[]>([]);

  const items = buildCoursePathItems(lessons);
  const segments = buildRoadSegments(items);
  const mountains = getMountainDecor(items);
  const height = getMapHeight(items);

  if (items.length === 0) {
    return null;
  }

  const darkSegments = segments.filter((s) => !s.lit);
  const litSegments = segments.filter((s) => s.lit);
  const completedFirstFiveCount = lessons
    .slice(0, 5)
    .filter((l) => l.is_completed).length;

  function handleToggleNode(key: string) {
    setSelectedKey((prev) => (prev === key ? null : key));
  }

  function handleClaimChest(chestKey: string) {
    if (claimedChests.includes(chestKey)) return;
    setClaimedChests((prev) => [...prev, chestKey]);
    startChestTransition(async () => {
      await claimMilestoneChestAction({ chestKey });
      router.refresh();
    });
  }

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: MAP_WIDTH, height }}
      onClick={() => setSelectedKey(null)}
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
          <AnimatedSideLandmark key={m.key} decor={m} />
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

      {/* Path Nodes, Sibling Labels & Animated Start Popovers */}
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
        const isSelected = selectedKey === item.key;
        const showPopoverAbove = item.index >= items.length - 1;
        const arrowOffsetLeft = Math.max(
          22,
          Math.min(POPOVER_WIDTH - 22, item.cx - POPOVER_LEFT)
        );

        if (item.kind === 'lesson' && item.lessonIdx !== null) {
          const lesson = lessons[item.lessonIdx];
          if (!lesson) return null;

          const isExam = lesson.slug.includes('exam');
          const isLocked = !lesson.is_unlocked;
          const isCurrent = !isLocked && item.lessonIdx === activeLessonIndex;
          const isCompleted = lesson.is_completed;

          // Duolingo-style 3D elliptical puck (78x70) with 8px 3D base that lowers on hover & press
          const puckClasses = cn(
            'duo-node-3d relative flex h-[70px] w-[78px] cursor-pointer items-center justify-center border-2',
            isExam ? 'rounded-3xl' : 'rounded-full',
            isSelected && 'is-pressed',
            isLocked &&
              (isExam
                ? 'duo-node-locked border-[#263859] bg-[#16213E] text-[#FFC800]/75'
                : 'duo-node-locked border-[#1D2B4D] bg-[#111A33] text-[#64748B]'),
            !isLocked &&
              isCompleted &&
              'duo-node-completed border-[#CBD5E1] bg-[#F8FAFC] text-primary',
            !isLocked &&
              !isCompleted &&
              isCurrent &&
              'duo-node-active border-[#B92B1C] bg-primary text-[#F8FAFC]',
            !isLocked &&
              !isCompleted &&
              !isCurrent &&
              'duo-node-active border-[#B92B1C] bg-primary text-[#F8FAFC]'
          );

          const nodeInner = (
            <>
              {/* Subtle top crescent highlight for 3D depth */}
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-x-3 top-1.5 h-2.5 rounded-full',
                  isCompleted
                    ? 'bg-white/70'
                    : isLocked
                      ? 'bg-white/[0.04]'
                      : 'bg-white/20'
                )}
              />
              {isExam ? (
                <Trophy className="h-7 w-7 stroke-[2.5]" />
              ) : (
                <Star className="h-7 w-7 fill-current stroke-[2.2]" />
              )}
              {isCompleted && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary shadow-sm">
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
                  isCurrent || isSelected
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
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2',
                  isSelected ? 'z-30' : 'z-10'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  {isCurrent && !isSelected && (
                    <button
                      type="button"
                      onClick={() => handleToggleNode(item.key)}
                      className="animate-duo-float absolute bottom-full left-1/2 mb-2.5 flex cursor-pointer flex-col items-center"
                    >
                      <div className="rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-4 py-1.5 pt-[7px] text-xs font-extrabold uppercase tracking-wider text-primary shadow-md">
                        {isCompleted
                          ? 'Повторить'
                          : isExam
                            ? 'Экзамен'
                            : 'Начать'}
                      </div>
                      <div className="h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-[#CBD5E1]" />
                    </button>
                  )}

                  <button
                    type="button"
                    aria-expanded={isSelected}
                    aria-label={labelTitle}
                    onClick={() => handleToggleNode(item.key)}
                    className={puckClasses}
                  >
                    {nodeInner}
                  </button>
                </div>
              </div>

              <button
                type="button"
                style={labelStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleNode(item.key);
                }}
                className={cn(
                  'absolute -translate-y-1/2 cursor-pointer transition-opacity duration-75 hover:opacity-90',
                  labelAlignClass
                )}
              >
                {labelContent}
              </button>

              {/* Animated Duolingo-style Lesson Start Card Popover */}
              {isSelected && (
                <div
                  style={{
                    left: POPOVER_LEFT,
                    width: POPOVER_WIDTH,
                    top: showPopoverAbove ? item.cy - 178 : item.cy + 54,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="animate-duo-popover absolute z-30"
                >
                  {!showPopoverAbove && (
                    <div
                      style={{ left: arrowOffsetLeft }}
                      className={cn(
                        'absolute -top-[9px] h-0 w-0 -translate-x-1/2 border-x-[10px] border-b-[10px] border-x-transparent',
                        isLocked ? 'border-b-[#263859]' : 'border-b-[#B92B1C]'
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      'space-y-3 rounded-2xl border-2 border-b-[6px] p-4 shadow-2xl',
                      isLocked
                        ? 'border-[#263859] bg-[#16213E] text-[#F8FAFC]'
                        : 'border-[#B92B1C] bg-primary text-[#F8FAFC]'
                    )}
                  >
                    <div className="space-y-1">
                      <p
                        className={cn(
                          'text-[11px] font-extrabold uppercase tracking-wider',
                          isLocked ? 'text-[#94A3B8]' : 'text-[#F8FAFC]/85'
                        )}
                      >
                        {isExam
                          ? 'Итоговое испытание · Модуль 1'
                          : `Урок ${lesson.order_index} из ${lessons.length - 1}`}
                      </p>
                      <h3 className="text-balance text-sm font-extrabold leading-snug text-[#F8FAFC]">
                        {lesson.title_ru}
                      </h3>
                      {isLocked && (
                        <p className="pt-0.5 text-xs font-bold leading-snug text-[#C1D0E4]">
                          {isExam
                            ? 'Завершите все 10 уроков модуля, чтобы открыть экзамен раздела.'
                            : 'Сначала пройдите предыдущий урок, чтобы открыть этот.'}
                        </p>
                      )}
                    </div>

                    {isLocked ? (
                      <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-b-4 border-[#1D2B4D] bg-[#111A33] text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                        <Lock className="h-4 w-4 stroke-[2.5]" />
                        <span>Урок закрыт</span>
                      </div>
                    ) : (
                      <Link
                        href={`/lesson/${lesson.slug}`}
                        className="duo-node-3d duo-node-completed flex h-11 w-full items-center justify-center rounded-xl border-2 border-[#CBD5E1] bg-[#F8FAFC] pt-[1px] text-xs font-extrabold uppercase tracking-wider text-primary"
                      >
                        {isCompleted
                          ? `Повторить · ★ ${lesson.best_score ?? 100}%`
                          : isExam
                            ? 'Начать экзамен · +25 XP'
                            : 'Начать · +15 XP'}
                      </Link>
                    )}
                  </div>

                  {showPopoverAbove && (
                    <div
                      style={{ left: arrowOffsetLeft }}
                      className={cn(
                        'absolute -bottom-[9px] h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[10px] border-x-transparent',
                        isLocked ? 'border-t-[#263859]' : 'border-t-[#B92B1C]'
                      )}
                    />
                  )}
                </div>
              )}
            </Fragment>
          );
        }

        if (item.kind === 'chest') {
          const isClaimed = claimedChests.includes(item.key);

          return (
            <Fragment key={item.key}>
              <div
                style={{ left: item.cx, top: item.cy }}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2',
                  isSelected ? 'z-30' : 'z-10'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  aria-expanded={isSelected}
                  aria-label="Сундук этапа"
                  onClick={() => handleToggleNode(item.key)}
                  className={cn(
                    'duo-node-3d relative flex h-[58px] w-[68px] cursor-pointer items-center justify-center rounded-2xl border-2',
                    isSelected && 'is-pressed',
                    item.reached
                      ? 'duo-node-completed border-[#FFC800] bg-[#16213E] text-[#FFC800]'
                      : 'duo-node-locked border-[#1D2B4D] bg-[#111A33] text-[#64748B]'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-2.5 top-1 h-2 rounded-full bg-white/[0.06]"
                  />
                  <ChestIcon className="h-7 w-7" isOpen={isClaimed} />
                  {isClaimed && (
                    <span className="animate-duo-pop absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-[#FFC800] text-[#0B132B]">
                      <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                style={labelStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleNode(item.key);
                }}
                className={cn(
                  'absolute -translate-y-1/2 cursor-pointer transition-opacity duration-75 hover:opacity-90',
                  labelAlignClass
                )}
              >
                <p
                  className={cn(
                    'text-balance text-xs font-extrabold leading-snug',
                    item.reached || isSelected
                      ? 'text-[#FFC800]'
                      : 'text-[#64748B]'
                  )}
                >
                  Сундук этапа
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-[#94A3B8]">
                  {isClaimed
                    ? 'Награда получена!'
                    : item.reached
                      ? 'Открыть · +25 XP'
                      : 'Пройдите 5 уроков'}
                </p>
              </button>

              {/* Animated Chest Reward Popover Card */}
              {isSelected && (
                <div
                  style={{
                    left: POPOVER_LEFT,
                    width: POPOVER_WIDTH,
                    top: item.cy + 48,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="animate-duo-popover absolute z-30"
                >
                  <div
                    style={{ left: arrowOffsetLeft }}
                    className={cn(
                      'absolute -top-[9px] h-0 w-0 -translate-x-1/2 border-x-[10px] border-b-[10px] border-x-transparent',
                      item.reached
                        ? 'border-b-[#FFC800]'
                        : 'border-b-[#263859]'
                    )}
                  />

                  <div
                    className={cn(
                      'space-y-3 rounded-2xl border-2 border-b-[6px] p-4 shadow-2xl',
                      item.reached
                        ? 'border-[#FFC800] bg-[#16213E] text-[#F8FAFC]'
                        : 'border-[#263859] bg-[#16213E] text-[#F8FAFC]'
                    )}
                  >
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FFC800]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Бонус за 5 уроков · +25 XP</span>
                      </p>
                      <h3 className="text-balance text-sm font-extrabold leading-snug text-[#F8FAFC]">
                        Сундук первого этапа
                      </h3>
                      <p className="pt-0.5 text-xs font-bold leading-snug text-[#C1D0E4]">
                        {isClaimed
                          ? 'Вы уже открыли этот сундук и получили +25 очков опыта!'
                          : item.reached
                            ? 'Отличная работа! Первые 5 уроков пройдены — заберите заслуженный бонус опыта.'
                            : 'Завершите первые 5 уроков модуля, чтобы разблокировать сундук с бонусным опытом.'}
                      </p>
                    </div>

                    {isClaimed ? (
                      <div className="animate-duo-pop flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#FFC800] bg-[#FFC800]/15 text-xs font-extrabold uppercase tracking-wider text-[#FFC800]">
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>+25 XP получено</span>
                      </div>
                    ) : item.reached ? (
                      <button
                        type="button"
                        disabled={isClaimingChest}
                        onClick={() => handleClaimChest(item.key)}
                        className="duo-node-3d duo-node-completed flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#CBD5E1] bg-[#FFC800] pt-[1px] text-xs font-extrabold uppercase tracking-wider text-[#0B132B]"
                      >
                        <Zap className="h-4 w-4 fill-[#0B132B] text-[#0B132B]" />
                        <span>
                          {isClaimingChest
                            ? 'Открываем...'
                            : 'Открыть сундук · +25 XP'}
                        </span>
                      </button>
                    ) : (
                      <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-b-4 border-[#1D2B4D] bg-[#111A33] text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                        <Lock className="h-4 w-4 stroke-[2.5]" />
                        <span>
                          Пройдено {completedFirstFiveCount} из 5 уроков
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  'duo-node-3d duo-node-locked flex h-[48px] w-[56px] items-center justify-center rounded-2xl border-2 bg-[#16213E]',
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
