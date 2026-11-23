"use client";

import { useEffect, useId, useState } from "react";

/**
 * Lezgi Learn — learning-path decorations (v3: day + night).
 * Drop-in replacement for the old decor renderer: renders an SVG <g> placed at (x, y)
 * inside the course-path <svg>. Each scene is ~60 x 60 SVG units centred on (0, 0).
 * Kinds: "campfire" | "watchtower" | "bridge" | "samovar" | anything else -> mountains.
 * Pass time="day" | "night" to force a look; leave it out to follow the learner's clock.
 * All motion lives in path-decor.css (classes prefixed "ld-").
 */
export interface PathDecorItem {
  kind: string;
  x: number;
  y: number;
}

export type TimeOfDay = "day" | "night";

/** Day runs from DAY_START (inclusive) to NIGHT_START (exclusive), in the learner's local hours. */
export const DAY_START = 7;
export const NIGHT_START = 19;

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const h = date.getHours();
  return h >= DAY_START && h < NIGHT_START ? "day" : "night";
}

/** Learner's local time of day; re-checked every minute so it flips at dusk/dawn. Starts as "night" until mounted. */
export function useTimeOfDay(): TimeOfDay {
  const [time, setTime] = useState<TimeOfDay>("night");
  useEffect(() => {
    const update = () => setTime(getTimeOfDay());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

type Tri = [number, number, number];
type SceneProps = { night: boolean };

function useUid(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

export function PathDecor({ decor, time }: { decor: PathDecorItem; time?: TimeOfDay }) {
  const auto = useTimeOfDay();
  const night = (time ?? auto) === "night";
  const { kind, x, y } = decor;
  return (
    <g transform={`translate(${x}, ${y})`} className="ld-scene" data-time={night ? "night" : "day"} aria-hidden="true">
      {kind === "campfire" ? (
        <Campfire night={night} />
      ) : kind === "watchtower" ? (
        <Watchtower night={night} />
      ) : kind === "bridge" ? (
        <Bridge night={night} />
      ) : kind === "samovar" ? (
        <Samovar night={night} />
      ) : (
        <Mountains night={night} />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ shared */

function Platform({ u, w = 54, night }: { u: string; w?: number; night: boolean }) {
  const h = w / 2;
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-slab`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#26395F" : "#34507F"} />
          <stop offset="1" stopColor={night ? "#141E3A" : "#1D2D52"} />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="26" rx={h + 1} ry="3" fill="#000" opacity="0.35" />
      <rect x={-h} y="16" width={w} height="10" rx="5" fill={night ? "#0E1730" : "#14213F"} />
      <rect
        x={-h}
        y="12.5"
        width={w}
        height="9.5"
        rx="4.75"
        fill={`url(#${u}-slab)`}
        stroke={night ? "#2C406B" : "#45619A"}
        strokeWidth="1.2"
      />
      <path
        d={`M${-h + 5} 14.2 H${h - 5}`}
        stroke={night ? "#4A639A" : "#7C98D2"}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  );
}

const SPARKLE =
  "M0 -2.6 C0.25 -0.8 0.8 -0.25 2.6 0 C0.8 0.25 0.25 0.8 0 2.6 C-0.25 0.8 -0.8 0.25 -2.6 0 C-0.8 -0.25 -0.25 -0.8 0 -2.6 Z";

function sunRays(cx: number, cy: number, r1: number, rLong: number, rShort: number, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const r2 = i % 2 ? rShort : rLong;
    return `M${(cx + Math.cos(a) * r1).toFixed(2)} ${(cy + Math.sin(a) * r1).toFixed(2)} L${(cx + Math.cos(a) * r2).toFixed(2)} ${(cy + Math.sin(a) * r2).toFixed(2)}`;
  }).join(" ");
}

/** Small sky hint in a corner: sun + cloud by day, crescent moon + stars by night. */
function SkyCue({ u, night, x, y }: { u: string; night: boolean; x: number; y: number }) {
  const id = `${u}-sky`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={night ? "#E0E7FF" : "#FFD27A"} stopOpacity={night ? 0.45 : 0.75} />
          <stop offset="1" stopColor={night ? "#E0E7FF" : "#FFB347"} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-sun`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#FFF6C2" />
          <stop offset="0.55" stopColor="#FFC800" />
          <stop offset="1" stopColor="#FF8A1F" />
        </radialGradient>
        <mask id={`${id}-moon`}>
          <circle cx="0" cy="0" r="3.4" fill="#fff" />
          <circle cx="1.7" cy="-1.1" r="2.9" fill="#000" />
        </mask>
      </defs>
      <circle r="7.5" fill={`url(#${id}-glow)`} className="ld-moon-glow" />
      {night ? (
        <>
          <circle r="3.4" fill="#F1F5F9" mask={`url(#${id}-moon)`} />
          <g transform="translate(7 -3) scale(0.55)">
            <path d={SPARKLE} fill="#FFE58A" className="ld-twinkle-1" />
          </g>
          <g transform="translate(-4 7) scale(0.45)">
            <path d={SPARKLE} fill="#F8FAFC" className="ld-twinkle-2" />
          </g>
          <circle cx="9" cy="5" r="0.55" fill="#F8FAFC" className="ld-twinkle-3" />
        </>
      ) : (
        <>
          <g className="ld-rays">
            <path d={sunRays(0, 0, 4.6, 6.6, 5.6)} stroke="#FFD27A" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
          </g>
          <circle r="3.6" fill={`url(#${id}-sun)`} />
          <g className="ld-cloud">
            <path
              d="M1 6 H10 A2.3 2.3 0 0 0 9.4 1.6 A3.2 3.2 0 0 0 3.4 1.4 A2.4 2.4 0 0 0 1 6 Z"
              fill="#E8EEF9"
              opacity="0.85"
            />
          </g>
        </>
      )}
    </g>
  );
}

/** Two small birds drifting across a daytime sky. */
function Birds({ x, y }: { x: number; y: number }) {
  const bird = "M-2.2 0 Q-1.1 -1.3 0 0 Q1.1 -1.3 2.2 0";
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="ld-birds">
        <path d={bird} stroke="#E2E8F0" strokeWidth="0.7" strokeLinecap="round" fill="none" className="ld-bird-1" />
        <g transform="translate(4.5 2.2) scale(0.75)">
          <path d={bird} stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" className="ld-bird-2" />
        </g>
      </g>
    </g>
  );
}

/* ---------------------------------------------------------------- campfire */

function Campfire({ night }: SceneProps) {
  const u = useUid("cf");
  const stone = `url(#${u}-stone)`;
  const back: Tri[] = [
    [-12, 11.5, 3.1],
    [-4.5, 10, 2.9],
    [4.5, 10, 2.9],
    [12, 11.5, 3.1],
  ];
  const front: Tri[] = [
    [-15.5, 15, 3.5],
    [-7, 17, 3.8],
    [1.5, 17.6, 4],
    [10, 17, 3.8],
    [16.5, 15, 3.4],
  ];
  const allSparks: Array<[number, number, number, string, string]> = [
    [-3, -12, 1.2, "#FFD23F", "ld-spark-1"],
    [4, -14, 1, "#FFF6C4", "ld-spark-2"],
    [0, -18, 0.9, "#FF8A1F", "ld-spark-3"],
    [-6, -8, 0.8, "#FFD23F", "ld-spark-4"],
    [6, -9, 1.1, "#FFB347", "ld-spark-5"],
    [1, -10, 0.7, "#FFFFFF", "ld-spark-6"],
  ];
  // sparks are hard to see in daylight: keep only a few
  const sparks = night ? allSparks : allSparks.slice(0, 3);
  const smoke = night ? ["#7D8DB3", "#6B7CA3", "#7D8DB3"] : ["#D5DDEB", "#C3CDE0", "#D5DDEB"];
  return (
    <>
      <defs>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor="#FFC56B" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#F04E37" stopOpacity="0.45" />
          <stop offset="1" stopColor="#F04E37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-outer`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FF8A1F" />
          <stop offset="0.55" stopColor="#F4502A" />
          <stop offset="1" stopColor="#C8261A" />
        </linearGradient>
        <linearGradient id={`${u}-mid`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFE066" />
          <stop offset="1" stopColor="#FF7A1A" />
        </linearGradient>
        <linearGradient id={`${u}-core`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#FFF6C4" />
          <stop offset="1" stopColor="#FFD23F" />
        </linearGradient>
        <linearGradient id={`${u}-log`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#9A6A40" : "#B9844F"} />
          <stop offset="0.5" stopColor={night ? "#5E3A1E" : "#7A4D28"} />
          <stop offset="1" stopColor={night ? "#2F1A0B" : "#3E2410"} />
        </linearGradient>
        <radialGradient id={`${u}-stone`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor={night ? "#6A7FA8" : "#9AACD2"} />
          <stop offset="0.55" stopColor={night ? "#33466F" : "#53689A"} />
          <stop offset="1" stopColor={night ? "#18233F" : "#26365E"} />
        </radialGradient>
        <radialGradient id={`${u}-bed`}>
          <stop offset="0" stopColor="#FFE9A0" />
          <stop offset="0.4" stopColor="#FF7A1A" />
          <stop offset="0.8" stopColor="#9E1F12" />
          <stop offset="1" stopColor="#9E1F12" stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id={`${u}-soft`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      <SkyCue u={u} night={night} x={-21} y={-22} />
      <Platform u={u} w={56} night={night} />
      {/* firelight on the ground is much weaker in daylight */}
      <g opacity={night ? 1 : 0.45}>
        <ellipse cx="0" cy="15" rx="25" ry="6" fill={`url(#${u}-glow)`} className="ld-flicker" />
      </g>

      {back.map(([cx, cy, r]) => (
        <circle key={`b${cx}`} cx={cx} cy={cy} r={r} fill={stone} />
      ))}
      <ellipse cx="0" cy="13" rx="12" ry="3.4" fill={`url(#${u}-bed)`} className="ld-ember-bed" />

      {/* crossed logs with cut ends */}
      <g transform="rotate(-17 0 12)">
        <rect x="-16" y="9.6" width="32" height="5" rx="2.5" fill={`url(#${u}-log)`} />
        <path d="M-12 11 H2 M-6 13 H8" stroke="#2A170A" strokeWidth="0.5" opacity="0.7" />
        <ellipse cx="15.2" cy="12.1" rx="1.6" ry="2.5" fill="#C9935C" stroke="#7A4A26" strokeWidth="0.6" />
      </g>
      <g transform="rotate(17 0 12)">
        <rect x="-16" y="9.6" width="32" height="5" rx="2.5" fill={`url(#${u}-log)`} />
        <path d="M-8 11 H10 M-2 13 H12" stroke="#2A170A" strokeWidth="0.5" opacity="0.7" />
        <ellipse cx="-15.2" cy="12.1" rx="1.6" ry="2.5" fill="#C9935C" stroke="#7A4A26" strokeWidth="0.6" />
      </g>

      <g opacity={night ? 1 : 0.4}>
        <circle cx="0" cy="-6" r="19" fill={`url(#${u}-glow)`} filter={`url(#${u}-blur)`} className="ld-halo" />
      </g>

      {/* smoke: dark by night, pale grey by day */}
      <circle cx="0" cy="-25" r="3.2" fill={smoke[0]} filter={`url(#${u}-soft)`} className="ld-smoke-1" />
      <circle cx="1" cy="-25" r="2.8" fill={smoke[1]} filter={`url(#${u}-soft)`} className="ld-smoke-2" />
      <circle cx="-1" cy="-25" r="3" fill={smoke[2]} filter={`url(#${u}-soft)`} className="ld-smoke-3" />

      {/* flames: side tongues, outer, middle, white-hot core, detached licks */}
      <path d="M-5 9 C-10 3 -11 -5 -8 -13 C-7 -7 -4.5 -3 -1.5 2 Z" fill={`url(#${u}-outer)`} className="ld-tongue-l" />
      <path d="M5 9 C10 3 11 -5 8 -13 C7 -7 4.5 -3 1.5 2 Z" fill={`url(#${u}-outer)`} className="ld-tongue-r" />
      <path
        d="M1 -28 C3 -20 12 -15 12 -3 C12 5 7 11 0 11 C-7 11 -12 5 -12 -3 C-12 -11 -6 -15 -4 -22 C-2 -17 0 -16 1 -19 C2 -22 1 -25 1 -28 Z"
        fill={`url(#${u}-outer)`}
        className="ld-flame-outer"
      />
      <path
        d="M0 -19 C3 -13 8.5 -9 8.5 -1 C8.5 5 5 9.5 0 9.5 C-5 9.5 -8.5 5 -8.5 -1 C-8.5 -7 -4 -10 -2.5 -15 C-1.5 -12 -0.5 -12 0 -14 Z"
        fill={`url(#${u}-mid)`}
        className="ld-flame-mid"
      />
      <path
        d="M0 -9 C2 -5 5 -2 5 2.5 C5 6.5 2.8 9 0 9 C-2.8 9 -5 6.5 -5 2.5 C-5 -1 -2 -4 0 -9 Z"
        fill={`url(#${u}-core)`}
        className="ld-flame-core"
      />
      <path d="M0.5 -29 C2 -27 2 -24.5 0.5 -23.5 C-1 -24.5 -1 -27 0.5 -29 Z" fill="#FF7A1A" className="ld-lick-1" />
      <path d="M-4 -22 C-3 -20.6 -3 -19 -4 -18.3 C-5 -19 -5 -20.6 -4 -22 Z" fill="#FFB347" className="ld-lick-2" />

      {front.map(([cx, cy, r]) => (
        <g key={`f${cx}`}>
          <circle cx={cx} cy={cy} r={r} fill={stone} />
          {night && (
            <ellipse cx={cx} cy={cy - r * 0.5} rx={r * 0.6} ry={r * 0.28} fill="#FF9A55" className="ld-rim" />
          )}
        </g>
      ))}

      {sparks.map(([cx, cy, r, c, cls]) => (
        <circle key={cls} cx={cx} cy={cy} r={r} fill={c} className={cls} />
      ))}
    </>
  );
}

/* -------------------------------------------------------------- watchtower */

function Watchtower({ night }: SceneProps) {
  const u = useUid("wt");
  const joints: Array<[number, number, number]> = [
    [-5, -18, -12], [4, -18, -12], [-1, -12, -6], [6, -12, -6], [-6, -6, 0],
    [2, -6, 0], [-3, 0, 6], [6, 0, 6], [-7, 6, 14], [1, 6, 14], [8, 6, 14],
  ];
  const winPath = "M-3.2 0 V-6 A3.2 3.2 0 0 1 3.2 -6 V0 Z";
  return (
    <>
      <defs>
        <linearGradient id={`${u}-stone`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={night ? "#566DA2" : "#7A94CC"} />
          <stop offset="0.45" stopColor={night ? "#34477A" : "#4D669E"} />
          <stop offset="1" stopColor={night ? "#1A2645" : "#283A66"} />
        </linearGradient>
        <linearGradient id={`${u}-house`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={night ? "#3A4F80" : "#5670AA"} />
          <stop offset="1" stopColor={night ? "#1E2B4F" : "#2C3E6B"} />
        </linearGradient>
        <linearGradient id={`${u}-cloud`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#33467A" : "#F1F5FC"} />
          <stop offset="1" stopColor={night ? "#18233F" : "#B8C6E3"} />
        </linearGradient>
        <linearGradient id={`${u}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CFE0FA" />
          <stop offset="0.5" stopColor="#7E9BD0" />
          <stop offset="1" stopColor="#3A5288" />
        </linearGradient>
        <radialGradient id={`${u}-win`} cx="0.5" cy="0.65" r="0.7">
          <stop offset="0" stopColor="#FFF4C2" />
          <stop offset="0.45" stopColor="#FFC800" />
          <stop offset="1" stopColor="#FF8A1F" />
        </radialGradient>
        <radialGradient id={`${u}-wglow`}>
          <stop offset="0" stopColor="#FFC800" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFC800" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-mglow`}>
          <stop offset="0" stopColor="#E0E7FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E0E7FF" stopOpacity="0" />
        </radialGradient>
        <mask id={`${u}-moon`}>
          <circle cx="-20" cy="-22" r="5" fill="#fff" />
          <circle cx="-17.6" cy="-23.6" r="4.3" fill="#000" />
        </mask>
        <clipPath id={`${u}-tower`}>
          <polygon points="-12,14 -9,-18 9,-18 12,14" />
        </clipPath>
        <filter id={`${u}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id={`${u}-soft`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>

      {/* sky: moon + stars at night, sun peeking from the cloud + birds by day */}
      {night ? (
        <>
          <circle cx="-20" cy="-22" r="10" fill={`url(#${u}-mglow)`} className="ld-moon-glow" />
          <circle cx="-20" cy="-22" r="5" fill="#F1F5F9" mask={`url(#${u}-moon)`} />
          <g transform="translate(21 -27)">
            <path d={SPARKLE} fill="#FFE58A" className="ld-twinkle-1" />
          </g>
          <g transform="translate(-25 -7) scale(0.7)">
            <path d={SPARKLE} fill="#F8FAFC" className="ld-twinkle-2" />
          </g>
          <circle cx="26" cy="-16" r="0.8" fill="#F8FAFC" className="ld-twinkle-3" />
        </>
      ) : (
        <>
          <SkyCue u={u} night={false} x={-20} y={-23} />
          <Birds x={17} y={-28} />
        </>
      )}
      <g className="ld-cloud">
        <path
          d="M-28 -13 H-10 A4 4 0 0 0 -11 -21 A5.5 5.5 0 0 0 -21.5 -22 A4.2 4.2 0 0 0 -28 -13 Z"
          fill={`url(#${u}-cloud)`}
          stroke={night ? "#4A639A" : "#FFFFFF"}
          strokeWidth="0.6"
          opacity={night ? 0.95 : 0.9}
        />
      </g>

      <Platform u={u} w={58} night={night} />

      {/* neighbouring house (saklya) */}
      <rect x="11" y="3" width="16" height="11" fill={`url(#${u}-house)`} />
      <path d="M11 8.5 H27" stroke={night ? "#18233F" : "#22325A"} strokeWidth="0.6" />
      <rect x="23" y="-2.5" width="2.4" height="4" fill={night ? "#2E4170" : "#3E5791"} />
      <circle cx="24.2" cy="-4" r="1.3" fill={night ? "#8A9BBF" : "#DCE3F0"} filter={`url(#${u}-soft)`} className="ld-chimney-1" />
      <circle cx="24.2" cy="-4" r="1.1" fill={night ? "#8A9BBF" : "#DCE3F0"} filter={`url(#${u}-soft)`} className="ld-chimney-2" />
      <rect x="9.5" y="1" width="19" height="2.6" rx="0.8" fill={night ? "#4A6196" : "#6680BC"} />
      {[11.5, 15, 18.5, 22, 25.5].map((cx) => (
        <circle key={cx} cx={cx} cy="4.1" r="0.6" fill="#141E3A" />
      ))}
      {night ? (
        <rect x="15" y="6" width="4.6" height="4.6" rx="0.5" fill="#FF9A3D" className="ld-win-2" />
      ) : (
        <rect x="15" y="6" width="4.6" height="4.6" rx="0.5" fill={`url(#${u}-glass)`} />
      )}
      <path d="M17.3 6 V10.6 M15 8.3 H19.6" stroke="#0E1730" strokeWidth="0.7" />
      <rect x="15" y="6" width="4.6" height="4.6" rx="0.5" fill="none" stroke="#0E1730" strokeWidth="0.8" />

      {/* tower */}
      <polygon points="-12,14 -9,-18 9,-18 12,14" fill={`url(#${u}-stone)`} stroke="#0E1730" strokeWidth="0.8" />
      <g clipPath={`url(#${u}-tower)`} stroke={night ? "#141E3A" : "#1E2D52"} strokeWidth="0.75" opacity="0.85">
        {[-12, -6, 0, 6].map((yy) => (
          <path key={yy} d={`M-13 ${yy} H13`} />
        ))}
        {joints.map(([xx, y1, y2]) => (
          <path key={`${xx}${y1}`} d={`M${xx} ${y1} V${y2}`} />
        ))}
        <polygon points="6,-18 9,-18 12,14 8,14" fill="#000" stroke="none" opacity="0.2" />
      </g>
      <path d="M-12 14 L-9 -18" stroke={night ? "#7891C4" : "#A9BDE6"} strokeWidth="0.9" opacity="0.7" />

      {/* battlements + flag */}
      <line x1="0" y1="-25" x2="0" y2="-35" stroke="#94A3B8" strokeWidth="0.9" />
      <path
        d="M0.5 -35 C3 -36 5.5 -34 9 -35 V-30.5 C5.5 -29.5 3 -31.5 0.5 -30.5 Z"
        fill="#F04E37"
        className="ld-flag"
      />
      <rect x="-11.5" y="-21.4" width="23" height="3.6" rx="0.6" fill={night ? "#2E4170" : "#4560A0"} stroke="#0E1730" strokeWidth="0.6" />
      {[-10, -6, -2, 2, 6].map((xx) => (
        <rect key={xx} x={xx} y="-17.9" width="2.2" height="1.5" fill={night ? "#22325A" : "#2E4373"} />
      ))}
      {[-11.5, -2.5, 6.5].map((xx) => (
        <rect key={xx} x={xx} y="-25.2" width="5" height="4" fill={night ? "#3B5284" : "#5B76B4"} stroke="#0E1730" strokeWidth="0.6" />
      ))}

      {/* window: candle-lit at night, sky reflected in the glass by day */}
      {night ? (
        <>
          <circle cx="0" cy="-4" r="10" fill={`url(#${u}-wglow)`} filter={`url(#${u}-blur)`} className="ld-win-glow" />
          <path d={winPath} fill={`url(#${u}-win)`} className="ld-win-1" />
          <path d="M0 -9.2 V0 M-3.2 -4 H3.2" stroke="#7A4A1A" strokeWidth="0.7" />
        </>
      ) : (
        <>
          <path d={winPath} fill={`url(#${u}-glass)`} />
          <path d="M-2.2 -1.2 L1.6 -7.6" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.6" />
          <path d="M0 -9.2 V0 M-3.2 -4 H3.2" stroke="#3A2A1A" strokeWidth="0.7" />
        </>
      )}
      <path d={winPath} fill="none" stroke="#0E1730" strokeWidth="1.1" />
      <rect x="-4.2" y="-0.2" width="8.4" height="1.3" rx="0.4" fill={night ? "#4A639A" : "#6A86C4"} />
      <rect x="-0.9" y="-15" width="1.8" height="4" rx="0.9" fill="#0B132B" />
      <path d="M-3 14 V10.5 A3 3 0 0 1 3 10.5 V14 Z" fill="#0B132B" stroke={night ? "#4A639A" : "#6A86C4"} strokeWidth="0.6" />
    </>
  );
}

/* ------------------------------------------------------------------ bridge */

function Bridge({ night }: SceneProps) {
  const u = useUid("br");
  const wave = (y: number) => `M-44 ${y} Q-38 ${y - 2} -32 ${y} T-20 ${y} T-8 ${y} T4 ${y} T16 ${y} T28 ${y} T40 ${y}`;
  return (
    <>
      <defs>
        <linearGradient id={`${u}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#1F6A9C" : "#3FA2DE"} />
          <stop offset="0.6" stopColor={night ? "#134070" : "#1F6FA8"} />
          <stop offset="1" stopColor={night ? "#0D2A4F" : "#174A80"} />
        </linearGradient>
        <linearGradient id={`${u}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#566DA2" : "#7A94CC"} />
          <stop offset="0.55" stopColor={night ? "#34477A" : "#4D669E"} />
          <stop offset="1" stopColor={night ? "#1C2849" : "#2A3B66"} />
        </linearGradient>
        <radialGradient id={`${u}-lamp`}>
          <stop offset="0" stopColor="#FFE08A" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#FF9A3D" stopOpacity="0.4" />
          <stop offset="1" stopColor="#FF9A3D" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${u}-clip`}>
          <rect x="-31" y="11" width="62" height="14" rx="7" />
        </clipPath>
        <filter id={`${u}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>

      <ellipse cx="0" cy="26" rx="31" ry="2.6" fill="#000" opacity="0.35" />
      <rect x="-31" y="11" width="62" height="14" rx="7" fill={`url(#${u}-water)`} stroke={night ? "#1E3A66" : "#2A5A92"} strokeWidth="1.2" />
      <g clipPath={`url(#${u}-clip)`}>
        <path d="M-17 13 C-17 24 17 24 17 13" stroke={night ? "#5B73A6" : "#8FA8DA"} strokeWidth="2.6" fill="none" opacity="0.35" className="ld-reflect" />
        {night && (
          <>
            <ellipse cx="-23" cy="17.5" rx="0.6" ry="2.4" fill="#FFD45A" opacity="0.3" className="ld-reflect-light" />
            <ellipse cx="23" cy="17.5" rx="0.6" ry="2.4" fill="#FFD45A" opacity="0.3" className="ld-reflect-light ld-delay" />
          </>
        )}
        <path d={wave(15.5)} stroke={night ? "#38BDF8" : "#7DD3FC"} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeDasharray="5 7" className="ld-flow-1" />
        <path d={wave(19.5)} stroke={night ? "#7DD3FC" : "#BAE6FD"} strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="3 9" className="ld-flow-2" />
        <path d={wave(23)} stroke={night ? "#BAE6FD" : "#E0F2FE"} strokeWidth="0.8" fill="none" strokeLinecap="round" strokeDasharray="8 10" opacity="0.6" className="ld-flow-3" />
        <ellipse cx="-24" cy="21" rx="1.6" ry="0.45" fill={night ? "#E0F2FE" : "#FFFFFF"} className="ld-glint-1" />
        <ellipse cx="6" cy="17" rx="1.4" ry="0.4" fill={night ? "#E0F2FE" : "#FFFFFF"} className="ld-glint-2" />
        <ellipse cx="22" cy="22" rx="1.8" ry="0.45" fill={night ? "#E0F2FE" : "#FFFFFF"} className="ld-glint-3" />
        {!night && <ellipse cx="-12" cy="23.5" rx="1.2" ry="0.35" fill="#FFF6C2" className="ld-glint-2" />}
      </g>

      {/* shade under the arch + jumping fish */}
      <path d="M-17 13 C-17 -1.5 17 -1.5 17 13 Z" fill="#06102A" opacity={night ? 0.4 : 0.28} />
      <g transform="translate(-7 0)">
        <path d="M-2 0 C-1 -1.2 1 -1.2 2.2 0 C1 1.2 -1 1.2 -2 0 Z M-1.8 0 L-3.4 -1.1 L-3.4 1.1 Z" fill="#CBD5E1" className="ld-fish" />
      </g>
      <ellipse cx="-10.5" cy="15.6" rx="2.4" ry="0.7" fill="none" stroke="#BAE6FD" strokeWidth="0.6" className="ld-splash-1" />
      <ellipse cx="-3.5" cy="15.6" rx="2.4" ry="0.7" fill="none" stroke="#BAE6FD" strokeWidth="0.6" className="ld-splash-2" />

      {/* stone arch bridge */}
      <path
        d="M-28 13 V-3 Q-14 -9.5 0 -9.5 Q14 -9.5 28 -3 V13 H17 C17 -1.5 -17 -1.5 -17 13 Z"
        fill={`url(#${u}-stone)`}
        stroke="#0E1730"
        strokeWidth="1"
      />
      <path d="M-19.1 13 C-19.1 -4.3 19.1 -4.3 19.1 13" stroke={night ? "#627BB0" : "#8CA5DA"} strokeWidth="4" strokeDasharray="2.4 0.9" fill="none" />
      <path d="M-17 13 C-17 -1.5 17 -1.5 17 13" stroke="#0B132B" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path
        d="M-27 1 H-22 M-25 5.5 H-20.5 M-27 9.5 H-21 M22 1 H27 M20.5 5.5 H25 M21 9.5 H27 M-8 -6.5 H-2 M3 -6.5 H9"
        stroke={night ? "#1C2849" : "#2A3B66"}
        strokeWidth="0.7"
      />
      <path d="M-28 13.3 H-17 M17 13.3 H28" stroke="#BAE6FD" strokeWidth="0.7" opacity={night ? 0.5 : 0.8} className="ld-foam" />
      <path d="M-28.5 -3 Q-14 -9.8 0 -9.8 Q14 -9.8 28.5 -3" stroke={night ? "#5F78AD" : "#7F99D0"} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M-28 -4.3 Q-14 -11 0 -11 Q14 -11 28 -4.3" stroke={night ? "#8AA0D0" : "#BFD0F0"} strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* lanterns: lit at night, switched off by day */}
      {[-23, 23].map((lx, i) => (
        <g key={lx} transform={`translate(${lx} 0)`}>
          {night && (
            <circle cx="0" cy="-13.5" r="6.5" fill={`url(#${u}-lamp)`} filter={`url(#${u}-blur)`} className={i ? "ld-lamp-glow ld-delay" : "ld-lamp-glow"} />
          )}
          <line x1="0" y1="-5" x2="0" y2="-11.4" stroke="#94A3B8" strokeWidth="1.1" />
          {night ? (
            <rect x="-1.8" y="-15.6" width="3.6" height="4.3" rx="0.8" fill="#FFD45A" className={i ? "ld-lamp ld-delay" : "ld-lamp"} />
          ) : (
            <>
              <rect x="-1.8" y="-15.6" width="3.6" height="4.3" rx="0.8" fill="#A8BCE0" opacity="0.85" />
              <path d="M-0.9 -14.6 V-12.4" stroke="#FFFFFF" strokeWidth="0.5" strokeLinecap="round" opacity="0.7" />
            </>
          )}
          <rect x="-1.8" y="-15.6" width="3.6" height="4.3" rx="0.8" fill="none" stroke="#0E1730" strokeWidth="0.5" />
          <path d="M-2.5 -15.5 L0 -17.6 L2.5 -15.5 Z" fill="#94A3B8" />
        </g>
      ))}

      {/* fireflies at night, a butterfly by day */}
      {night ? (
        <>
          <circle cx="-8" cy="-15" r="0.7" fill="#FDE68A" className="ld-firefly-1" />
          <circle cx="10" cy="-18" r="0.6" fill="#FDE68A" className="ld-firefly-2" />
        </>
      ) : (
        <g transform="translate(6 -18)">
          <g className="ld-butterfly">
            <g className="ld-bwing">
              <path d="M0 0 C-1.2 -2.6 -3.6 -2.6 -3.3 -0.6 C-3.1 0.6 -1.4 0.6 0 0 Z" fill="#FFC800" />
              <path d="M0 0 C1.2 -2.6 3.6 -2.6 3.3 -0.6 C3.1 0.6 1.4 0.6 0 0 Z" fill="#FFC800" />
              <path d="M0 0 C-1 1.8 -2.6 2 -2.4 0.8 Z M0 0 C1 1.8 2.6 2 2.4 0.8 Z" fill="#F04E37" />
            </g>
            <ellipse cx="0" cy="0" rx="0.35" ry="1.3" fill="#1E2B4F" />
          </g>
        </g>
      )}
    </>
  );
}

/* ----------------------------------------------------------------- samovar */

function Samovar({ night }: SceneProps) {
  const u = useUid("sm");
  const brass = `url(#${u}-brass)`;
  const body = "M-14 6 C-17.5 1 -17.5 -9 -13.5 -14 H5.5 C9.5 -9 9.5 1 6 6 Z";
  const glass =
    "M8.9 4.6 H15.9 C15.9 6.6 13.9 7.6 13.9 9 C13.9 10.4 15.7 11.1 15.7 12.6 H9.1 C9.1 11.1 10.9 10.4 10.9 9 C10.9 7.6 8.9 6.6 8.9 4.6 Z";
  const wisp = "M0 0 C-1.5 -2 1.5 -4 0 -6 C-1.5 -8 1 -9.5 0 -11";
  return (
    <>
      <defs>
        <linearGradient id={`${u}-copper`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5E1A0B" />
          <stop offset="0.18" stopColor="#A8341C" />
          <stop offset="0.36" stopColor="#F04E37" />
          <stop offset="0.47" stopColor={night ? "#FFA387" : "#FFC2AE"} />
          <stop offset="0.56" stopColor="#F26A4A" />
          <stop offset="0.8" stopColor="#A8341C" />
          <stop offset="1" stopColor="#4A140A" />
        </linearGradient>
        <linearGradient id={`${u}-brass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6B4A0E" />
          <stop offset="0.3" stopColor="#C9971F" />
          <stop offset="0.5" stopColor="#FFE58A" />
          <stop offset="0.7" stopColor="#C9971F" />
          <stop offset="1" stopColor="#5A3D0A" />
        </linearGradient>
        <linearGradient id={`${u}-china`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B8C4D8" />
          <stop offset="0.45" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#9AA8C2" />
        </linearGradient>
        <linearGradient id={`${u}-tea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F08A2C" />
          <stop offset="1" stopColor="#7A260A" />
        </linearGradient>
        <radialGradient id={`${u}-coal`}>
          <stop offset="0" stopColor="#FFC56B" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F04E37" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-warm`}>
          <stop offset="0" stopColor="#FFB347" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFB347" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${u}-body`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`${u}-glass`}>
          <path d={glass} />
        </clipPath>
        <filter id={`${u}-soft`} x="-80%" y="-40%" width="260%" height="180%">
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
      </defs>

      <SkyCue u={u} night={night} x={-23} y={-24} />
      {/* at night the samovar gives off a soft warm glow */}
      {night && <ellipse cx="-2" cy="-2" rx="22" ry="18" fill={`url(#${u}-warm)`} className="ld-moon-glow" />}
      <Platform u={u} w={56} night={night} />

      {/* coal glow at the base */}
      <g opacity={night ? 1 : 0.55}>
        <ellipse cx="-4" cy="9" rx="9" ry="4" fill={`url(#${u}-coal)`} className="ld-flicker" />
      </g>
      <rect x="-14" y="11" width="20" height="2.4" rx="1.1" fill={brass} />
      <path d="M-11.5 11 L-8.5 6 H0.5 L3.5 11 Z" fill={brass} stroke="#5A3D0A" strokeWidth="0.4" />
      {[-7, -4, -1].map((vx) => (
        <rect key={vx} x={vx - 0.9} y="7.6" width="1.8" height="2.6" rx="0.9" fill="#FF7A1A" className="ld-coal" />
      ))}

      {/* handles */}
      <path d="M-15.6 -12.5 C-20.5 -12.5 -20.5 -6.5 -16.4 -6.5" stroke="#C9971F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M7.6 -12.5 C12.5 -12.5 12.5 -6.5 8.4 -6.5" stroke="#A87A14" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="-20" y="-10.8" width="1.6" height="2.8" rx="0.6" fill="#2F1A0B" />
      <rect x="10.4" y="-10.8" width="1.6" height="2.8" rx="0.6" fill="#2F1A0B" />

      {/* copper body with bands, medallion and travelling shine */}
      <path d={body} fill={`url(#${u}-copper)`} stroke="#4A140A" strokeWidth="0.7" />
      <g clipPath={`url(#${u}-body)`}>
        <rect x="-20" y="-14.2" width="32" height="2.2" fill={brass} />
        <rect x="-20" y="2.6" width="32" height="1.6" fill={brass} />
        <rect x="-5" y="-18" width="3.5" height="28" fill="#FFFFFF" opacity={night ? 0.4 : 0.55} className="ld-shine" />
      </g>
      <path d="M-13.6 -10 C-15 -5 -15 0 -12.6 4" stroke="#FFD0C0" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity={night ? 0.45 : 0.65} />
      <circle cx="-4" cy="-5" r="3.4" fill={brass} stroke="#6B4A0E" strokeWidth="0.5" />
      <polygon points="-4,-7.4 -1.6,-5 -4,-2.6 -6.4,-5" fill="#F04E37" />
      <circle cx="-4" cy="-5" r="0.8" fill="#FFE58A" />

      {/* tap */}
      <path d="M8.4 -1 H11.2 Q12.4 -1 12.4 0.4 V2" stroke="#C9971F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M10 -1 V-3.2 M8.8 -3.2 H11.2" stroke="#E7B83A" strokeWidth="1" strokeLinecap="round" />

      {/* crown + teapot */}
      <path d="M-12 -14 L-9.5 -18 H1.5 L4 -14 Z" fill={brass} stroke="#6B4A0E" strokeWidth="0.5" />
      <rect x="-10.5" y="-19.4" width="13" height="1.6" rx="0.8" fill={brass} />
      <path d="M-8.8 -24 C-12 -24 -12 -20.5 -8.8 -20.8" stroke="#CBD5E1" strokeWidth="1" fill="none" />
      <path d="M0.6 -21.5 C3 -22 3.6 -24.5 5.2 -25.8" stroke="#E2E8F0" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path
        d="M-9 -19.5 C-10 -24 -7.5 -26.5 -4 -26.5 C-0.5 -26.5 2 -24 1 -19.5 Z"
        fill={`url(#${u}-china)`}
        stroke="#94A3B8"
        strokeWidth="0.5"
      />
      <circle cx="-4" cy="-22.8" r="1.3" fill="#F04E37" />
      <circle cx="-4" cy="-22.8" r="0.5" fill="#FFC800" />
      <ellipse cx="-4" cy="-26.6" rx="2.8" ry="0.9" fill="#E2E8F0" />
      <circle cx="-4" cy="-27.8" r="0.9" fill="#FFC800" />

      {/* tea glass (armudu) on a saucer */}
      <ellipse cx="12.4" cy="13" rx="5.2" ry="1.1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.4" />
      <g clipPath={`url(#${u}-glass)`}>
        <rect x="8" y="6.3" width="9" height="7" fill={`url(#${u}-tea)`} />
      </g>
      <path d={glass} fill="#FFFFFF" fillOpacity="0.12" stroke="#E2E8F0" strokeOpacity="0.75" strokeWidth="0.55" />
      <path d="M10 5.4 C10 6.8 11.6 7.6 11.6 9" stroke="#FFFFFF" strokeWidth="0.5" fill="none" opacity="0.55" />
      <circle cx="12.4" cy="2.6" r="0.75" fill="#CFEFFF" className="ld-drip" />
      <ellipse cx="12.4" cy="6.4" rx="2.2" ry="0.5" fill="none" stroke="#FFD7A8" strokeWidth="0.5" className="ld-ripple" />

      {/* steam */}
      <g transform="translate(5.6 -27)" filter={`url(#${u}-soft)`}>
        <path d={wisp} stroke="#F8FAFC" strokeWidth="1.1" strokeLinecap="round" fill="none" className="ld-steam-1" />
      </g>
      <g transform="translate(3.6 -27.5)" filter={`url(#${u}-soft)`}>
        <path d={wisp} stroke="#F8FAFC" strokeWidth="0.9" strokeLinecap="round" fill="none" className="ld-steam-2" />
      </g>
      <g transform="translate(12.4 3.6) scale(0.6)" filter={`url(#${u}-soft)`}>
        <path d={wisp} stroke="#F8FAFC" strokeWidth="1.2" strokeLinecap="round" fill="none" className="ld-steam-3" />
      </g>
    </>
  );
}

/* --------------------------------------------------------------- mountains */

function Mountains({ night }: SceneProps) {
  const u = useUid("mt");
  const rays = sunRays(11, -15, 9, 12.4, 10.8);
  const stars: Array<[number, number, number, string]> = [
    [-24, -20, 0.6, "ld-twinkle-1"],
    [-3, -31, 0.45, "ld-twinkle-2"],
    [25, -29, 0.5, "ld-twinkle-3"],
    [-15, -30, 0.35, "ld-twinkle-2"],
  ];
  return (
    <>
      <defs>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor="#FFD27A" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#F04E37" stopOpacity="0.35" />
          <stop offset="1" stopColor="#F04E37" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-mglow`}>
          <stop offset="0" stopColor="#DCE6FF" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#8FA6E0" stopOpacity="0.2" />
          <stop offset="1" stopColor="#8FA6E0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-sun`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#FFF6C2" />
          <stop offset="0.5" stopColor="#FFC800" />
          <stop offset="1" stopColor="#FF7A1A" />
        </radialGradient>
        <radialGradient id={`${u}-moon`} cx="0.38" cy="0.35">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.65" stopColor="#E3E9F6" />
          <stop offset="1" stopColor="#B7C3DD" />
        </radialGradient>
        <linearGradient id={`${u}-lit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#3A4F80" : "#5D7AB8"} />
          <stop offset="1" stopColor={night ? "#1B2849" : "#2C3F6E"} />
        </linearGradient>
        <linearGradient id={`${u}-dark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#1B2849" : "#2C3F6E"} />
          <stop offset="1" stopColor={night ? "#0B1328" : "#16223F"} />
        </linearGradient>
        <linearGradient id={`${u}-snow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#E6ECF8" : "#FFFFFF"} />
          <stop offset="1" stopColor={night ? "#A8B8D8" : "#DCE4F2"} />
        </linearGradient>
        <linearGradient id={`${u}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={night ? "#7F93C2" : "#A9B8D9"} stopOpacity="0" />
          <stop offset="0.5" stopColor={night ? "#7F93C2" : "#A9B8D9"} stopOpacity={night ? 0.3 : 0.45} />
          <stop offset="1" stopColor={night ? "#7F93C2" : "#A9B8D9"} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}-trail`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.95" />
        </linearGradient>
        <filter id={`${u}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${u}-soft`} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>

      {night ? (
        <>
          {/* stars, a shooting star now and then, full moon */}
          {stars.map(([cx, cy, r, cls], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#F8FAFC" className={cls} />
          ))}
          <g transform="translate(-22 -30) rotate(22)">
            <path d="M-9 0 H0" stroke={`url(#${u}-trail)`} strokeWidth="0.7" strokeLinecap="round" className="ld-shooting" />
          </g>
          <circle cx="11" cy="-15" r="15" fill={`url(#${u}-mglow)`} filter={`url(#${u}-blur)`} className="ld-sun-glow" />
          <circle cx="11" cy="-15" r="6.2" fill={`url(#${u}-moon)`} />
          <circle cx="9" cy="-16.8" r="1.3" fill="#B7C3DD" opacity="0.7" />
          <circle cx="13.4" cy="-13.4" r="1.7" fill="#B7C3DD" opacity="0.55" />
          <circle cx="12.6" cy="-18" r="0.7" fill="#B7C3DD" opacity="0.6" />
          <circle cx="8.6" cy="-12.6" r="0.6" fill="#B7C3DD" opacity="0.6" />
        </>
      ) : (
        <>
          {/* sun */}
          <circle cx="11" cy="-15" r="17" fill={`url(#${u}-glow)`} filter={`url(#${u}-blur)`} className="ld-sun-glow" />
          <g className="ld-rays">
            <path d={rays} stroke="#FFD27A" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
          </g>
          <circle cx="11" cy="-15" r="6.8" fill={`url(#${u}-sun)`} />
        </>
      )}

      {/* drifting cloud */}
      <g className="ld-cloud-slow">
        <path
          d="M-29 -6 H-17 A3 3 0 0 0 -18 -12 A4 4 0 0 0 -25.5 -12.5 A3 3 0 0 0 -29 -6 Z"
          fill={night ? "#2C3E6B" : "#D5DEEF"}
          opacity={night ? 0.9 : 0.8}
        />
      </g>

      <ellipse cx="0" cy="19" rx="31" ry="2.6" fill="#000" opacity="0.3" />

      {/* back peak: shaded left face, lit right face, snow cap */}
      <polygon points="-29,18 -7,-17 15,18" fill={`url(#${u}-dark)`} stroke="#0E1730" strokeWidth="0.8" strokeLinejoin="round" />
      <polygon points="-7,-17 15,18 -1,18 -3.5,7 -6,-1" fill={`url(#${u}-lit)`} />
      <polygon points="-7,-17 -13.6,-6.5 -10.5,-7.8 -8.5,-4.5 -6,-7.6 -3,-5 -0.7,-7" fill={`url(#${u}-snow)`} />
      <polygon points="-7,-17 -13.6,-6.5 -10.5,-7.8 -8.5,-4.5 -7.2,-9" fill={night ? "#7E91B8" : "#A9B8D3"} />
      <path d="M-13 3 L-10 0 M-18 10 L-14 7 M-6 8 L-4 11" stroke="#0E1730" strokeWidth="0.6" opacity="0.6" />

      {/* front peak */}
      <polygon points="2,18 16,-4 30,18" fill={`url(#${u}-dark)`} stroke="#0B132B" strokeWidth="0.8" strokeLinejoin="round" />
      <polygon points="16,-4 30,18 20,18 18,8" fill={`url(#${u}-lit)`} opacity="0.85" />
      <polygon points="16,-4 11.5,3 13.5,2 15,4.5 17,2 18.8,3.6 20.5,3" fill={`url(#${u}-snow)`} />
      <polygon points="16,-4 11.5,3 13.5,2 15,4.5 15.6,-1" fill={night ? "#7E91B8" : "#A9B8D3"} />

      {/* village lights twinkle on the slope at night */}
      {night && (
        <>
          <circle cx="-14" cy="13" r="0.6" fill="#FFC800" className="ld-win-1" />
          <circle cx="-11.6" cy="14.2" r="0.5" fill="#FFB347" className="ld-win-2" />
          <circle cx="22" cy="13.6" r="0.55" fill="#FFC800" className="ld-win-2" />
        </>
      )}

      {/* mist */}
      <ellipse cx="-2" cy="13" rx="24" ry="3" fill={`url(#${u}-mist)`} filter={`url(#${u}-soft)`} className="ld-mist-1" />
      <ellipse cx="10" cy="6" rx="13" ry="1.8" fill={`url(#${u}-mist)`} filter={`url(#${u}-soft)`} className="ld-mist-2" />

      {/* eagle (daytime only): soaring path + flap-flap-glide wings */}
      {!night && (
        <g transform="translate(-13 -24)">
          <g className="ld-eagle">
            <g className="ld-wing-l">
              <path d="M0 0 C-2 -3 -6 -4 -10.5 -2.4 C-8 -1.9 -6.3 -1 -5.8 0.3 C-4.2 -0.5 -2 0 0 1 Z" fill="#E2E8F0" />
              <path d="M-10.5 -2.4 C-9 -2 -8 -1.6 -7.4 -1 L-9.4 -1.3 Z" fill="#94A3B8" />
            </g>
            <g className="ld-wing-r">
              <path d="M0 0 C2 -3 6 -4 10.5 -2.4 C8 -1.9 6.3 -1 5.8 0.3 C4.2 -0.5 2 0 0 1 Z" fill="#CBD5E1" />
              <path d="M10.5 -2.4 C9 -2 8 -1.6 7.4 -1 L9.4 -1.3 Z" fill="#94A3B8" />
            </g>
            <ellipse cx="0" cy="0.6" rx="1.3" ry="2.3" fill="#F8FAFC" />
            <circle cx="0" cy="-1.7" r="1" fill="#FFFFFF" />
            <path d="M-1 2.6 L0 4.4 L1 2.6 Z" fill="#CBD5E1" />
          </g>
        </g>
      )}
    </>
  );
}
