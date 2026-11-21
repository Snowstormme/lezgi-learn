import type { CSSProperties } from 'react';

const PARTICLES: Array<{
  dx: number;
  dy: number;
  rot: number;
  color: string;
  round?: boolean;
  delayMs: number;
}> = [
  { dx: -56, dy: -48, rot: -40, color: '#FFC800', delayMs: 0 },
  { dx: 54, dy: -52, rot: 35, color: '#F04E37', delayMs: 20 },
  { dx: -72, dy: -8, rot: -15, color: '#38BDF8', delayMs: 40 },
  { dx: 70, dy: -12, rot: 45, color: '#FFC800', delayMs: 30 },
  { dx: -48, dy: 42, rot: 55, color: '#F04E37', delayMs: 50 },
  { dx: 48, dy: 40, rot: -38, color: '#F8FAFC', delayMs: 35 },
  { dx: -26, dy: -66, rot: 0, color: '#F8FAFC', round: true, delayMs: 15 },
  { dx: 28, dy: -68, rot: 0, color: '#FFC800', round: true, delayMs: 25 },
  { dx: -64, dy: 18, rot: 0, color: '#FFC800', round: true, delayMs: 60 },
  { dx: 64, dy: 16, rot: 0, color: '#F04E37', round: true, delayMs: 45 },
  { dx: 0, dy: -76, rot: 20, color: '#FFC800', delayMs: 10 },
  { dx: 4, dy: 56, rot: -25, color: '#38BDF8', delayMs: 55 },
];

export function ConfettiBurst() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible"
    >
      {PARTICLES.map((p, idx) => (
        <span
          key={idx}
          className="duo-confetti-piece"
          style={
            {
              width: p.round ? 7 : 10,
              height: p.round ? 7 : 4.5,
              borderRadius: p.round ? '9999px' : '2px',
              backgroundColor: p.color,
              animationDelay: `${p.delayMs}ms`,
              '--cx': `${p.dx}px`,
              '--cy': `${p.dy}px`,
              '--cr': `${p.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
