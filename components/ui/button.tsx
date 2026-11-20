import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-extrabold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default:
          'border-b-4 border-[#46a302] bg-primary text-primary-foreground hover:brightness-105 active:border-b-2',
        destructive:
          'border-b-4 border-[#d32f2f] bg-destructive text-destructive-foreground hover:brightness-105 active:border-b-2',
        outline:
          'border-2 border-b-4 border-border bg-background text-accent hover:bg-secondary/60 active:border-b-2',
        secondary:
          'border-2 border-b-4 border-border bg-secondary text-foreground hover:bg-secondary/80 active:border-b-2',
        ghost:
          'rounded-xl font-bold normal-case tracking-normal hover:bg-secondary/70 hover:text-foreground',
      },
      size: {
        default: 'h-12 px-5 py-2.5',
        sm: 'h-9 rounded-xl px-3.5 text-xs',
        lg: 'h-13 rounded-2xl px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
