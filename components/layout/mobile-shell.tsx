'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Brain,
  Check,
  Flame,
  GraduationCap,
  Languages,
  User,
  Zap,
} from 'lucide-react';
import { Link, usePathname, useRouter } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { LezgiBrandIcon } from '@/components/ui/lezgi-brand-icon';
import { ThemeToggleButton } from '@/components/theme/theme-provider';
import { cn } from '@/lib/utils';

const WEEK_DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
const DAILY_XP_GOAL = 50;
const TAB_ORDER = ['/learn', '/review', '/dictionary', '/translate'] as const;

function getTabIndex(path: string): number {
  return TAB_ORDER.findIndex(
    (tab) => path === tab || path.startsWith(`${tab}/`)
  );
}

interface MobileShellProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  displayName: string | null;
  xp?: number;
  streakDays?: number;
}

export function MobileShell({
  children,
  isAuthenticated,
  displayName,
  xp = 0,
  streakDays = 0,
}: MobileShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations('nav');
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null);
  const [transitionDir, setTransitionDir] = useState<'left' | 'right' | 'fade'>(
    'fade'
  );
  const prevTabIdxRef = useRef<number>(getTabIndex(pathname));
  const [activeHeaderCard, setActiveHeaderCard] = useState<
    'streak' | 'xp' | null
  >(null);

  useEffect(() => {
    const nextIdx = getTabIndex(pathname);
    const prevIdx = prevTabIdxRef.current;
    if (prevIdx !== -1 && nextIdx !== -1 && prevIdx !== nextIdx) {
      setTransitionDir(nextIdx > prevIdx ? 'right' : 'left');
    } else {
      setTransitionDir('fade');
    }
    prevTabIdxRef.current = nextIdx;
    setOptimisticHref(null);
    setActiveHeaderCard(null);
  }, [pathname]);

  // Pre-warm all main tabs and profile route right after mount for instant switching
  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const href of [...TAB_ORDER, '/profile']) {
        try {
          router.prefetch(href);
        } catch {
          // Ignore prefetch errors
        }
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [router]);

  // Hide shell chrome inside active lesson runner for distraction-free focus
  const isInsideLessonRunner =
    pathname.startsWith('/lesson/') && !pathname.endsWith('/result');
  const isFullWidthProfile =
    pathname === '/profile' || pathname.startsWith('/profile/');

  const navItems = [
    { href: '/learn', label: tNav('learn'), icon: GraduationCap, prefetch: true },
    { href: '/review', label: tNav('review'), icon: Brain, prefetch: true },
    { href: '/dictionary', label: tNav('dictionary'), icon: BookOpen, prefetch: true },
    { href: '/translate', label: tNav('translate'), icon: Languages, prefetch: true },
  ];

  if (isFullWidthProfile) {
    return <>{children}</>;
  }

  if (isInsideLessonRunner) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-border bg-background px-4 py-4">
        {children}
      </div>
    );
  }

  const activePath = optimisticHref ?? pathname;
  const activeTabIdx = getTabIndex(activePath);
  const isPendingNavigation =
    optimisticHref !== null && optimisticHref !== pathname;
  const dailyXpRatio = Math.min(100, Math.round((xp / DAILY_XP_GOAL) * 100));
  const enterAnimClass =
    transitionDir === 'right'
      ? 'animate-tab-enter-right'
      : transitionDir === 'left'
        ? 'animate-tab-enter-left'
        : 'animate-tab-enter';

  function handleTabSelect(targetHref: string) {
    if (targetHref === pathname) return;
    const currentIdx = getTabIndex(pathname);
    const targetIdx = getTabIndex(targetHref);
    if (currentIdx !== -1 && targetIdx !== -1 && currentIdx !== targetIdx) {
      setTransitionDir(targetIdx > currentIdx ? 'right' : 'left');
    } else {
      setTransitionDir('fade');
    }
    setOptimisticHref(targetHref);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-border bg-background">
      {/* Top Stat Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-1.5 border-b-2 border-border bg-background/95 px-3 backdrop-blur">
        <Link
          href="/learn"
          prefetch
          onClick={() => handleTabSelect('/learn')}
          className="flex shrink-0 items-center gap-2 rounded-xl py-1 transition-transform duration-75 active:scale-95"
        >
          <LezgiBrandIcon size="sm" />
          <span className="text-sm font-extrabold uppercase tracking-wider text-foreground">
            Лезги
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setActiveHeaderCard((prev) =>
                prev === 'streak' ? null : 'streak'
              )
            }
            className={cn(
              'duo-card-3d flex h-9 items-center gap-1 rounded-xl border-2 border-b-[3px] px-2 text-sm font-extrabold transition-colors',
              activeHeaderCard === 'streak'
                ? 'border-[#B92B1C] bg-primary text-[#F8FAFC]'
                : 'border-border bg-card text-primary hover:border-primary/60'
            )}
            title="Ударный режим (дней подряд)"
          >
            <Flame
              className={cn(
                'h-[16px] w-[16px] -translate-y-[0.5px]',
                activeHeaderCard === 'streak'
                  ? 'fill-[#F8FAFC] text-[#F8FAFC]'
                  : 'fill-primary text-primary'
              )}
            />
            <span className="tabular-nums">{streakDays}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveHeaderCard((prev) => (prev === 'xp' ? null : 'xp'))
            }
            className={cn(
              'duo-card-3d flex h-9 items-center gap-1 rounded-xl border-2 border-b-[3px] px-2 text-sm font-extrabold transition-colors',
              activeHeaderCard === 'xp'
                ? 'border-[#CBD5E1] bg-foreground text-background'
                : 'border-border bg-card text-foreground hover:border-[#FFC800]/60'
            )}
            title="Очки опыта (XP)"
          >
            <Zap className="h-[16px] w-[16px] -translate-y-[0.5px] fill-[#FFC800] text-[#FFC800]" />
            <span className="tabular-nums">{xp}</span>
          </button>

          <ThemeToggleButton />
        </div>

        <Link
          href={isAuthenticated ? '/profile' : '/login'}
          prefetch
          className={cn(
            'duo-card-3d flex h-9 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-[3px] px-2.5 pt-[1px] text-xs font-extrabold uppercase tracking-wide',
            isAuthenticated
              ? 'border-border bg-card text-foreground'
              : 'border-border bg-card text-foreground dark:border-[#CBD5E1] dark:bg-[#F8FAFC] dark:text-[#0B132B]'
          )}
        >
          <User className="h-4 w-4 shrink-0 -translate-y-[0.5px]" />
          <span className="max-w-[76px] truncate">
            {isAuthenticated ? (displayName ?? 'Профиль') : 'Войти'}
          </span>
        </Link>

        {/* Animated Header Stat Popovers (Streak & Daily XP Goal) */}
        {activeHeaderCard === 'streak' && (
          <div className="animate-duo-popover absolute inset-x-4 top-[68px] z-40 rounded-2xl border-2 border-b-[6px] border-[#B92B1C] bg-primary p-4 text-[#F8FAFC] shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#F8FAFC]/85">
                  Ударный режим
                </p>
                <h3 className="text-lg font-black">
                  {streakDays > 0
                    ? `${streakDays} дн. подряд!`
                    : 'Начните серию сегодня!'}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#CBD5E1] bg-[#F8FAFC] text-primary">
                <Flame className="h-7 w-7 fill-primary text-primary" />
              </div>
            </div>

            <p className="mt-2 text-xs font-bold leading-snug text-[#F8FAFC]/90">
              Завершайте хотя бы 1 урок каждый день, чтобы огонь ударного режима не погас.
            </p>

            <div className="mt-3 grid grid-cols-7 gap-1.5 rounded-xl bg-[#0B132B]/35 p-2.5 text-center">
              {WEEK_DAYS.map((day, idx) => {
                const isLit = idx < Math.min(7, streakDays);
                return (
                  <div key={day} className="space-y-1">
                    <span className="block text-[10px] font-extrabold text-[#F8FAFC]/80">
                      {day}
                    </span>
                    <div
                      className={cn(
                        'mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-black',
                        isLit
                          ? 'border-[#CBD5E1] bg-[#F8FAFC] text-primary'
                          : 'border-[#F8FAFC]/25 bg-transparent text-[#F8FAFC]/40'
                      )}
                    >
                      {isLit ? <Check className="h-3.5 w-3.5 stroke-[3.5]" /> : '·'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeHeaderCard === 'xp' && (
          <div className="animate-duo-popover absolute inset-x-4 top-[68px] z-40 rounded-2xl border-2 border-b-[6px] border-border bg-card p-4 text-foreground shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC800]">
                  Дневная цель опыта
                </p>
                <h3 className="text-lg font-black">
                  {xp} / {DAILY_XP_GOAL} XP
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#FFC800] bg-secondary text-amber-500 dark:bg-[#0B132B] dark:text-[#FFC800]">
                <Zap className="h-7 w-7 fill-[#FFC800] text-[#FFC800]" />
              </div>
            </div>

            <div className="mt-3 h-4 w-full overflow-hidden rounded-full border border-border bg-secondary dark:bg-[#0B132B]">
              <div
                className="relative h-full rounded-full bg-[#FFC800] transition-all duration-300"
                style={{ width: `${Math.max(8, dailyXpRatio)}%` }}
              >
                <div className="mx-2 mt-0.5 h-1 rounded-full bg-white/45" />
              </div>
            </div>

            <p className="mt-2.5 text-xs font-bold leading-snug text-muted-foreground">
              +15 XP за каждый пройденный урок · +25 XP за сундук этапа и экзамен раздела.
            </p>
          </div>
        )}

        {isPendingNavigation && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-[-2px] h-[3px] overflow-hidden bg-primary/20"
            aria-hidden="true"
          >
            <div className="duo-nav-progress-bar h-full w-1/2 rounded-full bg-gradient-to-r from-primary via-[#FFC800] to-primary" />
          </div>
        )}
      </header>

      <main
        className="flex-1 overflow-x-hidden px-4 py-6 pb-28"
        onClick={() => {
          if (activeHeaderCard) setActiveHeaderCard(null);
        }}
      >
        <div
          key={pathname}
          className={cn(
            enterAnimClass,
            isPendingNavigation &&
              'pointer-events-none opacity-75 transition-opacity duration-100'
          )}
        >
          {children}
        </div>
      </main>

      {/* Bottom Tab Bar (4 equal-width tactile tabs with smooth gliding active slider) */}
      <nav className="fixed bottom-0 left-1/2 z-20 flex h-20 w-full max-w-md -translate-x-1/2 items-center border-x-2 border-t-2 border-border bg-background/95 px-2 backdrop-blur">
        <div className="relative grid h-14 w-full grid-cols-4 items-center">
          {activeTabIdx !== -1 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/4 px-[3px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
              style={{ transform: `translate3d(${activeTabIdx * 100}%, 0, 0)` }}
            >
              <span className="block h-full w-full rounded-2xl border-2 border-b-[3px] border-primary bg-primary/15 shadow-[0_6px_16px_-6px_rgba(240,78,55,0.42)]" />
            </span>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePath === item.href || activePath.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={item.prefetch}
                onClick={() => handleTabSelect(item.href)}
                className={cn(
                  'relative z-10 flex h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-extrabold uppercase tracking-wide transition-all duration-200 active:scale-95',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    isActive && '-translate-y-[1px] scale-110'
                  )}
                />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
