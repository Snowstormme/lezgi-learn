'use client';

import { Fragment, useState, useTransition } from 'react';
import {
  Check,
  Flag,
  Lock,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  buildCoursePathItems,
  buildRoadSegments,
  getMapHeight,
  getMountainDecor,
  LABEL_GAP,
  LABEL_WIDTH,
  MAP_WIDTH,
} from '@/features/learning/course-path';
import { PathDecor, type TimeOfDay } from '@/components/course/PathDecor';
import { ConfettiBurst } from '@/components/course/ConfettiBurst';
import { useTheme } from '@/components/theme/theme-provider';
import { claimMilestoneChestAction } from '@/features/learning/actions';
import type { LessonSummary } from '@/features/learning/queries';
import { Link, useRouter } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

const POPOVER_WIDTH = 272;
const POPOVER_LEFT = (MAP_WIDTH - POPOVER_WIDTH) / 2;

function ChestIcon({
  className,
  isOpen = false,
}: {
  className?: string;
  isOpen?: boolean;
}) {
  return (
    <svg
      viewBox="-14 -14 28 28"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Chest Base */}
      <rect
        x="-10"
        y="-1"
        width="20"
        height="10.5"
        rx="2.5"
        fill="#92400E"
        stroke="#451A03"
        strokeWidth="1.5"
      />
      {/* Vertical Gold Straps */}
      <rect x="-6.5" y="-1" width="2.4" height="10.5" fill="#FDE047" />
      <rect x="4.1" y="-1" width="2.4" height="10.5" fill="#FDE047" />

      {/* Chest Lid (tilted up when opened) */}
      <path
        d={
          isOpen
            ? 'M-10.5 -3.5 C-10.5 -9.5 10.5 -9.5 10.5 -3.5 Z'
            : 'M-10.5 -1 C-10.5 -7.5 10.5 -7.5 10.5 -1 Z'
        }
        fill="#B45309"
        stroke="#451A03"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Bright Gold Lid Trim */}
      <path
        d={
          isOpen
            ? 'M-6.5 -4 V-8 M4.1 -4 V-8'
            : 'M-6.5 -1.2 V-5.8 M4.1 -1.2 V-5.8'
        }
        stroke="#FEF08A"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Open Treasure Glow */}
      {isOpen && (
        <ellipse cx="0" cy="-1.5" rx="7" ry="2.2" fill="#FEF9C3" />
      )}
      {/* Center Lock Plate */}
      <rect
        x="-2.6"
        y={isOpen ? '-2.2' : '-2.8'}
        width="5.2"
        height="5.6"
        rx="1.2"
        fill="#FEF08A"
        stroke="#451A03"
        strokeWidth="1.3"
      />
      <circle
        cx="0"
        cy={isOpen ? '0.6' : '0'}
        r="1"
        fill="#451A03"
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

  const { theme } = useTheme();
  const isNight = theme === 'dark';
  const time: TimeOfDay = isNight ? 'night' : 'day';
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [claimedChests, setClaimedChests] = useState<string[]>([]);
  const [burstChestKey, setBurstChestKey] = useState<string | null>(null);

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
    setBurstChestKey(chestKey);
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
        overflow="visible"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {mountains.map((m) => (
          <PathDecor key={m.key} decor={m} time={time} />
        ))}

        {/* Upcoming 3D cobblestone mountain trail segments */}
        {darkSegments.map((seg) => {
          const shadowCol = isNight
            ? 'rgba(2, 6, 23, 0.62)'
            : 'rgba(15, 23, 42, 0.15)';
          const cliffWall = isNight ? '#0B1328' : '#94A3B8';
          const cliffJoint = isNight ? '#1E2F54' : '#CBD5E1';
          const curbCol = isNight ? '#273B63' : '#CBD5E1';
          const surfaceCol = isNight ? '#162342' : '#E2E8F0';
          const stoneFill = isNight ? '#1E2F56' : '#F1F5F9';
          const stoneStroke = isNight ? '#314875' : '#94A3B8';
          const stoneLip = isNight ? '#0F182E' : '#CBD5E1';

          return (
            <g key={seg.key}>
              {/* Soft ground contact shadow */}
              <path
                d={seg.dShadow}
                fill="none"
                stroke={shadowCol}
                strokeWidth={29}
                strokeLinecap="round"
              />
              {/* 3D Extruded rock cliff wall */}
              <path
                d={seg.dWall}
                fill="none"
                stroke={cliffWall}
                strokeWidth={26.5}
                strokeLinecap="round"
              />
              <path
                d={seg.dWall}
                fill="none"
                stroke={cliffJoint}
                strokeWidth={2}
                strokeDasharray="11 6"
                strokeLinecap="round"
                opacity={0.45}
              />
              {/* Chiseled stone curb rim */}
              <path
                d={seg.d}
                fill="none"
                stroke={curbCol}
                strokeWidth={26.5}
                strokeLinecap="round"
              />
              {/* Limestone top surface */}
              <path
                d={seg.d}
                fill="none"
                stroke={surfaceCol}
                strokeWidth={20.5}
                strokeLinecap="round"
              />
              {/* Hand-laid 3D cobblestones & shoulder pebbles */}
              {seg.stones.map((st, idx) => (
                <g
                  key={idx}
                  transform={`translate(${st.x}, ${st.y}) rotate(${st.angleDeg + 90})`}
                >
                  <rect
                    x={st.side * 3.4 - 5.75}
                    y={-2.8}
                    width={11.5}
                    height={7.8}
                    rx={3.3}
                    fill={stoneLip}
                  />
                  <rect
                    x={st.side * 3.4 - 5.75}
                    y={-4}
                    width={11.5}
                    height={7.6}
                    rx={3.3}
                    fill={stoneFill}
                    stroke={stoneStroke}
                    strokeWidth={1.1}
                  />
                  <rect
                    x={-st.side * 5.2 - 3.1}
                    y={-2.5}
                    width={6.2}
                    height={5}
                    rx={2.2}
                    fill={stoneFill}
                    stroke={stoneStroke}
                    strokeWidth={0.95}
                    opacity={0.82}
                  />
                  <circle
                    cx={-st.side * 14.2}
                    cy={0}
                    r={2.2}
                    fill={cliffWall}
                    opacity={0.65}
                  />
                </g>
              ))}
            </g>
          );
        })}

        {/* Completed warm-lit 3D cobblestone mountain trail segments */}
        {litSegments.map((seg) => {
          const shadowCol = isNight
            ? 'rgba(2, 6, 23, 0.68)'
            : 'rgba(15, 23, 42, 0.2)';
          const cliffWall = isNight ? '#7C2D12' : '#9A3412';
          const curbCol = isNight ? '#FDBA74' : '#EA580C';
          const surfaceCol = isNight ? '#FFF7ED' : '#FFFBEB';

          return (
            <g key={seg.key}>
              {/* Soft ground contact shadow */}
              <path
                d={seg.dShadow}
                fill="none"
                stroke={shadowCol}
                strokeWidth={29}
                strokeLinecap="round"
              />
              {/* 3D Extruded terracotta stone cliff wall */}
              <path
                d={seg.dWall}
                fill="none"
                stroke={cliffWall}
                strokeWidth={26.5}
                strokeLinecap="round"
              />
              <path
                d={seg.dWall}
                fill="none"
                stroke="#F97316"
                strokeWidth={2}
                strokeDasharray="11 6"
                strokeLinecap="round"
                opacity={0.38}
              />
              {/* Warm golden-sandstone curb bevel */}
              <path
                d={seg.d}
                fill="none"
                stroke={curbCol}
                strokeWidth={26.5}
                strokeLinecap="round"
              />
              {/* Sunlit travertine stone surface */}
              <path
                d={seg.d}
                fill="none"
                stroke={surfaceCol}
                strokeWidth={20.5}
                strokeLinecap="round"
              />
              {/* Hand-laid warm 3D cobblestones & shoulder pebbles */}
              {seg.stones.map((st, idx) => (
                <g
                  key={idx}
                  transform={`translate(${st.x}, ${st.y}) rotate(${st.angleDeg + 90})`}
                >
                  <rect
                    x={st.side * 3.4 - 5.75}
                    y={-2.8}
                    width={11.5}
                    height={7.8}
                    rx={3.3}
                    fill="#EA580C"
                    opacity={0.45}
                  />
                  <rect
                    x={st.side * 3.4 - 5.75}
                    y={-4}
                    width={11.5}
                    height={7.6}
                    rx={3.3}
                    fill="#FFEDD5"
                    stroke="#F97316"
                    strokeWidth={1.15}
                  />
                  <rect
                    x={-st.side * 5.2 - 3.1}
                    y={-2.5}
                    width={6.2}
                    height={5}
                    rx={2.2}
                    fill="#FFEDD5"
                    stroke="#FB923C"
                    strokeWidth={0.95}
                    opacity={0.9}
                  />
                  <circle
                    cx={-st.side * 14.2}
                    cy={0}
                    r={2.2}
                    fill={cliffWall}
                    opacity={0.7}
                  />
                </g>
              ))}
            </g>
          );
        })}
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
          const numLabel = String(lesson.order_index).padStart(2, '0');

          // 4B "Beacon in the Mountains" circular 3D milestone medallions (01, 02, 03...)
          const puckClasses = cn(
            'duo-node-3d relative flex cursor-pointer flex-col items-center justify-center border-2',
            isExam ? 'h-[68px] w-[72px] rounded-3xl' : 'h-[68px] w-[68px] rounded-full',
            isLocked && !isExam && 'h-[64px] w-[64px]',
            isSelected && 'is-pressed',
            isLocked &&
              (isExam
                ? 'duo-node-locked border-[#CBD5E1] bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0] text-amber-600 dark:border-[#293D66] dark:from-[#1B294B] dark:to-[#101932] dark:text-[#FFC800]/75'
                : 'duo-node-locked border-[#CBD5E1] bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0] text-[#64748B] dark:border-[#293D66] dark:from-[#1B294B] dark:to-[#101932] dark:text-[#64748B]'),
            !isLocked &&
              isCompleted &&
              'duo-node-completed border-[#CBD5E1] bg-gradient-to-b from-white to-[#EEF2F7] text-[#0F172A]',
            !isLocked &&
              !isCompleted &&
              isCurrent &&
              'duo-node-active border-[#FDE047]/75 bg-gradient-to-b from-[#FF6650] to-[#E5412A] text-white',
            !isLocked &&
              !isCompleted &&
              !isCurrent &&
              'duo-node-active border-[#B92B1C] bg-gradient-to-b from-[#FF6650] to-[#E5412A] text-white'
          );

          const nodeInner = (
            <>
              {/* Inner precision bezel ring */}
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-[5px] border',
                  isExam ? 'rounded-[18px]' : 'rounded-full',
                  isCompleted
                    ? 'border-[1.8px] border-primary/35'
                    : isLocked
                      ? 'border-slate-300/80 dark:border-[#334155]'
                      : 'border-white/25'
                )}
              />

              {isExam ? (
                <Trophy className="relative z-10 h-7 w-7 stroke-[2.4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)]" />
              ) : isLocked ? (
                <span className="relative z-10 text-[18px] font-black leading-none tracking-tight tabular-nums">
                  {numLabel}
                </span>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center leading-none">
                  <Star
                    className={cn(
                      'mb-0.5 h-3 w-3 fill-current stroke-[2]',
                      isCompleted ? 'text-primary' : 'text-[#FDE047]'
                    )}
                  />
                  <span className="text-[19px] font-black leading-none tracking-tight tabular-nums">
                    {numLabel}
                  </span>
                </div>
              )}

              {isCompleted && (
                <span className="absolute -right-1 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
                  <Check className="h-3.5 w-3.5 stroke-[3.5] text-white" />
                </span>
              )}
              {isLocked && (
                <span className="absolute -bottom-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-background dark:border-[#293D66]">
                  <Lock className="h-3 w-3 text-muted-foreground" />
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
                    ? 'text-foreground'
                    : isCompleted
                      ? 'text-primary'
                      : isExam
                        ? 'text-amber-600 dark:text-[#FFC800]/80'
                        : 'text-muted-foreground'
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
                <div className="relative flex items-center justify-center">
                  {/* 4B Expanding Beacon Signal Waves around Current Lesson */}
                  {isCurrent && !isCompleted && (
                    <>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'duo-beacon-wave-1 pointer-events-none absolute -inset-1 border-[2.5px] border-primary',
                          isExam ? 'rounded-3xl' : 'rounded-full'
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          'duo-beacon-wave-2 pointer-events-none absolute -inset-1 border-2 border-[#FFC800]',
                          isExam ? 'rounded-3xl' : 'rounded-full'
                        )}
                      />
                    </>
                  )}

                  <div
                    className={cn(
                      isCurrent && !isCompleted && !isSelected && 'duo-beacon-breathe'
                    )}
                  >
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
                        ? 'border-border bg-card text-foreground dark:border-[#263859] dark:bg-[#16213E] dark:text-[#F8FAFC]'
                        : 'border-[#B92B1C] bg-primary text-[#F8FAFC]'
                    )}
                  >
                    <div className="space-y-1">
                      <p
                        className={cn(
                          'text-[11px] font-extrabold uppercase tracking-wider',
                          isLocked ? 'text-muted-foreground' : 'text-[#F8FAFC]/85'
                        )}
                      >
                        {isExam
                          ? 'Итоговое испытание · Модуль 1'
                          : `Урок ${lesson.order_index} из ${lessons.length - 1}`}
                      </p>
                      <h3
                        className={cn(
                          'text-balance text-sm font-extrabold leading-snug',
                          isLocked ? 'text-foreground' : 'text-[#F8FAFC]'
                        )}
                      >
                        {lesson.title_ru}
                      </h3>
                      {isLocked && (
                        <p className="pt-0.5 text-xs font-bold leading-snug text-muted-foreground">
                          {isExam
                            ? 'Завершите все 10 уроков модуля, чтобы открыть экзамен раздела.'
                            : 'Сначала пройдите предыдущий урок, чтобы открыть этот.'}
                        </p>
                      )}
                    </div>

                    {isLocked ? (
                      <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-b-4 border-border bg-secondary text-xs font-extrabold uppercase tracking-wider text-muted-foreground dark:border-[#1D2B4D] dark:bg-[#111A33] dark:text-[#64748B]">
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
                {burstChestKey === item.key && <ConfettiBurst />}
                <button
                  type="button"
                  aria-expanded={isSelected}
                  aria-label="Сундук этапа"
                  onClick={() => handleToggleNode(item.key)}
                  className={cn(
                    'duo-node-3d duo-node-gold relative flex h-[58px] w-[68px] cursor-pointer items-center justify-center rounded-2xl border-2 border-[#B45309] text-[#451A03]',
                    isSelected && 'is-pressed',
                    !item.reached && 'opacity-90'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="duo-node-shine duo-node-shine-completed pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-2.5 top-1 h-2.5 rounded-full bg-gradient-to-b from-white/80 to-transparent"
                  />
                  <ChestIcon
                    className="relative z-10 h-8 w-8 drop-shadow-[0_1px_2px_rgba(69,26,3,0.35)]"
                    isOpen={isClaimed}
                  />
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
                        ? 'border-[#FFC800] bg-card text-foreground dark:bg-[#16213E] dark:text-[#F8FAFC]'
                        : 'border-border bg-card text-foreground dark:border-[#263859] dark:bg-[#16213E] dark:text-[#F8FAFC]'
                    )}
                  >
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC800]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Бонус за 5 уроков · +25 XP</span>
                      </p>
                      <h3 className="text-balance text-sm font-extrabold leading-snug text-foreground">
                        Сундук первого этапа
                      </h3>
                      <p className="pt-0.5 text-xs font-bold leading-snug text-muted-foreground">
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
                  'duo-node-3d duo-node-locked flex h-[48px] w-[56px] items-center justify-center rounded-2xl border-2 bg-secondary dark:bg-[#16213E]',
                  item.reached
                    ? 'border-border text-primary dark:border-[#263859]'
                    : 'border-border text-muted-foreground dark:border-[#1D2B4D] dark:text-[#64748B]'
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
                  item.reached ? 'text-foreground' : 'text-muted-foreground'
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
