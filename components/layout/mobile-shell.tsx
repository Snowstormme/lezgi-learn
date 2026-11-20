'use client';

import {
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  Languages,
  MessageSquare,
  User,
  Zap,
} from 'lucide-react';
import { Link, usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
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

  // Hide shell chrome inside active lesson runner for distraction-free focus
  const isInsideLessonRunner =
    pathname.startsWith('/lesson/') && !pathname.endsWith('/result');

  const navItems = [
    { href: '/learn', label: tNav('learn'), icon: GraduationCap },
    { href: '/review', label: tNav('review'), icon: Brain },
    { href: '/dictionary', label: tNav('dictionary'), icon: BookOpen },
    { href: '/phrasebook', label: tNav('phrasebook'), icon: MessageSquare },
    { href: '/translate', label: tNav('translate'), icon: Languages },
  ];

  if (isInsideLessonRunner) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-border bg-background px-4 py-4">
        {children}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-border bg-background">
      {/* Top Stat Bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b-2 border-border bg-background/95 px-4 backdrop-blur">
        <Link
          href="/learn"
          className="flex shrink-0 items-center gap-2 rounded-xl py-1 transition-transform active:scale-95"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border-b-4 border-[#B92B1C] bg-primary text-xs font-black text-[#F8FAFC]">
            ЛӀ
          </span>
          <span className="text-sm font-black uppercase tracking-wider text-[#F8FAFC]">
            Лезги
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3.5">
          <div
            className="flex items-center gap-1 text-sm font-black text-primary"
            title="Ударный режим (дней подряд)"
          >
            <Flame className="h-5 w-5 fill-primary text-primary" />
            <span>{streakDays}</span>
          </div>

          <div
            className="flex items-center gap-1 text-sm font-black text-[#F8FAFC]"
            title="Очки опыта (XP)"
          >
            <Zap className="h-5 w-5 fill-[#FFC800] text-[#FFC800]" />
            <span>{xp}</span>
          </div>
        </div>

        <Link
          href={isAuthenticated ? '/profile' : '/login'}
          className={cn(
            'flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 px-3 text-xs font-extrabold uppercase tracking-wide transition-all active:translate-y-[1px] active:border-b-2',
            isAuthenticated
              ? 'border-border bg-card text-[#F8FAFC]'
              : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B]'
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="max-w-[96px] truncate">
            {isAuthenticated ? (displayName ?? 'Профиль') : 'Войти'}
          </span>
        </Link>
      </header>

      <main className="flex-1 px-4 py-5 pb-28">{children}</main>

      {/* Bottom Tab Bar (5 equal-width tactile tabs) */}
      <nav className="fixed bottom-0 left-1/2 z-20 grid h-20 w-full max-w-md -translate-x-1/2 grid-cols-5 items-center gap-1 border-x-2 border-t-2 border-border bg-background px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 text-[10px] font-extrabold uppercase tracking-wide transition-all active:scale-95',
                isActive
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-transparent text-muted-foreground hover:text-[#F8FAFC]'
              )}
            >
              <Icon className="h-5 w-5 shrink-0 stroke-[2.5]" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
