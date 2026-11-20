import { getTranslations } from 'next-intl/server';
import { PHRASEBOOK_PLANNED_CATEGORIES } from '@/features/phrasebook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function PhrasebookPage() {
  const tPhrasebook = await getTranslations('phrasebook');

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Badge variant="secondary">Этап 4 • В плане</Badge>
        <h1 className="pt-1 text-xl font-bold tracking-tight">
          {tPhrasebook('title')}
        </h1>
        <p className="text-xs text-muted-foreground">
          {tPhrasebook('subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Запланированные категории</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          {PHRASEBOOK_PLANNED_CATEGORIES.map((category) => (
            <div
              key={category.slug}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="font-medium text-foreground">
                {category.title_ru}
              </span>
              <span className="font-mono text-[11px]">{category.slug}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
