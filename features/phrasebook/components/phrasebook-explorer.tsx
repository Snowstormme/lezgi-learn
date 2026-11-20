'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { PhrasebookEntry } from '@/features/phrasebook/queries';
import { normalizeLezgiInputForComparison } from '@/lib/lezgi-utils';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск фразы по-русски или по-лезгински..."
          className="h-12 pl-10 pr-10 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                'rounded-xl border-2 border-b-4 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide transition-all active:translate-y-[1px] active:border-b-2',
                isActive
                  ? 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0B132B]'
                  : 'border-border bg-card text-muted-foreground hover:text-[#F8FAFC]'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs font-semibold text-[#CBD5E1]">
        Фраз: {filtered.length}
      </p>

      <div className="space-y-3.5">
        {filtered.map((item) => (
          <Card key={item.slug}>
            <CardHeader className="space-y-2 pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  {CATEGORY_BADGES[item.category] ?? item.category}
                </span>
                <AudioPlayerButton
                  textLez={item.target_lez}
                  transcriptionRu={item.transcription_ru}
                  audioPath={item.audio_path}
                  audioStatus={item.audio_status}
                />
              </div>

              <CardTitle className="pt-0.5 text-base font-extrabold text-[#F8FAFC]">
                {item.target_lez}
              </CardTitle>

              {item.transcription_ru && (
                <p className="text-xs font-medium text-[#CBD5E1]">
                  [{item.transcription_ru}]
                </p>
              )}

              <p className="text-sm font-bold text-[#F8FAFC]">
                {item.source_ru}
              </p>
            </CardHeader>

            {item.context_note_ru && (
              <CardContent className="pt-0 text-xs text-[#CBD5E1]">
                <div className="rounded-xl border border-border bg-background/70 p-3 leading-relaxed">
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
