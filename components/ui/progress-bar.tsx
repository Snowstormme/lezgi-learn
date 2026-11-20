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
        'h-2.5 w-full overflow-hidden rounded-full bg-secondary/80',
        className
      )}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${ratio}%` }}
      />
    </div>
  );
}
