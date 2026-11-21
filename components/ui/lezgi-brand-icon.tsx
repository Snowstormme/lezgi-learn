import { cn } from '@/lib/utils';

interface LezgiBrandIconProps {
  /**
   * 'sm' (36x36) for top navbar header
   * 'md' (48x48) for auth/cards
   * 'lg' (56x56) for lesson exercise dialogue bubbles
   */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<LezgiBrandIconProps['size']>, string> = {
  sm: 'h-9 w-9 rounded-xl border-2 border-b-4',
  md: 'h-12 w-12 rounded-2xl border-2 border-b-4',
  lg: 'h-14 w-14 rounded-2xl border-2 border-b-4',
};

/**
 * Variant 3 — Вершина «Шалбуздагъ» (Sacred Mount Shalbuzdag & rising sun).
 * Pure geometric SVG in Midnight Navy (#0B132B), Cloud White (#F8FAFC), and Vermillion (#F04E37).
 */
export function LezgiBrandIcon({
  size = 'md',
  className,
}: LezgiBrandIconProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center border-[#B92B1C] bg-primary text-[#F8FAFC]',
        SIZE_CLASSES[size],
        className
      )}
    >
      <svg
        viewBox="8 9 48 47"
        className="h-[78%] w-[78%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rising Sun above twin peaks */}
        <circle cx="32" cy="17" r="6" fill="#F8FAFC" />
        {/* Main Left Peak (Shalbuzdag) */}
        <polygon points="8,50 25,22 40,50" fill="#F8FAFC" />
        {/* Shadow facet on Left Peak in Midnight Navy */}
        <polygon points="25,22 31,50 40,50" fill="#0B132B" opacity="0.22" />
        {/* Right Twin Peak */}
        <polygon points="28,50 43,26 56,50" fill="#F8FAFC" />
        {/* Crisp Midnight Navy ridge separator */}
        <polygon
          points="25,22 29,36 23,42 26,50 22,50 20,41 25,35"
          fill="#0B132B"
        />
        {/* Base horizontal bars */}
        <rect x="8" y="47" width="48" height="4" rx="2" fill="#0B132B" />
        <rect x="12" y="51" width="40" height="3" rx="1.5" fill="#F8FAFC" />
      </svg>
    </div>
  );
}
