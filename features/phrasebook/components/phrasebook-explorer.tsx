'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { PhrasebookEntry } from '@/features/phrasebook/queries';
import { normalizeLezgiInputForComparison } from '@/lib/lezgi-utils';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'all', label: 'Все фразы' },
  { key: 'greetings', label: 'Приветствия' },
  { key: 'family', label: 'Семья и старшие' },
  { key: 'guest', label: 'В гостях' },
  { key: 'road', label: 'В дороге' },
  { key: 'daily', label: 'На каждый день' },
];

const CATEGORY_BADGES: Record<string, string> = {
  greetings: 'Приветствия',
  family: 'Семья',
  guest: 'В гостях',
  road: 'В дороге',
  daily: 'Разговор',
};

interface PhrasebookExplorerProps {
  phrases: PhrasebookEntry[];
}

export function PhrasebookExplorer({ phrases }: PhrasebookExplorerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const normQuery = normalizeLezgiInputForComparison(query);
    const lowerQuery = query.trim().toLowerCase();

    return phrases.filter((item) => {
      if (category !== 'all' && item.category !== category) {
        return false;
      }

      if (!lowerQuery) return true;

      return (
        item.source_ru.toLowerCase().includes(lowerQuery) ||
        item.target_lez.toLowerCase().includes(lowerQuery) ||
        normalizeLezgiInputForComparison(item.target_lez).includes(normQuery)
      );
    });
  }, [phrases, query, category]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск фразы по-русски или по-лезгински..."
          className="h-11 pl-9 pr-9 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={cn(
                'rounded-xl border-2 border-b-4 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all active:translate-y-[1px]',
                isActive
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Проверенных фраз: {filtered.length}
      </p>

      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.slug}>
            <CardHeader className="space-y-1.5 pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="verified">
                  {CATEGORY_BADGES[item.category] ?? item.category}
                </Badge>
                <AudioPlayerButton
                  textLez={item.target_lez}
                  transcriptionRu={item.transcription_ru}
                  audioPath={item.audio_path}
                  audioStatus={item.audio_status}
                />
              </div>

              <CardTitle className="pt-1 text-base font-bold text-primary">
                {item.target_lez}
              </CardTitle>

              {item.transcription_ru && (
                <p className="text-xs text-muted-foreground">
                  [{item.transcription_ru}]
                </p>
              )}

              <p className="text-sm font-medium text-foreground">
                {item.source_ru}
              </p>
            </CardHeader>

            {item.context_note_ru && (
              <CardContent className="pt-0 text-xs text-muted-foreground">
                <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
                  {item.context_note_ru}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
