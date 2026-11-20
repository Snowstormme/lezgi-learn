import { getPublishedPhrases } from '@/features/phrasebook/queries';
import { PhrasebookExplorer } from '@/features/phrasebook/components/phrasebook-explorer';

export default async function PhrasebookPage() {
  const phrases = await getPublishedPhrases();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">
          Русско-лезгинский разговорник
        </h1>
        <p className="text-xs text-muted-foreground">
          Проверенные носителями живые фразы с транскрипцией, озвучкой и
          культурным контекстом.
        </p>
      </div>

      <PhrasebookExplorer phrases={phrases} />
    </div>
  );
}
