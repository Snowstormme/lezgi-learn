import { cn } from '@/lib/utils';

interface LessonProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function LessonProgressBar({
  current,
  total,
  className,
}: LessonProgressBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const ratio = Math.min(100, Math.max(0, Math.round((current / safeTotal) * 100)));

  return (
    <div
      className={cn(
        'h-4 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
    >
      <div
        className="relative h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${ratio}%` }}
      >
        {ratio > 6 && (
          <div className="mx-2 mt-1 h-1 rounded-full bg-white/30" />
        )}
      </div>
    </div>
  );
}
