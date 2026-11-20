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
          'border-primary/50 bg-primary/15 text-primary',
        variant === 'verified' &&
          'border-emerald-400/50 bg-emerald-500/15 text-emerald-300',
        variant === 'secondary' &&
          'border-border bg-secondary text-foreground',
        variant === 'warning' &&
          'border-primary/60 bg-primary/15 text-primary',
        variant === 'outline' &&
          'border-border bg-transparent text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
