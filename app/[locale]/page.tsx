import { Link } from '@/lib/i18n/routing';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Lezgi Learn — Изучение лезгинского языка онлайн бесплатно',
  description:
    'Изучайте лезгинский язык с русского шаг за шагом: 11 игровых уроков, умное повторение слов, словарь с озвучкой и переводчик.',
  path: '/',
  keywords: [
    'лезгинский язык онлайн',
    'учить лезгинский язык с нуля',
    'лезги чӀал уроки',
    'самоучитель лезгинского языка',
  ],
});

const STEPPED_MEDALLION_PATH =
  'M 0 -142 L 18 -122 L 18 -106 L 44 -106 L 44 -86 L 68 -86 L 68 -68 L 86 -68 L 86 -44 L 106 -44 L 106 -18 L 122 -18 L 142 0 L 122 18 L 106 18 L 106 44 L 86 44 L 86 68 L 68 68 L 68 86 L 44 86 L 44 106 L 18 106 L 18 122 L 0 142 L -18 122 L -18 106 L -44 106 L -44 86 L -68 86 L -68 68 L -86 68 L -86 44 L -106 44 L -106 18 L -122 18 L -142 0 L -122 -18 L -106 -18 L -106 -44 L -86 -44 L -86 -68 L -68 -68 L -68 -86 L -44 -86 L -44 -106 L -18 -106 L -18 -122 Z';

const STEP_HOOK_COORDS: Array<[number, number]> = [
  [31, -96],
  [56, -77],
  [77, -56],
  [96, -31],
  [31, 96],
  [56, 77],
  [77, 56],
  [96, 31],
  [-31, 96],
  [-56, 77],
  [-77, 56],
  [-96, 31],
  [-31, -96],
  [-56, -77],
  [-77, -56],
  [-96, -31],
];

const ROSETTE_COORDS: Array<[number, number]> = [
  [0, -104],
  [0, 104],
  [-104, 0],
  [104, 0],
];

const EIGHT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function SmallCarpetRosette({ cx, cy }: { cx: number; cy: number }) {
  const r = 13.5;
  return (
    <g>
      <polygon
        points={`${cx},${cy - r * 1.14} ${cx + r * 0.82},${cy - r * 0.82} ${cx + r * 1.14},${cy} ${cx + r * 0.82},${cy + r * 0.82} ${cx},${cy + r * 1.14} ${cx - r * 0.82},${cy + r * 0.82} ${cx - r * 1.14},${cy} ${cx - r * 0.82},${cy - r * 0.82}`}
        fill="#F0E6D6"
        stroke="#0B1736"
        strokeWidth="0.8"
      />
      {EIGHT_ANGLES.map((angle, i) => (
        <g
          key={angle}
          transform={`translate(${cx}, ${cy}) rotate(${angle})`}
        >
          <polygon
            points={`0,-2 3.3,-${r * 0.55} 0,-${r} -3.3,-${r * 0.55}`}
            fill={i % 2 === 0 ? '#E0482D' : '#D49E52'}
            stroke="#0B1736"
            strokeWidth="0.7"
          />
        </g>
      ))}
      <circle
        cx={cx}
        cy={cy}
        r="2.5"
        fill="#E0482D"
        stroke="#F0E6D6"
        strokeWidth="0.8"
      />
    </g>
  );
}

function StepHookBlock({
  x,
  y,
  isRed,
}: {
  x: number;
  y: number;
  isRed: boolean;
}) {
  const size = 13.5;
  const h = size / 2;
  const accent = isRed ? '#E0482D' : '#5BA4CF';
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-h}
        y={-h}
        width={size}
        height={size}
        fill="#8F2112"
        stroke="#F0E6D6"
        strokeWidth="1.1"
      />
      <rect
        x={-h + 1.4}
        y={-h + 1.4}
        width={size - 2.8}
        height={size - 2.8}
        fill="#12254E"
      />
      <path
        d={`M${-h + 2.5} 0 H${h - 2.5} M0 ${-h + 2.5} V${h - 2.5}`}
        stroke={accent}
        strokeWidth="1.6"
      />
      <rect
        x={-h + 2.4}
        y={-h + 2.4}
        width="3.1"
        height="3.1"
        fill="#E0482D"
      />
      <rect
        x={h - 5.5}
        y={-h + 2.4}
        width="3.1"
        height="3.1"
        fill={accent}
      />
      <rect
        x={-h + 2.4}
        y={h - 5.5}
        width="3.1"
        height="3.1"
        fill={accent}
      />
      <rect
        x={h - 5.5}
        y={h - 5.5}
        width="3.1"
        height="3.1"
        fill="#E0482D"
      />
    </g>
  );
}

