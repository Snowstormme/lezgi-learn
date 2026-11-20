import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-center text-sm font-extrabold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default:
          'border-2 border-b-4 border-[#B92B1C] bg-primary text-primary-foreground hover:brightness-105 active:border-b-2',
        cloud:
          'border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B] hover:bg-white active:border-b-2',
        destructive:
          'border-2 border-b-4 border-[#991B1B] bg-destructive text-destructive-foreground hover:brightness-105 active:border-b-2',
        outline:
          'border-2 border-b-4 border-border bg-background text-foreground hover:bg-secondary/70 active:border-b-2',
        secondary:
          'border-2 border-b-4 border-border bg-secondary text-foreground hover:bg-secondary/80 active:border-b-2',
        ghost:
          'rounded-xl font-bold normal-case tracking-normal hover:bg-secondary/70 hover:text-foreground',
      },
      size: {
        default: 'min-h-[48px] px-5 py-2.5',
        sm: 'min-h-[40px] rounded-xl px-3.5 py-2 text-xs',
        lg: 'min-h-[56px] rounded-2xl px-6 py-3.5 text-base',
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
