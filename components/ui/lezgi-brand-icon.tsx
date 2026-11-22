import { cn } from '@/lib/utils';

interface LezgiBrandIconProps {
  /**
   * 'sm' (38x38) for top navbar header
   * 'md' (52x52) for auth/cards
   * 'lg' (60x60) for lesson exercise dialogue bubbles
   */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<LezgiBrandIconProps['size']>, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

/**
 * Authentic South Dagestan Lezgi «Сумаг» Carpet Medallion brand icon.
 */
export function LezgiBrandIcon({
  size = 'md',
  className,
}: LezgiBrandIconProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex shrink-0 items-center justify-center select-none',
        SIZE_CLASSES[size],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon.svg?v=2"
        alt=""
        className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
