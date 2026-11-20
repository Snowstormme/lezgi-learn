import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-center font-mono font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-[#F8FAFC] hover:bg-[#DC3D26]',
        cloud:
          'bg-[#F8FAFC] text-[#0B132B] hover:bg-[#E2E8F0]',
        destructive:
          'bg-destructive text-[#F8FAFC] hover:bg-destructive/90',
        outline:
          'border border-border bg-transparent text-[#F8FAFC] hover:bg-secondary/70',
        secondary:
          'border border-border bg-secondary text-[#F8FAFC] hover:bg-[#23335C]',
        ghost:
          'bg-transparent text-muted-foreground hover:bg-secondary/60 hover:text-[#F8FAFC]',
      },
      size: {
        default: 'min-h-[46px] px-5 py-2.5 text-sm',
        sm: 'min-h-[38px] rounded-lg px-3.5 py-2 text-xs',
        lg: 'min-h-[52px] rounded-xl px-6 py-3.5 text-sm font-bold',
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
