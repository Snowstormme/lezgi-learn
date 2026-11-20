import { getPublishedPhrases } from '@/features/phrasebook/queries';
import { PhrasebookExplorer } from '@/features/phrasebook/components/phrasebook-explorer';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';

export default async function PhrasebookPage() {
  const phrases = await getPublishedPhrases();

  return (
    <div className="space-y-6">
      <LezgiOrnament />

      <div className="space-y-1.5">
        <h1 className="text-balance text-2xl font-bold leading-tight text-[#F8FAFC]">
          Разговорник
        </h1>
        <p className="text-xs leading-relaxed text-[#CBD5E1]">
          Живые фразы для общения, гостей и дороги с пояснениями этикета.
        </p>
      </div>

      <PhrasebookExplorer phrases={phrases} />
    </div>
  );
}
