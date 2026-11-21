import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://lezgi-learn.notsnowstorm.workers.dev';

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}

export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized === '/' ? base : `${base}${normalized}`;
}

interface BuildPageMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const url = getAbsoluteUrl(path);
  const ogImage = getAbsoluteUrl('/og-image.png');

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: 'Lezgi Learn',
      title,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Lezgi Learn — Изучение лезгинского языка',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
          },
        },
  };
}
