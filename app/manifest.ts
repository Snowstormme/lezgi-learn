import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lezgi Learn — Изучение лезгинского языка',
    short_name: 'Lezgi Learn',
    description:
      'Веб-платформа (PWA) для изучения лезгинского языка с русского по материалам, проверенным носителями.',
    start_url: '/learn',
    display: 'standalone',
    background_color: '#0c1017',
    theme_color: '#2bbaa0',
    lang: 'ru',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
