'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DictionaryWordItem } from '@/features/dictionary/queries';
import { normalizeLezgiInputForComparison } from '@/lib/lezgi-utils';
import { Input } from '@/components/ui/input';
import { ReportMistakeTrigger } from '@/features/shared/components/report-mistake-trigger';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { cn } from '@/lib/utils';

const POS_LABELS: Record<string, string> = {
  phrase: 'фраза',
  noun: 'сущ.',
  pronoun: 'мест.',
  adverb: 'наречие',
  verb: 'глагол',
  adjective: 'прил.',
  particle: 'частица',
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
  ];

  const filteredWords = useMemo(() => {
    const normalizedQuery = normalizeLezgiInputForComparison(query);
    const rawLowerQuery = query.trim().toLowerCase();

    return words.filter((word) => {
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
  }, [words, query, posFilter]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CBD5E1]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: салам, чӀал, брат..."
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

      {/* Minimal inline filter strip */}
      <div className="flex flex-wrap gap-2">
        {filterChips.map((chip) => {
          const isActive = posFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setPosFilter(chip.key)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-[#F8FAFC] bg-[#F8FAFC] font-semibold text-[#0B132B]'
                  : 'border-border bg-card text-[#CBD5E1] hover:text-[#F8FAFC]'
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#CBD5E1]">
        {filteredWords.length} слов · 1/I распознаются как Ӏ
      </p>

      {/* Word list grouped with spacing */}
      {filteredWords.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-10 text-center text-xs text-[#CBD5E1]">
          {t('emptyResults')}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredWords.map((word) => (
            <article
              key={word.slug}
              className="space-y-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <h2 className="text-lg font-bold text-[#F8FAFC]">
                      {word.lemma_lez}
                    </h2>
                    {word.transcription_ru && (
                      <span className="text-xs text-[#CBD5E1]">
                        [{word.transcription_ru}]
                      </span>
                    )}
                    {word.part_of_speech && (
                      <span className="text-xs text-primary">
                        {POS_LABELS[word.part_of_speech] ?? word.part_of_speech}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#F8FAFC]">
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

              {word.grammar_notes_ru && (
                <p className="text-xs leading-relaxed text-[#CBD5E1]">
                  {word.grammar_notes_ru}
                </p>
              )}

              {word.examples.length > 0 && (
                <div className="space-y-1 border-t border-border pt-3 text-xs leading-relaxed">
                  {word.examples.map((ex) => (
                    <div key={ex.slug}>
                      <p className="font-semibold text-[#F8FAFC]">
                        {ex.sentence_lez}
                      </p>
                      <p className="text-[#CBD5E1]">{ex.translation_ru}</p>
                    </div>
                  ))}
                </div>
              )}

              <ReportMistakeTrigger entityType="word" entityId={word.id} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
