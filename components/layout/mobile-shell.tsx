'use client';

import {
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  Languages,
  MessageSquare,
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
  streakDays = 0,
}: MobileShellProps) {
  const pathname = usePathname();
  const tNav = useTranslations('nav');

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
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background px-5 py-5">
        {children}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
      {/* Minimal Variant-A Top Bar (aligned optically on baseline) */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 bg-background/95 px-5 backdrop-blur">
        <Link
          href="/learn"
          className="text-base font-bold tracking-tight text-[#F8FAFC] transition-colors hover:text-primary"
        >
          Лезги ч<span className="text-primary">Ӏ</span>ал
        </Link>

        <div className="flex items-center gap-5 text-xs font-medium">
          <span
            className="inline-flex items-center gap-1.5 text-[#CBD5E1]"
            title="Дней подряд"
          >
            <Flame className="h-3.5 w-3.5 -translate-y-[0.5px] text-primary" />
            <span className="tabular-nums">{streakDays} д.</span>
          </span>

          <Link
            href={isAuthenticated ? '/profile' : '/login'}
            className="max-w-[120px] truncate text-[#F8FAFC] underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {isAuthenticated ? (displayName ?? 'Профиль') : 'Войти'}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 pb-28 pt-2">{children}</main>

      {/* Minimal Flat Bottom Navigation with Vermillion Top Indicator Line */}
      <nav className="fixed bottom-0 left-1/2 z-20 grid h-16 w-full max-w-lg -translate-x-1/2 grid-cols-5 border-t border-border bg-background/95 px-2 backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-[#F8FAFC]'
              )}
            >
              {isActive && (
                <span className="absolute top-0 h-[2px] w-7 bg-primary" />
              )}
              <Icon className="h-[18px] w-[18px] stroke-[1.9]" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
