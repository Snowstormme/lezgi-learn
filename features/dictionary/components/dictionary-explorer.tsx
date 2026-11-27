'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DictionaryWordItem } from '@/features/dictionary/queries';
import { normalizeLezgiInputForComparison } from '@/lib/lezgi-utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportMistakeTrigger } from '@/features/shared/components/report-mistake-trigger';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { cn } from '@/lib/utils';

const POS_LABELS: Record<string, string> = {
  phrase: 'Фраза',
  noun: 'Сущ.',
  pronoun: 'Мест.',
  adverb: 'Наречие',
  verb: 'Глагол',
  adjective: 'Прил.',
  particle: 'Частица',
  numeral: 'Числ.',
};

interface DictionaryExplorerProps {
  words: DictionaryWordItem[];
}

export function DictionaryExplorer({ words }: DictionaryExplorerProps) {
  const t = useTranslations('dictionary');
  const [query, setQuery] = useState('');
  const [posFilter, setPosFilter] = useState<string>('all');

  const filterChips = [
    { key: 'all', label: t('allFilter') },
    { key: 'phrase', label: t('phraseFilter') },
    { key: 'noun', label: t('nounFilter') },
    { key: 'verb', label: t('verbFilter') },
    { key: 'adjective', label: t('adjectiveFilter') },
    { key: 'pronoun', label: t('pronounFilter') },
    { key: 'adverb', label: t('adverbFilter') },
    { key: 'particle', label: t('particleFilter') },
    { key: 'numeral', label: t('numeralFilter') },
  ];

  const filteredWords = useMemo(() => {
    const normalizedQuery = normalizeLezgiInputForComparison(query);
    const rawLowerQuery = query.trim().toLowerCase();

    const list = words.filter((word) => {
      if (posFilter !== 'all' && word.part_of_speech !== posFilter) {
        return false;
      }

      if (!rawLowerQuery) return true;

      const normalizedLemma = normalizeLezgiInputForComparison(word.lemma_lez);
      const matchesLezgi =
        normalizedLemma.includes(normalizedQuery) ||
        word.lemma_lez.toLowerCase().includes(rawLowerQuery);
      const matchesRussian = word.translation_ru
        .toLowerCase()
        .includes(rawLowerQuery);
      const matchesExamples = word.examples.some(
        (ex) =>
          normalizeLezgiInputForComparison(ex.sentence_lez).includes(
            normalizedQuery
          ) || ex.translation_ru.toLowerCase().includes(rawLowerQuery)
      );

      return matchesLezgi || matchesRussian || matchesExamples;
    });

    if (posFilter === 'numeral') {
      return [...list].sort((a, b) => {
        const na = Number.parseInt(a.translation_ru, 10);
        const nb = Number.parseInt(b.translation_ru, 10);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        return a.lemma_lez.localeCompare(b.lemma_lez, 'ru');
      });
    }

    return list;
  }, [words, query, posFilter]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="h-12 pl-10 pr-10 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Очистить поиск"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Part of speech filter chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {filterChips.map((chip) => {
          const isActive = posFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setPosFilter(chip.key)}
              className={cn(
                'rounded-xl border-2 border-b-4 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide transition-all active:translate-y-[1px] active:border-b-2',
                isActive
                  ? 'border-foreground bg-foreground text-background dark:border-[#CBD5E1] dark:bg-[#F8FAFC] dark:text-[#0B132B]'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{t('foundCount', { count: filteredWords.length })}</span>
        <span className="text-[11px]">1 / I → Ӏ</span>
      </div>

      {/* Word cards */}
      {filteredWords.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-xs font-semibold text-muted-foreground">
            {t('emptyResults')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredWords.map((word) => (
            <Card key={word.slug} className="overflow-hidden">
              <CardHeader className="pb-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <CardTitle className="text-xl font-extrabold text-primary">
                        {word.lemma_lez}
                      </CardTitle>
                      {word.transcription_ru && (
                        <span className="text-xs font-medium text-muted-foreground">
                          [{word.transcription_ru}]
                        </span>
                      )}
                      {word.part_of_speech && (
                        <span className="text-xs font-bold text-muted-foreground">
                          · {POS_LABELS[word.part_of_speech] ?? word.part_of_speech}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {word.translation_ru}
                    </p>
                  </div>

                  <AudioPlayerButton
                    textLez={word.lemma_lez}
                    transcriptionRu={word.transcription_ru}
                    audioPath={word.audio_path}
                    audioStatus={word.audio_status}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-muted-foreground">
                {word.grammar_notes_ru && (
                  <p className="leading-relaxed">{word.grammar_notes_ru}</p>
                )}

                {word.examples.length > 0 && (
                  <div className="space-y-1.5 rounded-lg border border-border/70 bg-background/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('examplesTitle')}
                    </p>
                    {word.examples.map((ex) => (
                      <div key={ex.slug} className="space-y-0.5">
                        <p className="font-semibold text-foreground">
                          «{ex.sentence_lez}»
                        </p>
                        <p>{ex.translation_ru}</p>
                      </div>
                    ))}
                  </div>
                )}

                <ReportMistakeTrigger entityType="word" entityId={word.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
