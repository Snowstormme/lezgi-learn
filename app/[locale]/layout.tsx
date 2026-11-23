import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { getSiteUrl } from '@/lib/seo';
import { ThemeProvider } from '@/components/theme/theme-provider';
import '@/app/globals.css';
import '@/app/path-decor.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['cyrillic', 'latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Lezgi Learn — Изучение лезгинского языка онлайн',
    template: '%s | Lezgi Learn',
  },
  description:
    'Изучайте лезгинский язык с русского по проверенным носителями урокам, словарю с озвучкой и разговорному переводчику.',
  keywords: [
    'лезгинский язык',
    'изучение лезгинского языка',
    'лезги чӀал',
    'лезгинско-русский словарь',
    'лезгинский переводчик',
    'уроки лезгинского языка',
    'выучить лезгинский онлайн',
  ],
  applicationName: 'Lezgi Learn',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Lezgi Learn',
    title: 'Lezgi Learn — Изучение лезгинского языка онлайн',
    description:
      'Изучайте лезгинский язык с русского по проверенным носителями урокам, словарю с озвучкой и разговорному переводчику.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lezgi Learn — Изучение лезгинского языка',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lezgi Learn — Изучение лезгинского языка онлайн',
    description:
      'Изучайте лезгинский язык с русского: интерактивные уроки, словарь и переводчик.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
  icons: {
    icon: '/icon.svg?v=2',
    shortcut: '/icon.svg?v=2',
    apple: '/icon.svg?v=2',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F7FA' },
    { media: '(prefers-color-scheme: dark)', color: '#0B132B' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('lezgi-theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ru')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={jetbrainsMono.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-background font-mono text-foreground transition-colors duration-200">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
