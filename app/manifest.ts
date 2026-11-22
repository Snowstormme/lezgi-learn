import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lezgi Learn — Изучение лезгинского языка',
    short_name: 'Lezgi Learn',
    description:
      'Веб-платформа (PWA) для изучения лезгинского языка с русского по материалам, проверенным носителями.',
    start_url: '/learn',
    display: 'standalone',
    background_color: '#0B132B',
    theme_color: '#F04E37',
    lang: 'ru',
    icons: [
      {
        src: '/icon.svg?v=2',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
