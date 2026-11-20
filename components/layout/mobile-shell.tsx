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
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background px-4 py-4">
        {children}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-border bg-background">
      {/* Top Stat Bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b-2 border-border bg-background/95 px-4 backdrop-blur">
        <Link
          href="/learn"
          className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-transform active:scale-95"
        >
          <span className="flex h-8 w-9 items-center justify-center rounded-lg border-b-2 border-[#46a302] bg-primary text-xs font-black text-primary-foreground">
            ЛӀ
          </span>
          <span className="text-sm font-black uppercase tracking-wider text-muted-foreground">
            Лезги
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1.5 text-sm font-black text-[#FF9600]"
            title="Ударный режим (дней подряд)"
          >
            <Flame className="h-5 w-5 fill-[#FF9600]" />
            <span>{streakDays}</span>
          </div>

          <div
            className="flex items-center gap-1 text-sm font-black text-[#FFC800]"
            title="Очки опыта (XP)"
          >
            <Zap className="h-5 w-5 fill-[#FFC800]" />
            <span>{xp}</span>
          </div>
        </div>

        <Link
          href={isAuthenticated ? '/profile' : '/login'}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-xl border-2 border-b-4 px-3 text-xs font-extrabold uppercase tracking-wide transition-all active:translate-y-[1px]',
            isAuthenticated
              ? 'border-border bg-secondary text-foreground'
              : 'border-[#1899D6] bg-accent text-primary-foreground'
          )}
        >
          <User className="h-4 w-4" />
          <span>{isAuthenticated ? (displayName ?? 'Профиль') : 'Войти'}</span>
        </Link>
      </header>

      <main className="flex-1 px-4 py-5 pb-24">{children}</main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 z-20 flex h-20 w-full max-w-md -translate-x-1/2 items-center justify-around border-t-2 border-border bg-background px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wide transition-all active:scale-95',
                isActive
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 stroke-[2.5]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
