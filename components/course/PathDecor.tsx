import { useId } from "react";

/**
 * Lezgi Learn — learning-path decorations (v2).
 * Drop-in replacement for the old decor renderer: renders an SVG <g> placed at (x, y)
 * inside the course-path <svg>. Each scene is ~60 x 60 SVG units centred on (0, 0).
 * Kinds: "campfire" | "watchtower" | "bridge" | "samovar" | anything else -> mountains.
 * All motion lives in path-decor.css (classes prefixed "ld-").
 */
export interface PathDecorItem {
  kind: string;
  x: number;
  y: number;
}

type Tri = [number, number, number];

function useUid(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

export function PathDecor({ decor }: { decor: PathDecorItem }) {
  const { kind, x, y } = decor;
  return (
    <g transform={`translate(${x}, ${y})`} className="ld-scene" aria-hidden="true">
      {kind === "campfire" ? (
        <Campfire />
      ) : kind === "watchtower" ? (
        <Watchtower />
      ) : kind === "bridge" ? (
        <Bridge />
      ) : kind === "samovar" ? (
        <Samovar />
      ) : (
        <Mountains />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ shared */

function Platform({ u, w = 54 }: { u: string; w?: number }) {
  const h = w / 2;
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-slab`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26395F" />
          <stop offset="1" stopColor="#141E3A" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="26" rx={h + 1} ry="3" fill="#000" opacity="0.35" />
      <rect x={-h} y="16" width={w} height="10" rx="5" fill="#0E1730" />
      <rect
        x={-h}
        y="12.5"
        width={w}
        height="9.5"
        rx="4.75"
        fill={`url(#${u}-slab)`}
        stroke="#2C406B"
        strokeWidth="1.2"
      />
      <path
        d={`M${-h + 5} 14.2 H${h - 5}`}
        stroke="#4A639A"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  );
}

const SPARKLE =
  "M0 -2.6 C0.25 -0.8 0.8 -0.25 2.6 0 C0.8 0.25 0.25 0.8 0 2.6 C-0.25 0.8 -0.8 0.25 -2.6 0 C-0.8 -0.25 -0.25 -0.8 0 -2.6 Z";

/* ---------------------------------------------------------------- campfire */

function Campfire() {
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
  const sparks: Array<[number, number, number, string, string]> = [
    [-3, -12, 1.2, "#FFD23F", "ld-spark-1"],
    [4, -14, 1, "#FFF6C4", "ld-spark-2"],
    [0, -18, 0.9, "#FF8A1F", "ld-spark-3"],
    [-6, -8, 0.8, "#FFD23F", "ld-spark-4"],
    [6, -9, 1.1, "#FFB347", "ld-spark-5"],
    [1, -10, 0.7, "#FFFFFF", "ld-spark-6"],
  ];
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
          <stop offset="0" stopColor="#9A6A40" />
          <stop offset="0.5" stopColor="#5E3A1E" />
          <stop offset="1" stopColor="#2F1A0B" />
        </linearGradient>
        <radialGradient id={`${u}-stone`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#6A7FA8" />
          <stop offset="0.55" stopColor="#33466F" />
          <stop offset="1" stopColor="#18233F" />
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

      <Platform u={u} w={56} />
      <ellipse cx="0" cy="15" rx="25" ry="6" fill={`url(#${u}-glow)`} className="ld-flicker" />

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

      <circle cx="0" cy="-6" r="19" fill={`url(#${u}-glow)`} filter={`url(#${u}-blur)`} className="ld-halo" />

      {/* smoke */}
      <circle cx="0" cy="-25" r="3.2" fill="#7D8DB3" filter={`url(#${u}-soft)`} className="ld-smoke-1" />
      <circle cx="1" cy="-25" r="2.8" fill="#6B7CA3" filter={`url(#${u}-soft)`} className="ld-smoke-2" />
      <circle cx="-1" cy="-25" r="3" fill="#7D8DB3" filter={`url(#${u}-soft)`} className="ld-smoke-3" />

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
          <ellipse cx={cx} cy={cy - r * 0.5} rx={r * 0.6} ry={r * 0.28} fill="#FF9A55" className="ld-rim" />
        </g>
      ))}

      {sparks.map(([cx, cy, r, c, cls]) => (
        <circle key={cls} cx={cx} cy={cy} r={r} fill={c} className={cls} />
      ))}
    </>
  );
}

/* -------------------------------------------------------------- watchtower */

function Watchtower() {
  const u = useUid("wt");
  const joints: Array<[number, number, number]> = [
    [-5, -18, -12], [4, -18, -12], [-1, -12, -6], [6, -12, -6], [-6, -6, 0],
    [2, -6, 0], [-3, 0, 6], [6, 0, 6], [-7, 6, 14], [1, 6, 14], [8, 6, 14],
  ];
  return (
    <>
      <defs>
        <linearGradient id={`${u}-stone`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#566DA2" />
          <stop offset="0.45" stopColor="#34477A" />
          <stop offset="1" stopColor="#1A2645" />
        </linearGradient>
        <linearGradient id={`${u}-house`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3A4F80" />
          <stop offset="1" stopColor="#1E2B4F" />
        </linearGradient>
        <linearGradient id={`${u}-cloud`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#33467A" />
          <stop offset="1" stopColor="#18233F" />
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

      {/* sky */}
      <circle cx="-20" cy="-22" r="10" fill={`url(#${u}-mglow)`} className="ld-moon-glow" />
      <circle cx="-20" cy="-22" r="5" fill="#F1F5F9" mask={`url(#${u}-moon)`} />
      <g transform="translate(21 -27)">
        <path d={SPARKLE} fill="#FFE58A" className="ld-twinkle-1" />
      </g>
      <g transform="translate(-25 -7) scale(0.7)">
        <path d={SPARKLE} fill="#F8FAFC" className="ld-twinkle-2" />
      </g>
      <circle cx="26" cy="-16" r="0.8" fill="#F8FAFC" className="ld-twinkle-3" />
      <g className="ld-cloud">
        <path
          d="M-28 -13 H-10 A4 4 0 0 0 -11 -21 A5.5 5.5 0 0 0 -21.5 -22 A4.2 4.2 0 0 0 -28 -13 Z"
          fill={`url(#${u}-cloud)`}
          stroke="#4A639A"
          strokeWidth="0.6"
          opacity="0.95"
        />
      </g>

      <Platform u={u} w={58} />

      {/* neighbouring house (saklya) */}
      <rect x="11" y="3" width="16" height="11" fill={`url(#${u}-house)`} />
      <path d="M11 8.5 H27" stroke="#18233F" strokeWidth="0.6" />
      <rect x="23" y="-2.5" width="2.4" height="4" fill="#2E4170" />
      <circle cx="24.2" cy="-4" r="1.3" fill="#8A9BBF" filter={`url(#${u}-soft)`} className="ld-chimney-1" />
      <circle cx="24.2" cy="-4" r="1.1" fill="#8A9BBF" filter={`url(#${u}-soft)`} className="ld-chimney-2" />
      <rect x="9.5" y="1" width="19" height="2.6" rx="0.8" fill="#4A6196" />
      {[11.5, 15, 18.5, 22, 25.5].map((cx) => (
        <circle key={cx} cx={cx} cy="4.1" r="0.6" fill="#141E3A" />
      ))}
      <rect x="15" y="6" width="4.6" height="4.6" rx="0.5" fill="#FF9A3D" className="ld-win-2" />
      <path d="M17.3 6 V10.6 M15 8.3 H19.6" stroke="#0E1730" strokeWidth="0.7" />
      <rect x="15" y="6" width="4.6" height="4.6" rx="0.5" fill="none" stroke="#0E1730" strokeWidth="0.8" />

      {/* tower */}
      <polygon points="-12,14 -9,-18 9,-18 12,14" fill={`url(#${u}-stone)`} stroke="#0E1730" strokeWidth="0.8" />
      <g clipPath={`url(#${u}-tower)`} stroke="#141E3A" strokeWidth="0.75" opacity="0.85">
        {[-12, -6, 0, 6].map((yy) => (
          <path key={yy} d={`M-13 ${yy} H13`} />
        ))}
        {joints.map(([xx, y1, y2]) => (
          <path key={`${xx}${y1}`} d={`M${xx} ${y1} V${y2}`} />
        ))}
        <polygon points="6,-18 9,-18 12,14 8,14" fill="#000" stroke="none" opacity="0.2" />
      </g>
      <path d="M-12 14 L-9 -18" stroke="#7891C4" strokeWidth="0.9" opacity="0.7" />

      {/* battlements + flag */}
      <line x1="0" y1="-25" x2="0" y2="-35" stroke="#94A3B8" strokeWidth="0.9" />
      <path
        d="M0.5 -35 C3 -36 5.5 -34 9 -35 V-30.5 C5.5 -29.5 3 -31.5 0.5 -30.5 Z"
        fill="#F04E37"
        className="ld-flag"
      />
      <rect x="-11.5" y="-21.4" width="23" height="3.6" rx="0.6" fill="#2E4170" stroke="#0E1730" strokeWidth="0.6" />
      {[-10, -6, -2, 2, 6].map((xx) => (
        <rect key={xx} x={xx} y="-17.9" width="2.2" height="1.5" fill="#22325A" />
      ))}
      {[-11.5, -2.5, 6.5].map((xx) => (
        <rect key={xx} x={xx} y="-25.2" width="5" height="4" fill="#3B5284" stroke="#0E1730" strokeWidth="0.6" />
      ))}

      {/* warm window */}
      <circle cx="0" cy="-4" r="10" fill={`url(#${u}-wglow)`} filter={`url(#${u}-blur)`} className="ld-win-glow" />
      <path d="M-3.2 0 V-6 A3.2 3.2 0 0 1 3.2 -6 V0 Z" fill={`url(#${u}-win)`} className="ld-win-1" />
      <path d="M0 -9.2 V0 M-3.2 -4 H3.2" stroke="#7A4A1A" strokeWidth="0.7" />
      <path d="M-3.2 0 V-6 A3.2 3.2 0 0 1 3.2 -6 V0 Z" fill="none" stroke="#0E1730" strokeWidth="1.1" />
      <rect x="-4.2" y="-0.2" width="8.4" height="1.3" rx="0.4" fill="#4A639A" />
      <rect x="-0.9" y="-15" width="1.8" height="4" rx="0.9" fill="#0B132B" />
      <path d="M-3 14 V10.5 A3 3 0 0 1 3 10.5 V14 Z" fill="#0B132B" stroke="#4A639A" strokeWidth="0.6" />
    </>
  );
}

/* ------------------------------------------------------------------ bridge */

function Bridge() {
  const u = useUid("br");
  const wave = (y: number) => `M-44 ${y} Q-38 ${y - 2} -32 ${y} T-20 ${y} T-8 ${y} T4 ${y} T16 ${y} T28 ${y} T40 ${y}`;
  return (
    <>
      <defs>
        <linearGradient id={`${u}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F6A9C" />
          <stop offset="0.6" stopColor="#134070" />
          <stop offset="1" stopColor="#0D2A4F" />
        </linearGradient>
        <linearGradient id={`${u}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#566DA2" />
          <stop offset="0.55" stopColor="#34477A" />
          <stop offset="1" stopColor="#1C2849" />
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
      <rect x="-31" y="11" width="62" height="14" rx="7" fill={`url(#${u}-water)`} stroke="#1E3A66" strokeWidth="1.2" />
      <g clipPath={`url(#${u}-clip)`}>
        <path d="M-17 13 C-17 24 17 24 17 13" stroke="#5B73A6" strokeWidth="2.6" fill="none" opacity="0.35" className="ld-reflect" />
        <ellipse cx="-23" cy="17.5" rx="0.6" ry="2.4" fill="#FFD45A" opacity="0.3" className="ld-reflect-light" />
        <ellipse cx="23" cy="17.5" rx="0.6" ry="2.4" fill="#FFD45A" opacity="0.3" className="ld-reflect-light ld-delay" />
        <path d={wave(15.5)} stroke="#38BDF8" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeDasharray="5 7" className="ld-flow-1" />
        <path d={wave(19.5)} stroke="#7DD3FC" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="3 9" className="ld-flow-2" />
        <path d={wave(23)} stroke="#BAE6FD" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeDasharray="8 10" opacity="0.6" className="ld-flow-3" />
        <ellipse cx="-24" cy="21" rx="1.6" ry="0.45" fill="#E0F2FE" className="ld-glint-1" />
        <ellipse cx="6" cy="17" rx="1.4" ry="0.4" fill="#E0F2FE" className="ld-glint-2" />
        <ellipse cx="22" cy="22" rx="1.8" ry="0.45" fill="#E0F2FE" className="ld-glint-3" />
      </g>

      {/* shade under the arch + jumping fish */}
      <path d="M-17 13 C-17 -1.5 17 -1.5 17 13 Z" fill="#06102A" opacity="0.4" />
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
      <path d="M-19.1 13 C-19.1 -4.3 19.1 -4.3 19.1 13" stroke="#627BB0" strokeWidth="4" strokeDasharray="2.4 0.9" fill="none" />
      <path d="M-17 13 C-17 -1.5 17 -1.5 17 13" stroke="#0B132B" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path
        d="M-27 1 H-22 M-25 5.5 H-20.5 M-27 9.5 H-21 M22 1 H27 M20.5 5.5 H25 M21 9.5 H27 M-8 -6.5 H-2 M3 -6.5 H9"
        stroke="#1C2849"
        strokeWidth="0.7"
      />
      <path d="M-28 13.3 H-17 M17 13.3 H28" stroke="#BAE6FD" strokeWidth="0.7" opacity="0.5" className="ld-foam" />
      <path d="M-28.5 -3 Q-14 -9.8 0 -9.8 Q14 -9.8 28.5 -3" stroke="#5F78AD" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M-28 -4.3 Q-14 -11 0 -11 Q14 -11 28 -4.3" stroke="#8AA0D0" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* lanterns */}
      {[-23, 23].map((lx, i) => (
        <g key={lx} transform={`translate(${lx} 0)`}>
          <circle cx="0" cy="-13.5" r="6.5" fill={`url(#${u}-lamp)`} filter={`url(#${u}-blur)`} className={i ? "ld-lamp-glow ld-delay" : "ld-lamp-glow"} />
          <line x1="0" y1="-5" x2="0" y2="-11.4" stroke="#94A3B8" strokeWidth="1.1" />
          <rect x="-1.8" y="-15.6" width="3.6" height="4.3" rx="0.8" fill="#FFD45A" className={i ? "ld-lamp ld-delay" : "ld-lamp"} />
          <rect x="-1.8" y="-15.6" width="3.6" height="4.3" rx="0.8" fill="none" stroke="#0E1730" strokeWidth="0.5" />
          <path d="M-2.5 -15.5 L0 -17.6 L2.5 -15.5 Z" fill="#94A3B8" />
        </g>
      ))}
      <circle cx="-8" cy="-15" r="0.7" fill="#FDE68A" className="ld-firefly-1" />
      <circle cx="10" cy="-18" r="0.6" fill="#FDE68A" className="ld-firefly-2" />
    </>
  );
}

/* ----------------------------------------------------------------- samovar */

function Samovar() {
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
          <stop offset="0.47" stopColor="#FFA387" />
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

      <Platform u={u} w={56} />

      {/* coal glow at the base */}
      <ellipse cx="-4" cy="9" rx="9" ry="4" fill={`url(#${u}-coal)`} className="ld-flicker" />
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
        <rect x="-5" y="-18" width="3.5" height="28" fill="#FFFFFF" opacity="0.4" className="ld-shine" />
      </g>
      <path d="M-13.6 -10 C-15 -5 -15 0 -12.6 4" stroke="#FFD0C0" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45" />
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

function Mountains() {
  const u = useUid("mt");
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r1 = 9;
    const r2 = i % 2 ? 10.8 : 12.4;
    return `M${(11 + Math.cos(a) * r1).toFixed(2)} ${(-15 + Math.sin(a) * r1).toFixed(2)} L${(11 + Math.cos(a) * r2).toFixed(2)} ${(-15 + Math.sin(a) * r2).toFixed(2)}`;
  }).join(" ");
  return (
    <>
      <defs>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor="#FFD27A" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#F04E37" stopOpacity="0.35" />
          <stop offset="1" stopColor="#F04E37" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-sun`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#FFF6C2" />
          <stop offset="0.5" stopColor="#FFC800" />
          <stop offset="1" stopColor="#FF7A1A" />
        </radialGradient>
        <linearGradient id={`${u}-lit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A639A" />
          <stop offset="1" stopColor="#22335E" />
        </linearGradient>
        <linearGradient id={`${u}-dark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22335E" />
          <stop offset="1" stopColor="#111A33" />
        </linearGradient>
        <linearGradient id={`${u}-snow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCE4F2" />
        </linearGradient>
        <linearGradient id={`${u}-mist`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#A9B8D9" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A9B8D9" stopOpacity="0.45" />
          <stop offset="1" stopColor="#A9B8D9" stopOpacity="0" />
        </linearGradient>
        <filter id={`${u}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${u}-soft`} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>

      {/* sun */}
      <circle cx="11" cy="-15" r="17" fill={`url(#${u}-glow)`} filter={`url(#${u}-blur)`} className="ld-sun-glow" />
      <g className="ld-rays">
        <path d={rays} stroke="#FFD27A" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
      </g>
      <circle cx="11" cy="-15" r="6.8" fill={`url(#${u}-sun)`} />

      {/* drifting cloud */}
      <g className="ld-cloud-slow">
        <path d="M-29 -6 H-17 A3 3 0 0 0 -18 -12 A4 4 0 0 0 -25.5 -12.5 A3 3 0 0 0 -29 -6 Z" fill="#2C3E6B" opacity="0.9" />
      </g>

      <ellipse cx="0" cy="19" rx="31" ry="2.6" fill="#000" opacity="0.3" />

      {/* back peak: shaded left face, sun-lit right face, snow cap */}
      <polygon points="-29,18 -7,-17 15,18" fill={`url(#${u}-dark)`} stroke="#0E1730" strokeWidth="0.8" strokeLinejoin="round" />
      <polygon points="-7,-17 15,18 -1,18 -3.5,7 -6,-1" fill={`url(#${u}-lit)`} />
      <polygon points="-7,-17 -13.6,-6.5 -10.5,-7.8 -8.5,-4.5 -6,-7.6 -3,-5 -0.7,-7" fill={`url(#${u}-snow)`} />
      <polygon points="-7,-17 -13.6,-6.5 -10.5,-7.8 -8.5,-4.5 -7.2,-9" fill="#A9B8D3" />
      <path d="M-13 3 L-10 0 M-18 10 L-14 7 M-6 8 L-4 11" stroke="#0E1730" strokeWidth="0.6" opacity="0.6" />

      {/* front peak */}
      <polygon points="2,18 16,-4 30,18" fill={`url(#${u}-dark)`} stroke="#0B132B" strokeWidth="0.8" strokeLinejoin="round" />
      <polygon points="16,-4 30,18 20,18 18,8" fill={`url(#${u}-lit)`} opacity="0.85" />
      <polygon points="16,-4 11.5,3 13.5,2 15,4.5 17,2 18.8,3.6 20.5,3" fill={`url(#${u}-snow)`} />
      <polygon points="16,-4 11.5,3 13.5,2 15,4.5 15.6,-1" fill="#A9B8D3" />

      {/* mist */}
      <ellipse cx="-2" cy="13" rx="24" ry="3" fill={`url(#${u}-mist)`} filter={`url(#${u}-soft)`} className="ld-mist-1" />
      <ellipse cx="10" cy="6" rx="13" ry="1.8" fill={`url(#${u}-mist)`} filter={`url(#${u}-soft)`} className="ld-mist-2" />

      {/* eagle: soaring path + flap-flap-glide wings */}
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
    </>
  );
}
