import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'verified' | 'secondary' | 'warning' | 'outline';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border-2 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide',
        variant === 'default' &&
          'border-primary/40 bg-primary/15 text-primary',
        variant === 'verified' &&
          'border-[#46a302] bg-primary/15 text-primary',
        variant === 'secondary' &&
          'border-border bg-secondary text-secondary-foreground',
        variant === 'warning' &&
          'border-amber-500/50 bg-amber-500/15 text-amber-300',
        variant === 'outline' &&
          'border-border bg-transparent text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
