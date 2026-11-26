'use client';

import { useId } from 'react';
import { useTheme } from '@/components/theme/theme-provider';

/**
 * Deterministic starfield for the upper twilight sky and lower valley sky
 * [cx (0..448), cy (0..1900), radius, color, twinkleDelay, hasCrossGlint]
 */
const TWILIGHT_STARS: Array<
  [number, number, number, string, string, boolean?]
> = [
  [28, 22, 1.1, '#F8FAFC', '0.2s'],
  [92, 18, 1.4, '#FFE082', '1.1s', true],
  [164, 14, 0.9, '#BAE6FD', '2.3s'],
  [248, 20, 1.2, '#F8FAFC', '0.7s'],
  [336, 15, 1.5, '#F8FAFC', '1.8s', true],
  [412, 26, 1.0, '#FFE082', '2.9s'],
  [18, 118, 1.2, '#BAE6FD', '1.4s'],
  [426, 126, 1.3, '#F8FAFC', '0.5s'],
  [46, 162, 1.5, '#FFE082', '2.1s', true],
  [128, 152, 0.9, '#F8FAFC', '0.9s'],
  [310, 148, 1.1, '#BAE6FD', '1.6s'],
  [392, 168, 1.4, '#F8FAFC', '2.7s'],
  [24, 214, 1.0, '#F8FAFC', '0.3s'],
  [84, 228, 1.6, '#BAE6FD', '1.9s', true],
  [284, 206, 1.1, '#FFE082', '2.4s'],
  [358, 222, 1.5, '#F8FAFC', '0.8s', true],
  [424, 238, 0.9, '#F8FAFC', '1.3s'],
  [38, 278, 1.3, '#F8FAFC', '2.6s'],
  [116, 294, 1.0, '#FFE082', '0.4s'],
  [208, 286, 1.4, '#BAE6FD', '1.7s', true],
  [298, 272, 1.1, '#F8FAFC', '2.2s'],
  [408, 298, 1.3, '#FFE082', '1.0s'],
  [62, 338, 1.1, '#F8FAFC', '1.5s'],
  [154, 344, 0.9, '#BAE6FD', '2.8s'],
  [334, 336, 1.2, '#F8FAFC', '0.6s'],
  [418, 356, 1.0, '#F8FAFC', '2.0s'],
  // Second deep-valley star band further down the scroll (y = 740..1180)
  [32, 760, 1.2, '#F8FAFC', '0.5s'],
  [104, 792, 1.5, '#FFE082', '1.8s', true],
  [352, 775, 1.1, '#BAE6FD', '2.4s'],
  [416, 812, 1.3, '#F8FAFC', '0.9s'],
  [48, 868, 1.0, '#BAE6FD', '1.3s'],
  [296, 854, 1.4, '#F8FAFC', '2.7s', true],
  [394, 895, 1.1, '#FFE082', '0.3s'],
  [26, 948, 1.3, '#F8FAFC', '2.1s'],
  [118, 976, 0.9, '#F8FAFC', '1.0s'],
  [346, 962, 1.2, '#BAE6FD', '1.6s'],
  [422, 1008, 1.4, '#FFE082', '2.5s', true],
  // Lower valley stars near exam (y = 1420..1760)
  [34, 1445, 1.2, '#BAE6FD', '0.8s'],
  [96, 1490, 1.4, '#F8FAFC', '2.2s', true],
  [368, 1468, 1.1, '#FFE082', '1.4s'],
  [418, 1530, 1.2, '#F8FAFC', '0.4s'],
  [44, 1615, 1.0, '#F8FAFC', '1.9s'],
  [386, 1640, 1.3, '#BAE6FD', '2.6s'],
];

/**
 * Warm golden window/lantern lights of distant mountain Lezgi auls on the slopes
 * [cx, cy, radius, opacity, delay]
 */
