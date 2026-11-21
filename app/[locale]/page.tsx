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

const OUTER_MADDER_STEPPED_PATH =
  'M 0 -164 L 30 -134 L 54 -134 L 54 -114 L 82 -114 L 82 -92 L 92 -92 L 92 -82 L 114 -82 L 114 -54 L 134 -54 L 134 -30 L 164 0 L 134 30 L 134 54 L 114 54 L 114 82 L 92 82 L 92 92 L 82 92 L 82 114 L 54 114 L 54 134 L 30 134 L 0 164 L -30 134 L -54 134 L -54 114 L -82 114 L -82 92 L -92 92 L -92 82 L -114 82 L -114 54 L -134 54 L -134 30 L -164 0 L -134 -30 L -134 -54 L -114 -54 L -114 -82 L -92 -82 L -92 -92 L -82 -92 L -82 -114 L -54 -114 L -54 -134 L -30 -134 Z';

const STEPPED_INDIGO_PATH =
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

const OUTER_DIAGONAL_ROSETTE_COORDS: Array<[number, number]> = [
  [96, -96],
  [96, 96],
  [-96, 96],
  [-96, -96],
];

const OUTER_RED_STUD_COORDS: Array<[number, number]> = [
  [42, -120],
  [120, -42],
  [42, 120],
  [120, 42],
  [-42, 120],
  [-120, 42],
  [-42, -120],
  [-120, -42],
  [68, -102],
  [102, -68],
  [68, 102],
  [102, 68],
  [-68, 102],
  [-102, 68],
  [-68, -102],
  [-102, -68],
];

const INNER_INDIGO_STUD_COORDS: Array<[number, number]> = [
  [-25, -88],
  [25, -88],
  [-25, 88],
  [25, 88],
  [-88, -25],
  [-88, 25],
  [88, -25],
  [88, 25],
  [-55, -55],
  [55, -55],
  [-55, 55],
  [55, 55],
  [0, -124],
  [0, 124],
  [-124, 0],
  [124, 0],
];

const ROSETTE_COORDS: Array<[number, number]> = [
  [0, -103],
  [0, 103],
  [-103, 0],
  [103, 0],
];

const EIGHT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function SmallCarpetRosette({
  cx,
  cy,
  r = 14,
  evenCol = '#E0482D',
  oddCol = '#D49E52',
}: {
  cx: number;
  cy: number;
  r?: number;
  evenCol?: string;
  oddCol?: string;
}) {
  return (
    <g>
      <polygon
        points={`${cx},${cy - r * 1.15} ${cx + r * 0.82},${cy - r * 0.82} ${cx + r * 1.15},${cy} ${cx + r * 0.82},${cy + r * 0.82} ${cx},${cy + r * 1.15} ${cx - r * 0.82},${cy + r * 0.82} ${cx - r * 1.15},${cy} ${cx - r * 0.82},${cy - r * 0.82}`}
        fill="#F0E6D6"
        stroke="#0B1736"
        strokeWidth="0.8"
      />
      {EIGHT_ANGLES.map((angle, i) => (
        <g key={angle} transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
          <polygon
            points={`0,-1.8 3.4,-${r * 0.56} 0,-${r} -3.4,-${r * 0.56}`}
            fill={i % 2 === 0 ? evenCol : oddCol}
            stroke="#0B1736"
            strokeWidth="0.65"
          />
        </g>
      ))}
      <circle
        cx={cx}
        cy={cy}
        r="2.6"
        fill="#E0482D"
        stroke="#F0E6D6"
        strokeWidth="0.8"
      />
    </g>
  );
}

