/**
 * Lezgi Learn — scenery animations (v3).
 * Self-contained HTML/SVG + pure CSS scenes prefixed with `lz-`.
 * Maps the 5 course-path decor slots to: bonfire, tree, eagle, teapot, mountain.
 */
export interface PathDecorItem {
  kind: string;
  x: number;
  y: number;
}

export function PathDecor({ decor }: { decor: PathDecorItem }) {
  const { kind, x, y } = decor;

  const scene =
    kind === 'campfire' ? (
      <BonfireScene />
    ) : kind === 'watchtower' ? (
      <TreeScene />
    ) : kind === 'bridge' ? (
      <EagleScene />
    ) : kind === 'samovar' ? (
      <TeapotScene />
    ) : (
      <MountainScene />
    );

  return (
    <div
      style={{ left: x, top: y }}
      className="pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2 scale-[0.48]"
      aria-hidden="true"
    >
      {scene}
    </div>
  );
}

function MountainScene() {
  return (
    <div className="lz-scene lz-scene--mountain">
      <svg
        viewBox="0 0 220 180"
        width="220"
        height="180"
        className="lz-mountain"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lzMtnRock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b6d7c" />
            <stop offset="55%" stopColor="#42566a" />
            <stop offset="100%" stopColor="#2f4154" />
          </linearGradient>
          <linearGradient id="lzMtnGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5c6e46" />
            <stop offset="100%" stopColor="#41523a" />
          </linearGradient>
        </defs>
        <path
          className="lz-mtn-back"
          d="M64 164 L132 62 L204 164 Z"
          fill="#74869a"
          opacity=".5"
        />
        <path d="M12 164 L96 34 L184 164 Z" fill="url(#lzMtnRock)" />
        <g className="lz-mtn-snow">
          <path
            d="M96 34 L118 68 L108 63 L98 75 L88 61 L79 69 L74 68 Z"
            fill="#eef3f6"
          />
          <path
            d="M96 34 L104 47 L98 44 L96 51 L92 43 L88 48 Z"
            fill="#ffffff"
            opacity=".8"
          />
        </g>
        <path d="M96 34 L96 164 L184 164 Z" fill="#22334a" opacity=".4" />
        <path d="M96 34 L62 164 L96 164 Z" fill="#0f1e2e" opacity=".28" />
        <path
          d="M0 166 q40 -9 82 -6 q62 5 138 -3 l0 23 -220 0 Z"
          fill="url(#lzMtnGround)"
        />
        <ellipse cx="28" cy="170" rx="8" ry="3.6" fill="#77816e" />
        <ellipse cx="196" cy="167" rx="10" ry="4" fill="#6b7562" />
        <ellipse
          cx="120"
          cy="173"
          rx="6"
          ry="2.8"
          fill="#77816e"
          opacity=".8"
        />
        <g className="lz-cloud lz-cloud--1" fill="#e8dcc4">
          <ellipse cx="0" cy="0" rx="17" ry="5.5" opacity=".2" />
          <ellipse cx="13" cy="3" rx="11" ry="4" opacity=".14" />
          <ellipse cx="-13" cy="3.6" rx="9" ry="3.4" opacity=".12" />
        </g>
        <g className="lz-cloud lz-cloud--2" fill="#e8dcc4">
          <ellipse cx="0" cy="0" rx="20" ry="6" opacity=".16" />
          <ellipse cx="15" cy="3" rx="12" ry="4.4" opacity=".11" />
        </g>
        <g
          className="lz-mtn-birds"
          stroke="#e8dcc4"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          opacity=".7"
        >
          <path d="M0 0 q3 -3 6 0 q3 -3 6 0" />
          <path d="M0 0 q3 -3 6 0 q3 -3 6 0" transform="scale(.7)" />
        </g>
      </svg>
    </div>
  );
}

function BonfireScene() {
  return (
    <div className="lz-scene lz-scene--fire">
      <div className="lz-fire" aria-hidden="true">
        <div className="lz-fire__ground">
          <span className="lz-stone lz-stone--1" />
          <span className="lz-stone lz-stone--2" />
          <span className="lz-stone lz-stone--3" />
          <div className="lz-fire__ground-light" />
        </div>
        <div className="lz-fire__smoke">
          <i />
          <i />
          <i />
        </div>
        <div className="lz-fire__glow" />
        <div className="lz-fire__flames">
          <span className="lz-flame lz-flame--1" />
          <span className="lz-flame lz-flame--2" />
          <span className="lz-flame lz-flame--3" />
          <span className="lz-flame lz-flame--4" />
          <span className="lz-flame lz-flame--5" />
        </div>
        <div className="lz-fire__sparks">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="lz-fire__embers">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="lz-fire__logs">
          <span className="lz-log lz-log--1" />
          <span className="lz-log lz-log--2" />
          <span className="lz-log lz-log--3" />
        </div>
      </div>
    </div>
  );
}

