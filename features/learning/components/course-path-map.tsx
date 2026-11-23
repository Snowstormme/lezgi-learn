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

const SKY_STARS: Array<[number, number, number, string, string]> = [
  [26, 48, 1.3, '#F8FAFC', '0s'],
  [308, 72, 1.5, '#FFC800', '0.9s'],
  [54, 190, 1.1, '#F8FAFC', '1.7s'],
  [292, 275, 1.4, '#F8FAFC', '0.4s'],
  [24, 385, 1.2, '#FFC800', '2.1s'],
  [314, 465, 1.5, '#F8FAFC', '1.1s'],
  [38, 610, 1.3, '#F8FAFC', '2.6s'],
  [298, 705, 1.2, '#FFC800', '0.7s'],
  [28, 860, 1.4, '#F8FAFC', '1.4s'],
  [312, 955, 1.2, '#F8FAFC', '2.9s'],
  [44, 1110, 1.5, '#FFC800', '0.3s'],
  [304, 1230, 1.3, '#F8FAFC', '1.9s'],
  [30, 1380, 1.2, '#F8FAFC', '2.3s'],
  [308, 1490, 1.4, '#FFC800', '1.0s'],
];

function SkyBackdrop({ height, night }: { height: number; night: boolean }) {
  return (
    <g aria-hidden="true">
      {/* Subtle distant Caucasus mountain ridge silhouettes */}
      <path
        d={`M -32 280 L 42 190 L 122 245 L 222 155 L 315 235 L 368 185 L 368 380 L -32 380 Z`}
        fill={night ? '#0E1838' : '#DBE5F2'}
        opacity={night ? 0.45 : 0.65}
      />
      <path
        d={`M -32 ${Math.round(height * 0.62)} L 68 ${Math.round(height * 0.56)} L 160 ${Math.round(height * 0.6)} L 258 ${Math.round(height * 0.54)} L 368 ${Math.round(height * 0.59)} L 368 ${height} L -32 ${height} Z`}
        fill={night ? '#0E1838' : '#DBE5F2'}
        opacity={night ? 0.4 : 0.55}
      />
      {/* Delicate twinkling stars along the night sky */}
      {night &&
        SKY_STARS.filter(([, sy]) => sy < height - 20).map(
          ([sx, sy, sr, fill, delay], idx) => (
            <circle
              key={idx}
              cx={sx}
              cy={sy}
              r={sr}
              fill={fill}
              className="duo-sky-twinkle"
              style={{ animationDelay: delay }}
            />
          )
        )}
    </g>
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
        <SkyBackdrop height={height} night={isNight} />

        {mountains.map((m) => (
          <PathDecor key={m.key} decor={m} time={time} />
        ))}

        {/* Upcoming road segments first */}
        {darkSegments.map((seg) => (
          <g key={seg.key}>
            <path
              d={seg.d}
              fill="none"
              stroke={isNight ? '#1D2B4D' : '#CBD5E1'}
              strokeWidth={26}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke={isNight ? '#111A33' : '#E2E8F0'}
              strokeWidth={20}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke={isNight ? '#263859' : '#94A3B8'}
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
              stroke={isNight ? '#CBD5E1' : '#94A3B8'}
              strokeWidth={26}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke="#FFFFFF"
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
                ? 'duo-node-locked border-border bg-secondary text-amber-600 dark:border-[#263859] dark:bg-[#16213E] dark:text-[#FFC800]/75'
                : 'duo-node-locked border-border bg-secondary text-muted-foreground dark:border-[#1D2B4D] dark:bg-[#111A33] dark:text-[#64748B]'),
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
              {/* Glossy sweeping sheen clipped strictly to the 3D oval puck */}
              <span
                aria-hidden="true"
                className={cn(
                  'duo-node-shine pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]',
                  isCompleted && 'duo-node-shine-completed',
                  isLocked && 'duo-node-shine-locked'
                )}
              />
              {/* Glossy top specular crescent for lacquered 3D depth */}
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-x-3 top-1.5 h-3 rounded-full bg-gradient-to-b',
                  isCompleted
                    ? 'from-white via-white/80 to-white/10'
                    : isLocked
                      ? 'from-white/15 to-transparent'
                      : 'from-white/55 via-white/25 to-transparent'
                )}
              />
              {isExam ? (
                <Trophy className="relative z-10 h-7 w-7 stroke-[2.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]" />
              ) : (
                <Star className="relative z-10 h-7 w-7 fill-current stroke-[2.2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
              )}
              {isCompleted && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary shadow-sm">
                  <Check className="h-3.5 w-3.5 stroke-[3.5] text-[#F8FAFC]" />
                </span>
              )}
              {isLocked && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-background dark:border-[#1D2B4D]">
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
