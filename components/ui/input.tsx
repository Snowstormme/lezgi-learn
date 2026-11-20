import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-xl border border-border bg-secondary px-4 py-2.5 font-mono text-sm font-medium text-[#F8FAFC] transition-colors placeholder:text-muted-foreground/75 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';
