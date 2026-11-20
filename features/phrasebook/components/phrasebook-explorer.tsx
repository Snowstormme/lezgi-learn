'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { PhrasebookEntry } from '@/features/phrasebook/queries';
import { normalizeLezgiInputForComparison } from '@/lib/lezgi-utils';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'all', label: 'Все' },
  { key: 'greetings', label: 'Приветствия' },
  { key: 'family', label: 'Семья' },
  { key: 'guest', label: 'В гостях' },
  { key: 'road', label: 'В дороге' },
  { key: 'daily', label: 'Повседневное' },
];

const CATEGORY_LABELS: Record<string, string> = {
  greetings: 'приветствия',
  family: 'семья',
  guest: 'в гостях',
  road: 'в дороге',
  daily: 'разговор',
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
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CBD5E1]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск фразы..."
          className="h-12 pl-10 pr-10 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Очистить поиск"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#F8FAFC]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-[#F8FAFC] bg-[#F8FAFC] font-semibold text-[#0B132B]'
                  : 'border-border bg-card text-[#CBD5E1] hover:text-[#F8FAFC]'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#CBD5E1]">{filtered.length} фраз</p>

      <div className="space-y-3.5">
        {filtered.map((item) => (
          <article
            key={item.slug}
            className="space-y-3 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-medium text-primary">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </p>
                <h2 className="text-balance text-base font-bold leading-snug text-[#F8FAFC]">
                  {item.target_lez}
                </h2>
                {item.transcription_ru && (
                  <p className="text-xs text-[#CBD5E1]">
                    [{item.transcription_ru}]
                  </p>
                )}
              </div>

              <AudioPlayerButton
                textLez={item.target_lez}
                transcriptionRu={item.transcription_ru}
                audioPath={item.audio_path}
                audioStatus={item.audio_status}
              />
            </div>

            <p className="text-sm font-medium text-[#F8FAFC]">
              {item.source_ru}
            </p>

            {item.context_note_ru && (
              <p className="border-t border-border pt-3 text-xs leading-relaxed text-[#CBD5E1]">
                {item.context_note_ru}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
