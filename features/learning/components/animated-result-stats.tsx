'use client';

import { useEffect, useState } from 'react';
import { Check, Target, Zap } from 'lucide-react';

interface AnimatedResultStatsProps {
  xpEarned: number;
  score: number;
  correct: number;
  total: number;
}

export function AnimatedResultStats({
  xpEarned,
  score,
  correct,
  total,
}: AnimatedResultStatsProps) {
  const [displayXp, setDisplayXp] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const durationMs = 550;
    const startTime = performance.now();
    let frameId = 0;

    function tick(now: number) {
      const elapsed = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplayXp(Math.round(xpEarned * eased));
      setDisplayScore(Math.round(score * eased));

      if (elapsed < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [xpEarned, score]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* XP Box (Vermillion) */}
      <div className="animate-duo-pop overflow-hidden rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary">
        <p className="py-1.5 text-center text-[11px] font-black uppercase tracking-wider text-[#F8FAFC]">
          ОПЫТ
        </p>
        <div className="flex items-center justify-center gap-1 rounded-xl bg-background py-3 text-lg font-black tabular-nums text-primary">
          <Zap className="h-5 w-5 fill-primary text-primary" />
          <span>+{displayXp}</span>
        </div>
      </div>

      {/* Accuracy Box (Cloud White) */}
      <div className="animate-duo-pop overflow-hidden rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC]">
        <p className="py-1.5 text-center text-[11px] font-black uppercase tracking-wider text-[#0B132B]">
          ТОЧНОСТЬ
        </p>
        <div className="flex items-center justify-center gap-1 rounded-xl bg-background py-3 text-lg font-black tabular-nums text-[#F8FAFC]">
          <Target className="h-5 w-5 text-[#F8FAFC]" />
          <span>{displayScore}%</span>
        </div>
      </div>

      {/* Correct Answers Box (Navy + Cloud) */}
      <div className="animate-duo-pop overflow-hidden rounded-2xl border-2 border-b-4 border-border bg-secondary">
        <p className="py-1.5 text-center text-[11px] font-black uppercase tracking-wider text-[#F8FAFC]">
          ВЕРНО
        </p>
        <div className="flex items-center justify-center gap-1 rounded-xl bg-background py-3 text-lg font-black tabular-nums text-[#F8FAFC]">
          <Check className="h-5 w-5 stroke-[3] text-primary" />
          <span>
            {correct}/{total}
          </span>
        </div>
      </div>
    </div>
  );
}
