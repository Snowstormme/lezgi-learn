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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-primary/15 text-primary',
        variant === 'verified' &&
          'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'warning' &&
          'border border-amber-500/30 bg-amber-500/10 text-amber-300',
        variant === 'outline' &&
          'border border-border bg-transparent text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