function WovenStud({
  cx,
  cy,
  r = 5.5,
  fill = '#5BA4CF',
  core = '#E0482D',
}: {
  cx: number;
  cy: number;
  r?: number;
  fill?: string;
  core?: string;
}) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <polygon
        points={`0,-${r} ${r},0 0,${r} -${r},0`}
        fill="#F0E6D6"
        stroke="#0B1736"
        strokeWidth="0.6"
      />
      <polygon
        points={`0,-${r * 0.72} ${r * 0.72},0 0,${r * 0.72} -${r * 0.72},0`}
        fill={fill}
      />
      <rect x="-1.3" y="-1.3" width="2.6" height="2.6" fill={core} />
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
      <rect x={h - 5.5} y={-h + 2.4} width="3.1" height="3.1" fill={accent} />
      <rect x={-h + 2.4} y={h - 5.5} width="3.1" height="3.1" fill={accent} />
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

      {/* Central Authentic Densely-Woven Stepped Sumag Carpet Medallion Portal */}
      <Link
        href="/learn"
        aria-label="Lezgi Learn — Перейти к курсу"
        className="group relative flex items-center justify-center rounded-full focus:outline-none"
      >
        <svg
          viewBox="-185 -185 370 370"
          className="h-[336px] w-[336px] overflow-visible transition-transform duration-300 ease-out group-hover:scale-[1.04] group-active:scale-[0.96]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="sumagRedAura">
              <stop offset="0%" stopColor="#E0482D" stopOpacity="0.36" />
              <stop offset="55%" stopColor="#B8331D" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#080E22" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Breathing warm madder-red ambient glow */}
          <circle
            cx="0"
            cy="0"
            r="184"
            fill="url(#sumagRedAura)"
            className="ld-sun-glow"
          />

          {/* 1. OUTER STEPPED MADDER-RED CARPET FIELD (fills all 4 outer diagonal bays with woven motifs) */}
          <g transform="translate(0, 8)">
            <path d={OUTER_MADDER_STEPPED_PATH} fill="#040814" />
          </g>
          <path
            d={OUTER_MADDER_STEPPED_PATH}
            fill="#C83A22"
            stroke="#F0E6D6"
            strokeWidth="6"
            strokeLinejoin="miter"
          />
          <path
            d={OUTER_MADDER_STEPPED_PATH}
            fill="#C83A22"
            stroke="#5BA4CF"
            strokeWidth="2.6"
            strokeLinejoin="miter"
          />
          <path
            d={OUTER_MADDER_STEPPED_PATH}
            fill="#C83A22"
            stroke="#8F2112"
            strokeWidth="1"
            strokeLinejoin="miter"
          />

          {/* 4 Corner Rosettes & 16 Woven Diamond Studs inside the Outer Stepped Madder-Red Bays */}
          {OUTER_DIAGONAL_ROSETTE_COORDS.map(([rx, ry]) => (
            <SmallCarpetRosette
              key={`outer-ros-${rx}-${ry}`}
              cx={rx}
              cy={ry}
              r={10.5}
              evenCol="#5BA4CF"
              oddCol="#D49E52"
            />
          ))}
          {OUTER_RED_STUD_COORDS.map(([sx, sy], idx) => (
            <WovenStud
              key={`outer-stud-${sx}-${sy}`}
              cx={sx}
              cy={sy}
              r={5.2}
              fill={idx % 2 === 0 ? '#5BA4CF' : '#D49E52'}
              core="#E0482D"
            />
          ))}

          {/* 2. STEPPED INDIGO MEDALLION FIELD WITH TRIPLE WOOL BORDER */}
          <path
            d={STEPPED_INDIGO_PATH}
            fill="#12254E"
            stroke="#F0E6D6"
            strokeWidth="6.5"
            strokeLinejoin="miter"
          />
          <path
            d={STEPPED_INDIGO_PATH}
            fill="#12254E"
            stroke="#E0482D"
            strokeWidth="3.6"
            strokeLinejoin="miter"
          />
          <path
            d={STEPPED_INDIGO_PATH}
            fill="#12254E"
            stroke="#5BA4CF"
            strokeWidth="1.4"
            strokeLinejoin="miter"
          />

          {/* 3. CARDINAL RAM'S HORN FRETWORK HOOKS ("Къармах") & 16 STEPPED FRETWORK BLOCKS */}
          {[0, 90, 180, 270].map((ang) => (
            <g key={`hook-${ang}`} transform={`rotate(${ang})`}>
              <path
                d="M -9 -146 V -160 H -22 V -149 H -15 M 9 -146 V -160 H 22 V -149 H 15"
                fill="none"
                stroke="#5BA4CF"
                strokeWidth="3.4"
                strokeLinecap="square"
              />
              <path
                d="M -9 -146 V -160 H -22 V -149 H -15 M 9 -146 V -160 H 22 V -149 H 15"
                fill="none"
                stroke="#F0E6D6"
                strokeWidth="1.2"
                strokeLinecap="square"
              />
            </g>
          ))}
          {STEP_HOOK_COORDS.map(([x, y], idx) => (
            <StepHookBlock
              key={`step-${x}-${y}`}
              x={x}
              y={y}
              isRed={idx % 2 === 0}
            />
          ))}

          {/* 4. INNER INDIGO FIELD FILLER STUDS & 4 CARDINAL 8-PETAL ROSETTES (zero empty blue gaps) */}
          {INNER_INDIGO_STUD_COORDS.map(([sx, sy], idx) => (
            <WovenStud
              key={`inner-stud-${sx}-${sy}`}
              cx={sx}
              cy={sy}
              r={5.6}
              fill={idx % 2 === 0 ? '#E0482D' : '#5BA4CF'}
              core="#F0E6D6"
            />
          ))}
          {ROSETTE_COORDS.map(([rx, ry]) => (
            <SmallCarpetRosette key={`ros-${rx}-${ry}`} cx={rx} cy={ry} />
          ))}

          {/* 5. CENTRAL 8-POINTED LEZGI STARBURST CORE */}
          <g transform="scale(1.02)">
            {/* 8 Outer Trefoil Buds between star tips */}
            {EIGHT_ANGLES.map((a) => (
              <g key={`bud-${a}`} transform={`rotate(${a + 22.5})`}>
                <polygon
                  points="0,-86 6,-77 0,-70 -6,-77"
                  fill="#5BA4CF"
                  stroke="#F0E6D6"
                  strokeWidth="0.9"
                />
                <circle cx="0" cy="-78" r="1.6" fill="#E0482D" />
              </g>
            ))}

            {/* 8 Secondary Madder-Red & Ivory Star Tips */}
            {EIGHT_ANGLES.map((baseAngle) => {
              const a = baseAngle + 22.5;
              return (
                <g key={`sec-${a}`} transform={`rotate(${a})`}>
                  <polygon
                    points="0,-78 19,-44 0,-32 -19,-44"
                    fill="#F0E6D6"
                    stroke="#0B1736"
                    strokeWidth="1"
                  />
                  <polygon
                    points="0,-71 13,-45 0,-36 -13,-45"
                    fill="#E0482D"
                  />
                  <polygon
                    points="0,-62 6.5,-46 0,-40 -6.5,-46"
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
                    points="0,-88 22.5,-57 15.5,-22 0,-12 -15.5,-22 -22.5,-57"
                    fill="#F0E6D6"
                    stroke="#0B1736"
                    strokeWidth="1"
                  />
                  <polygon
                    points="0,-83 18.8,-55 13,-23 0,-14 -13,-23 -18.8,-55"
                    fill="#E0482D"
                  />
                  <polygon
                    points="0,-79 16.5,-53.5 11.2,-24 0,-16 -11.2,-24 -16.5,-53.5"
                    fill="#F0E6D6"
                  />
                  <polygon
                    points="0,-75.5 14.2,-52.5 9.8,-24 0,-17 -9.8,-24 -14.2,-52.5"
                    fill={isCardinal ? '#A82633' : '#8B1E29'}
                  />
                  {isCardinal ? (
                    <>
                      <polyline
                        points="-7.5,-57 0,-65 7.5,-57"
                        fill="none"
                        stroke="#F0E6D6"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                      <polyline
                        points="-8.5,-45 0,-53 8.5,-45"
                        fill="none"
                        stroke="#F0E6D6"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                      <polyline
                        points="-7.5,-33 0,-41 7.5,-33"
                        fill="none"
                        stroke="#F0E6D6"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                    </>
                  ) : (
                    <>
                      <polygon
                        points="0,-65 3.4,-61 0,-57 -3.4,-61"
                        fill="#5BA4CF"
                      />
                      <polygon
                        points="-5.2,-50 -2,-46 -5.2,-42 -8.4,-46"
                        fill="#5BA4CF"
                      />
                      <polygon
                        points="5.2,-50 8.4,-46 5.2,-42 2,-46"
                        fill="#5BA4CF"
                      />
                      <polygon
                        points="0,-38 3.2,-34 0,-30 -3.2,-34"
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
              r="23.5"
              fill="#E0482D"
              stroke="#F0E6D6"
              strokeWidth="1.4"
            />
            <circle cx="0" cy="0" r="20" fill="#521018" />
            {EIGHT_ANGLES.map((a, i) => (
              <g key={`center-${a}`} transform={`rotate(${a})`}>
                <polygon
                  points="0,-3 5,-12.5 0,-22 -5,-12.5"
                  fill={i % 2 === 0 ? '#275C85' : '#5BA4CF'}
                  stroke="#0B1736"
                  strokeWidth="0.9"
                />
              </g>
            ))}
            <circle
              cx="0"
              cy="0"
              r="5.2"
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
