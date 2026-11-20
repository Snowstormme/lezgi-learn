import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { DictionaryExplorer } from '@/features/dictionary/components/dictionary-explorer';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';

export default async function DictionaryScreenPage() {
  const words = await getPublishedDictionaryWords();

  return (
    <div className="space-y-6">
      <LezgiOrnament />

      <div className="space-y-1.5">
        <h1 className="text-balance text-2xl font-bold leading-tight text-[#F8FAFC]">
          Словарь
        </h1>
        <p className="text-xs leading-relaxed text-[#CBD5E1]">
          Лезгинские слова и примеры употребления с ударениями и грамматикой.
        </p>
      </div>

      <DictionaryExplorer words={words} />
    </div>
  );
}
