import { getTranslations } from 'next-intl/server';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DictionaryPage() {
  const tDict = await getTranslations('dictionary');
  const words = await getPublishedDictionaryWords();

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">{tDict('title')}</h1>
        <p className="text-xs text-muted-foreground">{tDict('subtitle')}</p>
      </div>

      <div className="space-y-3">
        {words.map((word) => (
          <Card key={word.slug}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-primary">
                    {word.lemma_lez}
                  </CardTitle>
                  <p className="text-sm font-medium text-foreground">
                    {word.translation_ru}
                  </p>
                </div>
                {word.part_of_speech && (
                  <Badge variant="secondary">{word.part_of_speech}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {word.grammar_notes_ru && <p>{word.grammar_notes_ru}</p>}

              {word.examples.length > 0 && (
                <div className="space-y-1 rounded-lg border border-border/70 bg-background/50 p-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tDict('examplesTitle')}
                  </p>
                  {word.examples.map((ex) => (
                    <div key={ex.slug} className="pt-0.5">
                      <p className="font-medium text-foreground">
                        «{ex.sentence_lez}»
                      </p>
                      <p>{ex.translation_ru}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
