import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LezgiOrnamentProps {
  className?: string;
}

/**
 * Geometric sumakh-inspired Lezgi carpet strip divider.
 * Uses Midnight Navy, Cloud White, and Vermillion without gradients.
 */
export function LezgiOrnament({ className }: LezgiOrnamentProps) {
  const patternId = useId();

  return (
    <div
      aria-hidden="true"
      className={cn(
        'w-full overflow-hidden border-y border-border bg-[#0E1836] py-1.5',
        className
      )}
    >
      <svg
        className="h-4 w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={patternId}
            width="28"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            {/* Outer diamond in Cloud White */}
            <polygon
              points="14,1 26,8 14,15 2,8"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="1.25"
              strokeOpacity="0.85"
            />
            {/* Inner stepped diamond in Vermillion */}
            <polygon points="14,4.5 20,8 14,11.5 8,8" fill="#F04E37" />
            {/* Center dot in Cloud White */}
            <rect x="13" y="7" width="2" height="2" fill="#F8FAFC" />
          </pattern>
        </defs>
        <rect width="100%" height="16" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
