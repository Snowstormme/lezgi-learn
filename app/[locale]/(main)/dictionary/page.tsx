import { getTranslations } from 'next-intl/server';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { DictionaryExplorer } from '@/features/dictionary/components/dictionary-explorer';
import { buildPageMetadata, getAbsoluteUrl } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Лезгинско-русский словарь с озвучкой',
  description:
    'Проверенный носителями лезгинско-русский и русско-лезгинский словарь: поиск по словам, транскрипция, примеры предложений и произношение.',
  path: '/dictionary',
  keywords: [
    'лезгинско-русский словарь',
    'русско-лезгинский словарь',
    'лезгинские слова с переводом',
    'произношение лезгинских слов',
  ],
});

export default async function DictionaryScreenPage() {
  const tDict = await getTranslations('dictionary');
  const words = await getPublishedDictionaryWords();
  const dictionaryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Лезгинско-русский словарь Lezgi Learn',
    description:
      'Словарь лезгинского языка с транскрипцией, переводом на русский и примерами употребления.',
    url: getAbsoluteUrl('/dictionary'),
    inLanguage: ['lez', 'ru'],
  };

  return (
    <div className="space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dictionaryJsonLd) }}
      />
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">{tDict('title')}</h1>
        <p className="text-xs text-muted-foreground">{tDict('subtitle')}</p>
      </div>

      <DictionaryExplorer words={words} />
    </div>
  );
}
