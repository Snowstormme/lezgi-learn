'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  Languages,
  User,
  Zap,
} from 'lucide-react';
import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { LezgiBrandIcon } from '@/components/ui/lezgi-brand-icon';
import { cn } from '@/lib/utils';

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
  const tNav = useTranslations('nav');
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticHref(null);
  }, [pathname]);

  // Hide shell chrome inside active lesson runner for distraction-free focus
  const isInsideLessonRunner =
    pathname.startsWith('/lesson/') && !pathname.endsWith('/result');

  const navItems = [
    { href: '/learn', label: tNav('learn'), icon: GraduationCap, prefetch: true },
    { href: '/review', label: tNav('review'), icon: Brain, prefetch: false },
    { href: '/dictionary', label: tNav('dictionary'), icon: BookOpen, prefetch: false },
    { href: '/translate', label: tNav('translate'), icon: Languages, prefetch: true },
  ];

  if (isInsideLessonRunner) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-border bg-background px-4 py-4">
        {children}
      </div>
    );
  }

  const activePath = optimisticHref ?? pathname;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-border bg-background">
      {/* Top Stat Bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b-2 border-border bg-background/95 px-4 backdrop-blur">
        <Link
          href="/learn"
          onClick={() => setOptimisticHref('/learn')}
          className="flex shrink-0 items-center gap-2.5 rounded-xl py-1 transition-transform duration-75 active:scale-95"
        >
          <LezgiBrandIcon size="sm" />
          <span className="text-sm font-extrabold uppercase tracking-wider text-[#F8FAFC]">
            Лезги
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3.5">
          <div
            className="flex items-center gap-1.5 text-sm font-extrabold text-primary"
            title="Ударный режим (дней подряд)"
          >
            <Flame className="h-[18px] w-[18px] -translate-y-[0.5px] fill-primary text-primary" />
            <span className="tabular-nums">{streakDays}</span>
          </div>

          <div
            className="flex items-center gap-1 text-sm font-extrabold text-[#F8FAFC]"
            title="Очки опыта (XP)"
          >
            <Zap className="h-[18px] w-[18px] -translate-y-[0.5px] fill-[#FFC800] text-[#FFC800]" />
            <span className="tabular-nums">{xp}</span>
          </div>
        </div>

        <Link
          href={isAuthenticated ? '/profile' : '/login'}
          className={cn(
            'flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 px-3 pt-[1px] text-xs font-extrabold uppercase tracking-wide transition-[transform,colors] duration-75 active:translate-y-[1px] active:border-b-2',
            isAuthenticated
              ? 'border-border bg-card text-[#F8FAFC]'
              : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B]'
          )}
        >
          <User className="h-4 w-4 shrink-0 -translate-y-[0.5px]" />
          <span className="max-w-[96px] truncate">
            {isAuthenticated ? (displayName ?? 'Профиль') : 'Войти'}
          </span>
        </Link>
      </header>

      <main className="flex-1 px-4 py-6 pb-28">{children}</main>

      {/* Bottom Tab Bar (4 equal-width tactile tabs with instant optimistic highlight) */}
      <nav className="fixed bottom-0 left-1/2 z-20 grid h-20 w-full max-w-md -translate-x-1/2 grid-cols-4 items-center gap-1.5 border-x-2 border-t-2 border-border bg-background px-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activePath === item.href || activePath.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch}
              onClick={() => setOptimisticHref(item.href)}
              className={cn(
                'flex h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 text-[10px] font-extrabold uppercase tracking-wide transition-[transform,colors] duration-75 active:scale-95',
                isActive
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-transparent text-muted-foreground hover:text-[#F8FAFC]'
              )}
            >
              <Icon className="h-5 w-5 shrink-0 stroke-[2.2]" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