export default function StartScreenPage() {
  const siteUrl = getSiteUrl();
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lezgi Learn',
    url: siteUrl,
    inLanguage: 'ru',
    description:
      'Платформа для изучения лезгинского языка с русского: уроки, словарь, повторение слов и переводчик.',
  };

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center overflow-hidden border-x-2 border-[#16213E] bg-[#080E22] px-6 py-12 select-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Subtle corner carpet frame brackets with madder-red corner knots */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 410 912"
        preserveAspectRatio="none"
      >
        <path
          d="M24 36 H58 M24 36 V70 M386 36 H352 M386 36 V70 M24 876 H58 M24 876 V842 M386 876 H352 M386 876 V842"
          stroke="#263859"
          strokeWidth="1.5"
          fill="none"
        />
        <rect x="21" y="33" width="6" height="6" fill="#C83A22" />
        <rect x="383" y="33" width="6" height="6" fill="#C83A22" />
        <rect x="21" y="873" width="6" height="6" fill="#C83A22" />
        <rect x="383" y="873" width="6" height="6" fill="#C83A22" />
      </svg>

      {/* Top minimal title block */}
      <div className="mb-10 space-y-2.5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#94A3B8]">
          ДРЕВНИЙ ЯЗЫК КАВКАЗА
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
          Lezgi Learn
        </h1>
      </div>

      {/* Central Authentic Stepped Sumag Carpet Medallion Portal (Variant 2 + Rich Madder Red) */}
      <Link
        href="/learn"
        aria-label="Lezgi Learn — Перейти к курсу"
        className="group relative flex items-center justify-center rounded-full focus:outline-none"
      >
        <svg
          viewBox="-185 -185 370 370"
          className="h-[330px] w-[330px] overflow-visible transition-transform duration-300 ease-out group-hover:scale-[1.04] group-active:scale-[0.96]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="sumagRedAura">
              <stop offset="0%" stopColor="#E0482D" stopOpacity="0.34" />
              <stop offset="52%" stopColor="#B8331D" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#080E22" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Breathing warm madder-red ambient glow */}
          <circle
            cx="0"
            cy="0"
            r="182"
            fill="url(#sumagRedAura)"
            className="ld-sun-glow"
          />

          {/* Slowly rotating outer dashed madder-red geometric ring */}
          <g className="ld-rays">
            <circle
              cx="0"
              cy="0"
              r="166"
              fill="none"
              stroke="#C83A22"
              strokeWidth="1.4"
              strokeDasharray="5 6"
              opacity="0.6"
            />
          </g>

          {/* 3D Extruded Deep Madder-Shadow Base */}
          <g transform="translate(0, 8)">
            <path
              d={STEPPED_MEDALLION_PATH}
              fill="#040814"
              stroke="#5E150B"
              strokeWidth="10"
              strokeLinejoin="miter"
            />
          </g>

          {/* Bold Madder-Red Stepped Outer Carpet Ribbon + Ivory & Turquoise Guards */}
          <path
            d={STEPPED_MEDALLION_PATH}
            fill="#12254E"
            stroke="#F0E6D6"
            strokeWidth="13"
            strokeLinejoin="miter"
          />
          <path
            d={STEPPED_MEDALLION_PATH}
            fill="#12254E"
            stroke="#E0482D"
            strokeWidth="9.5"
            strokeLinejoin="miter"
          />
          <path
            d={STEPPED_MEDALLION_PATH}
            fill="#12254E"
            stroke="#F0E6D6"
            strokeWidth="3.8"
            strokeLinejoin="miter"
          />
          <path
            d={STEPPED_MEDALLION_PATH}
            fill="#12254E"
            stroke="#5BA4CF"
            strokeWidth="1.6"
            strokeLinejoin="miter"
          />

          {/* Inner Stepped Red Frame Line inside the Indigo Field */}
          <g transform="scale(0.84)">
            <path
              d={STEPPED_MEDALLION_PATH}
              fill="none"
              stroke="#C83A22"
              strokeWidth="1.8"
              strokeDasharray="4 3"
              opacity="0.75"
            />
          </g>

          {/* 4 Cardinal Ram's Horn Fretwork Hooks ("Къармах") in Madder Red & Ivory */}
          {[0, 90, 180, 270].map((ang) => (
            <g key={ang} transform={`rotate(${ang})`}>
              <path
                d="M -9 -134 V -152 H -22 V -139 H -15 M 9 -134 V -152 H 22 V -139 H 15"
                fill="none"
                stroke="#E0482D"
                strokeWidth="3.6"
                strokeLinecap="square"
              />
              <path
                d="M -9 -134 V -152 H -22 V -139 H -15 M 9 -134 V -152 H 22 V -139 H 15"
                fill="none"
                stroke="#F0E6D6"
                strokeWidth="1.3"
                strokeLinecap="square"
              />
            </g>
          ))}

          {/* 16 Stepped Fretwork Hook Blocks along the perimeter */}
          {STEP_HOOK_COORDS.map(([x, y], idx) => (
            <StepHookBlock
              key={`${x}-${y}`}
              x={x}
              y={y}
              isRed={idx % 2 === 0}
            />
          ))}

          {/* 4 Small 8-Petal Red & Ochre Rosettes at North, South, East, West pockets */}
          {ROSETTE_COORDS.map(([rx, ry]) => (
            <SmallCarpetRosette key={`${rx}-${ry}`} cx={rx} cy={ry} />
          ))}

          {/* Central 8-Pointed Lezgi Starburst with Crimson/Madder Petals, Chevrons & Turquoise Dots */}
          <g transform="scale(0.95)">
            <circle cx="0" cy="7" r="82" fill="#040814" opacity="0.55" />

            {/* 8 Secondary Madder-Red & Ivory Star Tips */}
            {EIGHT_ANGLES.map((baseAngle) => {
              const a = baseAngle + 22.5;
              return (
                <g key={`sec-${a}`} transform={`rotate(${a})`}>
                  <polygon
                    points="0,-76 18,-44 0,-32 -18,-44"
                    fill="#F0E6D6"
                    stroke="#0B1736"
                    strokeWidth="1"
                  />
                  <polygon
                    points="0,-69 12,-45 0,-36 -12,-45"
                    fill="#E0482D"
                  />
                  <polygon
                    points="0,-60 6,-46 0,-40 -6,-46"
                    fill="#F0E6D6"
                  />
                </g>
              );
            })}

            {/* 8 Main Crimson-Red Velvet Petals with Double Wool Trim */}
            {EIGHT_ANGLES.map((a, i) => {
              const isCardinal = i % 2 === 0;
              return (
                <g key={`main-${a}`} transform={`rotate(${a})`}>
                  <polygon
                    points="0,-85 21.5,-56 15,-22 0,-12 -15,-22 -21.5,-56"
                    fill="#F0E6D6"
                    stroke="#0B1736"
                    strokeWidth="1"
                  />
                  <polygon
                    points="0,-80 18,-54 12.5,-23 0,-14 -12.5,-23 -18,-54"
                    fill="#E0482D"
                  />
                  <polygon
                    points="0,-76.5 15.8,-53 11,-24 0,-16 -11,-24 -15.8,-53"
                    fill="#F0E6D6"
                  />
                  <polygon
                    points="0,-73.5 13.8,-52 9.5,-24 0,-17 -9.5,-24 -13.8,-52"
                    fill={isCardinal ? '#A82633' : '#8B1E29'}
                  />
                  {isCardinal ? (
                    <>
                      <polyline
                        points="-7,-55 0,-63 7,-55"
                        fill="none"
                        stroke="#F0E6D6"
                        strokeWidth="1.9"
                        strokeLinecap="square"
                      />
                      <polyline
                        points="-8,-44 0,-52 8,-44"
                        fill="none"
                        stroke="#F0E6D6"
                        strokeWidth="1.9"
                        strokeLinecap="square"
                      />
                      <polyline
                        points="-7,-33 0,-41 7,-33"
                        fill="none"
                        stroke="#F0E6D6"
                        strokeWidth="1.9"
                        strokeLinecap="square"
                      />
                    </>
                  ) : (
                    <>
                      <polygon
                        points="0,-64 3.2,-60 0,-56 -3.2,-60"
                        fill="#5BA4CF"
                      />
                      <polygon
                        points="-5,-49 -2,-45 -5,-41 -8,-45"
                        fill="#5BA4CF"
                      />
                      <polygon
                        points="5,-49 8,-45 5,-41 2,-45"
                        fill="#5BA4CF"
                      />
                      <polygon
                        points="0,-38 3,-34 0,-30 -3,-34"
                        fill="#F0E6D6"
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* Center 8-Petal Blue-Turquoise Rosette with Madder-Red Ring & Core */}
            <circle
              cx="0"
              cy="0"
              r="23"
              fill="#E0482D"
              stroke="#F0E6D6"
              strokeWidth="1.3"
            />
            <circle cx="0" cy="0" r="19.5" fill="#521018" />
            {EIGHT_ANGLES.map((a, i) => (
              <g key={`center-${a}`} transform={`rotate(${a})`}>
                <polygon
                  points="0,-3 4.8,-12 0,-21 -4.8,-12"
                  fill={i % 2 === 0 ? '#275C85' : '#5BA4CF'}
                  stroke="#0B1736"
                  strokeWidth="0.9"
                />
              </g>
            ))}
            <circle
              cx="0"
              cy="0"
              r="5"
              fill="#E0482D"
              stroke="#F0E6D6"
              strokeWidth="1.1"
            />
          </g>
        </svg>
      </Link>
    </main>
  );
}