function TeapotScene() {
  return (
    <div className="lz-scene lz-scene--teapot">
      <svg
        viewBox="0 0 200 200"
        width="200"
        height="200"
        className="lz-teapot"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lzPotBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b57c3e" />
            <stop offset="45%" stopColor="#8f5c2a" />
            <stop offset="100%" stopColor="#6b4320" />
          </linearGradient>
          <linearGradient id="lzPotShine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity=".3" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g
          className="lz-steam"
          stroke="#e8dcc4"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          opacity=".5"
        >
          <path
            className="lz-steam__puff lz-steam__puff--1"
            d="M100 118 q-6 -10 0 -20 q6 -10 0 -20"
          />
          <path
            className="lz-steam__puff lz-steam__puff--2"
            d="M86 112 q-5 -9 0 -18 q5 -9 0 -18"
          />
          <path
            className="lz-steam__puff lz-steam__puff--3"
            d="M114 112 q5 -9 0 -18 q-5 -9 0 -18"
          />
        </g>
        <g className="lz-rug">
          <rect x="46" y="152" width="108" height="18" rx="9" fill="#8a4a3a" />
          <line
            x1="54"
            y1="157"
            x2="146"
            y2="157"
            stroke="#e8dcc4"
            strokeWidth="1.2"
            opacity=".55"
          />
          <line
            x1="54"
            y1="165"
            x2="146"
            y2="165"
            stroke="#e8dcc4"
            strokeWidth="1.2"
            opacity=".55"
          />
          <circle cx="64" cy="161" r="2.2" fill="#e8dcc4" opacity=".5" />
          <circle cx="136" cy="161" r="2.2" fill="#e8dcc4" opacity=".5" />
        </g>
        <path
          d="M52 96 q-16 -4 -20 -22 l10 -4 q4 12 16 16 Z"
          fill="url(#lzPotBody)"
        />
        <path
          d="M148 82 q26 8 22 34 l-9 -2 q3 -19 -17 -24 Z"
          fill="#6b4320"
        />
        <ellipse cx="100" cy="120" rx="52" ry="40" fill="url(#lzPotBody)" />
        <ellipse
          cx="100"
          cy="118"
          rx="52"
          ry="38"
          fill="url(#lzPotShine)"
          opacity=".5"
        />
        <ellipse cx="100" cy="82" rx="26" ry="9" fill="#b57c3e" />
        <rect x="94" y="66" width="12" height="14" rx="5" fill="#7c4f26" />
        <circle cx="100" cy="63" r="7" fill="#b57c3e" />
        <g className="lz-teapot__ornament">
          <line
            x1="58"
            y1="130"
            x2="142"
            y2="130"
            stroke="#e8dcc4"
            strokeWidth="1"
            opacity=".4"
          />
          <path
            d="M70 124 l6 6 -6 6 -6 -6 Z"
            fill="none"
            stroke="#e8dcc4"
            strokeWidth="1.3"
          />
          <path
            d="M86 124 l6 6 -6 6 -6 -6 Z"
            fill="#e8dcc4"
            opacity=".65"
          />
          <path
            d="M100 122 l8 8 -8 8 -8 -8 Z"
            fill="none"
            stroke="#e8dcc4"
            strokeWidth="1.6"
          />
          <path
            d="M114 124 l6 6 -6 6 -6 -6 Z"
            fill="#e8dcc4"
            opacity=".65"
          />
          <path
            d="M130 124 l6 6 -6 6 -6 -6 Z"
            fill="none"
            stroke="#e8dcc4"
            strokeWidth="1.3"
          />
          <circle cx="78" cy="136" r="1.4" fill="#e8dcc4" opacity=".6" />
          <circle cx="100" cy="138" r="1.6" fill="#e8dcc4" opacity=".7" />
          <circle cx="122" cy="136" r="1.4" fill="#e8dcc4" opacity=".6" />
        </g>
      </svg>
    </div>
  );
}

