import { getTranslations } from 'next-intl/server';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { DictionaryExplorer } from '@/features/dictionary/components/dictionary-explorer';

export default async function DictionaryScreenPage() {
  const tDict = await getTranslations('dictionary');
  const words = await getPublishedDictionaryWords();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">{tDict('title')}</h1>
        <p className="text-xs text-muted-foreground">{tDict('subtitle')}</p>
      </div>

      <DictionaryExplorer words={words} />
    </div>
  );
}