const AUL_LIGHTS: Array<[number, number, number, number, string]> = [
  // Upper-left mountain slope cluster (y ~ 500..520)
  [68, 504, 1.4, 0.92, '0.2s'],
  [75, 507, 1.1, 0.78, '1.5s'],
  [82, 502, 1.5, 0.95, '0.8s'],
  [89, 508, 1.0, 0.72, '2.3s'],
  [78, 512, 1.2, 0.85, '1.1s'],
  [62, 510, 1.0, 0.68, '2.7s'],
  // Upper-right ridge cluster (y ~ 482..496)
  [264, 484, 1.3, 0.88, '0.6s'],
  [272, 488, 1.5, 0.94, '1.9s'],
  [280, 485, 1.1, 0.76, '0.3s'],
  [269, 493, 1.2, 0.82, '2.4s'],
  // Second distant aul along the lower canyon slope (y ~ 1218..1236)
  [344, 1220, 1.4, 0.9, '0.9s'],
  [352, 1224, 1.2, 0.8, '2.1s'],
  [360, 1219, 1.5, 0.94, '0.4s'],
  [367, 1226, 1.0, 0.74, '1.7s'],
  [355, 1230, 1.2, 0.84, '2.8s'],
  [82, 1244, 1.3, 0.86, '1.2s'],
  [90, 1248, 1.1, 0.75, '2.5s'],
  [97, 1243, 1.4, 0.9, '0.7s'],
];