function EagleScene() {
  return (
    <div className="lz-scene lz-scene--eagle">
      <svg
        viewBox="0 0 200 150"
        width="200"
        height="150"
        className="lz-eagle"
        aria-hidden="true"
      >
        <g className="lz-eagle__rig">
          <g className="lz-wing lz-wing--far">
            <path
              d="M118 62 Q68 20 28 34 Q68 44 92 72 Q106 80 118 74 Z"
              fill="#3a4a5c"
            />
          </g>
          <g className="lz-eagle__body">
            <ellipse cx="118" cy="72" rx="12" ry="20" fill="#2c3a4a" />
            <circle cx="118" cy="50" r="8" fill="#e8dcc4" />
            <path d="M118 50 l12 3 -12 4 Z" fill="#cf9a3e" />
            <circle cx="121" cy="48" r="1.6" fill="#1c2733" />
            <path d="M113 88 q5 8 10 0 l-2 10 -6 0 Z" fill="#cf9a3e" />
          </g>
          <g className="lz-wing lz-wing--near">
            <path
              d="M118 62 Q168 22 196 34 Q160 44 140 74 Q128 82 118 74 Z"
              fill="#46586b"
            />
            <path
              d="M118 64 Q162 30 190 38 Q152 48 138 74 Z"
              fill="#5d7385"
              opacity=".55"
            />
          </g>
        </g>
        <ellipse
          className="lz-eagle__shadow"
          cx="86"
          cy="142"
          rx="30"
          ry="5"
          fill="#000"
          opacity=".35"
        />
      </svg>
    </div>
  );
}

function TreeScene() {
  return (
    <div className="lz-scene lz-scene--tree">
      <svg
        viewBox="0 0 200 210"
        width="200"
        height="210"
        className="lz-tree"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lzMtnGround2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5c6e46" />
            <stop offset="100%" stopColor="#41523a" />
          </linearGradient>
        </defs>
        <path
          d="M96 202 q3 -30 -2 -52 q-2 -14 -8 -24 l8 -4 q4 10 6 20 q2 -10 6 -20 l8 4 q-6 12 -7 26 q-2 22 1 50 Z"
          fill="#54432f"
        />
        <path
          d="M94 128 q-16 -10 -26 -26"
          stroke="#54432f"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M108 124 q18 -12 26 -30"
          stroke="#54432f"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <g className="lz-crown">
          <ellipse
            cx="64"
            cy="92"
            rx="28"
            ry="20"
            fill="#3f6238"
            transform="rotate(-8 64 92)"
          />
          <ellipse
            cx="138"
            cy="88"
            rx="30"
            ry="22"
            fill="#4a7440"
            transform="rotate(7 138 88)"
          />
          <ellipse cx="100" cy="56" rx="38" ry="26" fill="#547f46" />
          <ellipse
            cx="82"
            cy="76"
            rx="30"
            ry="22"
            fill="#4a7440"
            transform="rotate(-4 82 76)"
          />
          <ellipse
            cx="122"
            cy="70"
            rx="28"
            ry="20"
            fill="#5f8f4e"
            transform="rotate(5 122 70)"
          />
          <ellipse
            cx="100"
            cy="88"
            rx="42"
            ry="24"
            fill="#3f6238"
            opacity=".85"
          />
          <circle cx="72" cy="58" r="5" fill="#6b9c56" />
          <circle cx="130" cy="50" r="6" fill="#6b9c56" />
          <circle cx="104" cy="40" r="5" fill="#7ba663" />
          <circle cx="60" cy="80" r="4" fill="#6b9c56" />
          <circle cx="146" cy="72" r="4.4" fill="#7ba663" />
        </g>
        <g className="lz-leaves">
          <path
            className="lz-leaf lz-leaf--1"
            d="M0 0 q4 -6 8 0 q-4 6 -8 0 Z"
            fill="#6f9e5a"
          />
          <path
            className="lz-leaf lz-leaf--2"
            d="M0 0 q4 -6 8 0 q-4 6 -8 0 Z"
            fill="#8fb06a"
          />
          <path
            className="lz-leaf lz-leaf--3"
            d="M0 0 q4 -6 8 0 q-4 6 -8 0 Z"
            fill="#5f8f4e"
          />
        </g>
        <path
          d="M0 192 q44 -8 92 -5 q56 4 108 -3 l0 26 -200 0 Z"
          fill="url(#lzMtnGround2)"
        />
        <ellipse cx="30" cy="196" rx="9" ry="3.8" fill="#77816e" />
        <ellipse cx="170" cy="194" rx="7" ry="3.2" fill="#6b7562" />
        <g
          className="lz-grass"
          stroke="#6b8250"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M44 194 q-1 -6 -3 -8" />
          <path d="M50 195 q1 -5 3 -7" />
          <path d="M160 193 q-1 -6 -3 -8" />
          <path d="M166 194 q1 -5 3 -7" />
        </g>
      </svg>
    </div>
  );
}
