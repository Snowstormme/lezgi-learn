'use client';

import {
  BookOpen,
  Brain,
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
}

export function MobileShell({
  children,
  isAuthenticated,
  displayName,
}: MobileShellProps) {
  const pathname = usePathname();
  const tApp = useTranslations('app');
  const tNav = useTranslations('nav');

  const navItems = [
    { href: '/learn', label: tNav('learn'), icon: GraduationCap },
    { href: '/review', label: tNav('review'), icon: Brain },
    { href: '/dictionary', label: tNav('dictionary'), icon: BookOpen },
    { href: '/phrasebook', label: tNav('phrasebook'), icon: MessageSquare },
    { href: '/translate', label: tNav('translate'), icon: Languages },
  ];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x border-border/60 bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur">
        <Link href="/learn" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            ЛӀ
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">{tApp('name')}</p>
            <p className="text-[11px] text-muted-foreground">Лезги чӀал • v0</p>
          </div>
        </Link>

        {isAuthenticated ? (
          <Link
            href="/profile"
            className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground"
          >
            {displayName ?? 'Профиль'}
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            {tApp('signInCta')}
          </Link>
        )}
      </header>

      {!isAuthenticated && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200/90">
          {tApp('guestBanner')}
        </div>
      )}

      <main className="flex-1 px-4 py-5 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-border/80 bg-background/95 px-2 py-2 backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors',
                isActive
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
