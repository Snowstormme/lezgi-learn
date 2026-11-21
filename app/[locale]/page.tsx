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

      {/* Subtle corner carpet frame brackets */}
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

      {/* Central Living 3D Sumag Carpet Medallion Portal */}
      <Link
        href="/learn"
        aria-label="Lezgi Learn — Перейти к курсу"
        className="group relative flex items-center justify-center rounded-full focus:outline-none"
      >
        <svg
          viewBox="-185 -185 370 370"
          className="h-[320px] w-[320px] overflow-visible transition-transform duration-300 ease-out group-hover:scale-[1.04] group-active:scale-[0.96]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="sumagCoreGlow">
              <stop offset="0%" stopColor="#F04E37" stopOpacity="0.34" />
              <stop offset="55%" stopColor="#FFC800" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#080E22" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Breathing ambient glow */}
          <circle
            cx="0"
            cy="0"
            r="180"
            fill="url(#sumagCoreGlow)"
            className="ld-sun-glow"
          />

          {/* Slowly rotating outer dashed geometric ring */}
          <g className="ld-rays">
            <circle
              cx="0"
              cy="0"
              r="148"
              fill="none"
              stroke="#1E2D52"
              strokeWidth="1.6"
              strokeDasharray="6 6"
            />
          </g>

          {/* 8 outer star tips */}
          <polygon
            points="0,-136 24,-96 96,-96 96,-24 136,0 96,24 96,96 24,96 0,136 -24,96 -96,96 -96,24 -136,0 -96,-24 -96,-96 -24,-96"
            fill="#111C3B"
            stroke="#3B5284"
            strokeWidth="2"
          />

          {/* Stepped Sumag Diamond Layer 1 (Navy & Gold border) */}
          <polygon
            points="0,-116 28,-88 48,-88 48,-68 68,-68 68,-48 88,-48 88,-28 116,0 88,28 88,48 68,48 68,68 48,68 48,88 28,88 0,116 -28,88 -48,88 -48,68 -68,68 -68,48 -88,48 -88,28 -116,0 -88,-28 -88,-48 -68,-48 -68,-68 -48,-68 -48,-88 -28,-88"
            fill="#16244B"
            stroke="#FFC800"
            strokeWidth="2.2"
          />

          {/* Stepped Sumag Diamond Layer 2 (Vermillion 3D base + top face) */}
          <polygon
            points="0,-84 84,0 0,84 -84,0"
            fill="#B92B1C"
            transform="translate(0, 6)"
          />
          <polygon
            points="0,-84 84,0 0,84 -84,0"
            fill="#F04E37"
            stroke="#FF8A75"
            strokeWidth="2"
          />

          {/* Inner Cloud White Star Core */}
          <polygon
            points="0,-48 16,-16 48,0 16,16 0,48 -16,16 -48,0 -16,-16"
            fill="#F8FAFC"
          />

          {/* Center Shalbuzdag Mini Emblem */}
          <circle cx="0" cy="-10" r="5" fill="#F04E37" />
          <polygon points="-16,12 -3,-6 8,12" fill="#0B132B" />
          <polygon points="-2,12 8,-2 17,12" fill="#16213E" />

          {/* 4 cardinal gold latch dots */}
          <circle cx="0" cy="-100" r="4" fill="#FFC800" />
          <circle cx="100" cy="0" r="4" fill="#FFC800" />
          <circle cx="0" cy="100" r="4" fill="#FFC800" />
          <circle cx="-100" cy="0" r="4" fill="#FFC800" />
        </svg>
      </Link>
    </main>
  );
}