export function LearnTwilightBackdrop() {
  const { theme } = useTheme();
  const isNight = theme === 'dark';
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 448 1920"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          {isNight ? (
            <>
              <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#070B1E" />
                <stop offset="12%" stopColor="#121840" />
                <stop offset="21%" stopColor="#2A1D4B" />
                <stop offset="27%" stopColor="#462445" />
                <stop offset="35%" stopColor="#121633" />
                <stop offset="48%" stopColor="#0A1026" />
                <stop offset="60%" stopColor="#1E1B42" />
                <stop offset="66%" stopColor="#382042" />
                <stop offset="76%" stopColor="#0F1530" />
                <stop offset="100%" stopColor="#080C1E" />
              </linearGradient>

              <radialGradient
                id={`${uid}-dusk-1`}
                cx="50%"
                cy="23%"
                r="42%"
              >
                <stop offset="0%" stopColor="#FB923C" stopOpacity="0.28" />
                <stop offset="52%" stopColor="#F43F5E" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#121840" stopOpacity="0" />
              </radialGradient>

              <radialGradient
                id={`${uid}-dusk-2`}
                cx="50%"
                cy="63%"
                r="40%"
              >
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                <stop offset="55%" stopColor="#A855F7" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0A1026" stopOpacity="0" />
              </radialGradient>
            </>
          ) : (
            <>
              <linearGradient id={`${uid}-day-sky`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EBF3FC" />
                <stop offset="16%" stopColor="#F5F8FD" />
                <stop offset="26%" stopColor="#FFF2E2" />
                <stop offset="38%" stopColor="#EDF3FB" />
                <stop offset="62%" stopColor="#FFF5E8" />
                <stop offset="100%" stopColor="#EEF3FA" />
              </linearGradient>

              <radialGradient
                id={`${uid}-day-glow`}
                cx="50%"
                cy="22%"
                r="40%"
              >
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.42" />
                <stop offset="60%" stopColor="#FED7AA" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#F5F8FD" stopOpacity="0" />
              </radialGradient>
            </>
          )}

          <filter
            id={`${uid}-cloud-blur`}
            x="-20%"
            y="-40%"
            width="140%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>

        {isNight ? (
          <>
            {/* Base Twilight Sky & Warm Horizon Afterglows */}
            <rect width="448" height="1920" fill={`url(#${uid}-sky)`} />
            <rect width="448" height="960" fill={`url(#${uid}-dusk-1)`} />
            <rect
              y="760"
              width="448"
              height="1000"
              fill={`url(#${uid}-dusk-2)`}
            />

            {/* Twinkling Stars & Delicate Cross Glints */}
            {TWILIGHT_STARS.map(([sx, sy, sr, col, delay, glint], idx) => (
              <g
                key={idx}
                className="duo-sky-twinkle"
                style={{ animationDelay: delay }}
              >
                <circle cx={sx} cy={sy} r={sr} fill={col} />
                {glint && (
                  <path
                    d={`M${sx - 3.5} ${sy} H${sx + 3.5} M${sx} ${sy - 3.5} V${sy + 3.5}`}
                    stroke={col}
                    strokeWidth="0.55"
                    opacity="0.65"
                  />
                )}
              </g>
            ))}

            {/* === UPPER VISTA (behind lessons 1–4) === */}
            {/* Far dusk mountain range */}
            <path
              d="M -16 446 L 62 388 L 132 424 L 218 358 L 302 414 L 382 368 L 464 406 V 720 H -16 Z"
              fill="#1D1A3F"
            />

            {/* Drifting Sea of Clouds nestled in the valley */}
            <g filter={`url(#${uid}-cloud-blur)`} opacity="0.3" fill="#E2E8F0">
              <ellipse cx="92" cy="472" rx="115" ry="18" />
              <ellipse cx="324" cy="464" rx="128" ry="20" />
              <ellipse cx="212" cy="488" rx="148" ry="17" />
            </g>

            {/* Mid-ground slope holding the distant night mountain aul */}
            <path
              d="M -16 528 L 88 478 L 174 518 L 274 464 L 370 508 L 464 474 V 760 H -16 Z"
              fill="#121633"
            />

            {/* Foreground valley silhouette blending smoothly into mid-map */}
            <path
              d="M -16 608 L 118 568 L 246 604 L 372 560 L 464 592 V 820 H -16 Z"
              fill="#0A1026"
            />

            {/* === LOWER VISTA (behind lessons 6–11 & exam) === */}
            <path
              d="M -16 1168 L 76 1108 L 168 1148 L 268 1086 L 358 1138 L 464 1096 V 1500 H -16 Z"
              fill="#1B193C"
            />

            <g filter={`url(#${uid}-cloud-blur)`} opacity="0.24" fill="#E2E8F0">
              <ellipse cx="128" cy="1194" rx="124" ry="18" />
              <ellipse cx="338" cy="1186" rx="120" ry="18" />
            </g>

            <path
              d="M -16 1256 L 96 1212 L 204 1248 L 348 1192 L 464 1236 V 1620 H -16 Z"
              fill="#111632"
            />

            <path
              d="M -16 1350 L 140 1308 L 288 1344 L 402 1304 L 464 1330 V 1920 H -16 Z"
              fill="#080C1E"
            />

            {/* Warm Golden Lights of Distant Lezgi Mountain Auls */}
            <g>
              {AUL_LIGHTS.map(([lx, ly, lr, lop, delay], idx) => (
                <g
                  key={idx}
                  className="duo-sky-twinkle"
                  style={{ animationDelay: delay }}
                >
                  <circle
                    cx={lx}
                    cy={ly}
                    r={lr * 2.4}
                    fill="#F59E0B"
                    opacity={lop * 0.22}
                  />
                  <circle cx={lx} cy={ly} r={lr} fill="#FCD34D" opacity={lop} />
                </g>
              ))}
            </g>
          </>
        ) : (
          <>
            {/* Harmonious Daylight Alpine Valley Counterpart */}
            <rect width="448" height="1920" fill={`url(#${uid}-day-sky)`} />
            <rect width="448" height="920" fill={`url(#${uid}-day-glow)`} />

            {/* Far sunlit Caucasus ridge */}
            <path
              d="M -16 446 L 62 388 L 132 424 L 218 358 L 302 414 L 382 368 L 464 406 V 720 H -16 Z"
              fill="#DCE6F5"
              opacity="0.8"
            />

            {/* Morning valley cloud mist */}
            <g filter={`url(#${uid}-cloud-blur)`} opacity="0.7" fill="#FFFFFF">
              <ellipse cx="92" cy="472" rx="115" ry="18" />
              <ellipse cx="324" cy="464" rx="128" ry="20" />
              <ellipse cx="212" cy="488" rx="148" ry="17" />
            </g>

            {/* Mid-ground sunlit ridge */}
            <path
              d="M -16 528 L 88 478 L 174 518 L 274 464 L 370 508 L 464 474 V 760 H -16 Z"
              fill="#CFDCF0"
              opacity="0.72"
            />

            <path
              d="M -16 608 L 118 568 L 246 604 L 372 560 L 464 592 V 880 H -16 Z"
              fill="#EDF3FB"
            />

            {/* Lower vista sunlit ridges */}
            <path
              d="M -16 1168 L 76 1108 L 168 1148 L 268 1086 L 358 1138 L 464 1096 V 1500 H -16 Z"
              fill="#DCE6F5"
              opacity="0.75"
            />
            <g filter={`url(#${uid}-cloud-blur)`} opacity="0.65" fill="#FFFFFF">
              <ellipse cx="128" cy="1194" rx="124" ry="18" />
              <ellipse cx="338" cy="1186" rx="120" ry="18" />
            </g>
            <path
              d="M -16 1256 L 96 1212 L 204 1248 L 348 1192 L 464 1236 V 1920 H -16 Z"
              fill="#EEF3FA"
            />
          </>
        )}
      </svg>
    </div>
  );
}
