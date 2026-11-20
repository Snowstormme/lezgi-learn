import {
  normalizeLezgiInputForComparison,
  normalizeLezgiOrthography,
  normalizeRussianForLookup,
} from '@/lib/lezgi-utils';
import type { DictionaryWordItem } from '@/features/dictionary/queries';
import type { PhrasebookEntry } from '@/features/phrasebook/queries';

export type TranslationDirection = 'ru_to_lez' | 'lez_to_ru';

export interface WordBreakdownItem {
  sourceToken: string;
  matchedLez: string;
  matchedRu: string;
  transcriptionRu: string | null;
}

export interface TranslationResult {
  queryText: string;
  direction: TranslationDirection;
  translatedText: string;
  transcriptionRu: string | null;
  contextNoteRu: string | null;
  isVerified: boolean;
  matchTier: 'verified_phrase' | 'verified_word' | 'unverified_draft';
  matchedSlug: string | null;
  matchedPhraseId?: string | null;
  wordBreakdown: WordBreakdownItem[];
  relatedPhrases: Array<{
    slug: string;
    source_ru: string;
    target_lez: string;
  }>;
  requestId?: string | null;
}

/**
 * Pure 3-tier translation lookup engine:
 * 1. Exact match in verified_phrases (status = 'published')
 * 2. Exact match in dictionary words or usage examples (status = 'published')
 * 3. Unverified draft assembled from verified stems (ALWAYS marked isVerified: false)
 */
export function runVerifiedFirstTranslation(
  queryText: string,
  direction: TranslationDirection,
  phrases: PhrasebookEntry[],
  words: DictionaryWordItem[]
): TranslationResult {
  const trimmed = queryText.trim();

  if (direction === 'ru_to_lez') {
    const normQueryRu = normalizeRussianForLookup(trimmed);

    // Tier 1A: Exact match in verified_phrases
    const exactPhrase = phrases.find(
      (p) => normalizeRussianForLookup(p.source_ru) === normQueryRu
    );
    if (exactPhrase) {
      return {
        queryText: trimmed,
        direction,
        translatedText: exactPhrase.target_lez,
        transcriptionRu: exactPhrase.transcription_ru,
        contextNoteRu: exactPhrase.context_note_ru,
        isVerified: true,
        matchTier: 'verified_phrase',
        matchedSlug: exactPhrase.slug,
        matchedPhraseId: exactPhrase.id ?? null,
        wordBreakdown: [],
        relatedPhrases: findRelatedPhrasesRu(normQueryRu, phrases, exactPhrase.slug),
      };
    }

    // Tier 1B: Exact match in published dictionary words or usage examples
    const exactWord = words.find((w) => {
      const variants = w.translation_ru
        .split(/[/,;()]/)
        .map((v) => normalizeRussianForLookup(v))
        .filter(Boolean);
      return (
        normalizeRussianForLookup(w.translation_ru) === normQueryRu ||
        variants.includes(normQueryRu)
      );
    });

    if (exactWord) {
      return {
        queryText: trimmed,
        direction,
        translatedText: exactWord.lemma_lez,
        transcriptionRu: exactWord.transcription_ru,
        contextNoteRu: exactWord.grammar_notes_ru,
        isVerified: true,
        matchTier: 'verified_word',
        matchedSlug: exactWord.slug,
        wordBreakdown: [
          {
            sourceToken: trimmed,
            matchedLez: exactWord.lemma_lez,
            matchedRu: exactWord.translation_ru,
            transcriptionRu: exactWord.transcription_ru,
          },
        ],
        relatedPhrases: findRelatedPhrasesRu(normQueryRu, phrases),
      };
    }

    for (const word of words) {
      for (const ex of word.examples) {
        if (normalizeRussianForLookup(ex.translation_ru) === normQueryRu) {
          return {
            queryText: trimmed,
            direction,
            translatedText: ex.sentence_lez,
            transcriptionRu: null,
            contextNoteRu: `Пример к слову «${word.lemma_lez}» (${word.translation_ru})`,
            isVerified: true,
            matchTier: 'verified_phrase',
            matchedSlug: ex.slug,
            wordBreakdown: [],
            relatedPhrases: findRelatedPhrasesRu(normQueryRu, phrases),
          };
        }
      }
    }

    // Tier 2: Unverified draft (composes token matches from verified dictionary + clearly flags as unverified)
    const tokens = normQueryRu.split(' ').filter(Boolean);
    const breakdown: WordBreakdownItem[] = [];
    const draftTokens: string[] = [];

    for (const token of tokens) {
      const matched = words.find((w) => {
        const variants = w.translation_ru
          .split(/[/,;()]/)
          .map((v) => normalizeRussianForLookup(v))
          .filter(Boolean);
        return (
          variants.includes(token) ||
          variants.some((v) => v.split(' ').includes(token))
        );
      });

      if (matched) {
        breakdown.push({
          sourceToken: token,
          matchedLez: matched.lemma_lez,
          matchedRu: matched.translation_ru,
          transcriptionRu: matched.transcription_ru,
        });
        draftTokens.push(matched.lemma_lez);
      } else {
        draftTokens.push(`[${token}?]`);
      }
    }

    const draftText =
      breakdown.length > 0
        ? draftTokens.join(' ')
        : `Черновой перевод для «${trimmed}» (точное совпадение отсутствует в проверенной базе)`;

    return {
      queryText: trimmed,
      direction,
      translatedText: draftText,
      transcriptionRu: null,
      contextNoteRu:
        'Собрано автоматически по отдельным корням словаря. Порядок слов в лезгинском предложении (SOV: Подлежащее — Дополнение — Сказуемое) и падежные окончания требуют проверки носителем.',
      isVerified: false,
      matchTier: 'unverified_draft',
      matchedSlug: null,
      wordBreakdown: breakdown,
      relatedPhrases: findRelatedPhrasesRu(normQueryRu, phrases),
    };
  }

  // Direction: lez_to_ru (Лезгинский -> Русский)
  const normQueryLez = normalizeLezgiInputForComparison(trimmed);

  // Tier 1A: Exact match in verified_phrases
  const exactPhraseLez = phrases.find(
    (p) => normalizeLezgiInputForComparison(p.target_lez) === normQueryLez
  );
  if (exactPhraseLez) {
    return {
      queryText: normalizeLezgiOrthography(trimmed),
      direction,
      translatedText: exactPhraseLez.source_ru,
      transcriptionRu: exactPhraseLez.transcription_ru,
      contextNoteRu: exactPhraseLez.context_note_ru,
      isVerified: true,
      matchTier: 'verified_phrase',
      matchedSlug: exactPhraseLez.slug,
      matchedPhraseId: exactPhraseLez.id ?? null,
      wordBreakdown: [],
      relatedPhrases: findRelatedPhrasesLez(
        normQueryLez,
        phrases,
        exactPhraseLez.slug
      ),
    };
  }

  // Tier 1B: Exact match in dictionary words or examples
  const exactWordLez = words.find(
    (w) => normalizeLezgiInputForComparison(w.lemma_lez) === normQueryLez
  );
  if (exactWordLez) {
    return {
      queryText: exactWordLez.lemma_lez,
      direction,
      translatedText: exactWordLez.translation_ru,
      transcriptionRu: exactWordLez.transcription_ru,
      contextNoteRu: exactWordLez.grammar_notes_ru,
      isVerified: true,
      matchTier: 'verified_word',
      matchedSlug: exactWordLez.slug,
      wordBreakdown: [
        {
          sourceToken: exactWordLez.lemma_lez,
          matchedLez: exactWordLez.lemma_lez,
          matchedRu: exactWordLez.translation_ru,
          transcriptionRu: exactWordLez.transcription_ru,
        },
      ],
      relatedPhrases: findRelatedPhrasesLez(normQueryLez, phrases),
    };
  }

  for (const word of words) {
    for (const ex of word.examples) {
      if (normalizeLezgiInputForComparison(ex.sentence_lez) === normQueryLez) {
        return {
          queryText: ex.sentence_lez,
          direction,
          translatedText: ex.translation_ru,
          transcriptionRu: null,
          contextNoteRu: `Пример к слову «${word.lemma_lez}» (${word.translation_ru})`,
          isVerified: true,
          matchTier: 'verified_phrase',
          matchedSlug: ex.slug,
          wordBreakdown: [],
          relatedPhrases: findRelatedPhrasesLez(normQueryLez, phrases),
        };
      }
    }
  }

  // Tier 2: Unverified word-by-word draft (Lezgi -> Russian)
  const lezTokens = normQueryLez.split(' ').filter(Boolean);
  const breakdown: WordBreakdownItem[] = [];
  const draftRuTokens: string[] = [];

  for (const token of lezTokens) {
    const matched = words.find(
      (w) => normalizeLezgiInputForComparison(w.lemma_lez) === token
    );
    if (matched) {
      breakdown.push({
        sourceToken: token,
        matchedLez: matched.lemma_lez,
        matchedRu: matched.translation_ru,
        transcriptionRu: matched.transcription_ru,
      });
      draftRuTokens.push(matched.translation_ru.split('/')[0].trim());
    } else {
      draftRuTokens.push(`[${token}?]`);
    }
  }

  const draftRuText =
    breakdown.length > 0
      ? draftRuTokens.join(' ')
      : `Черновой перевод для «${normalizeLezgiOrthography(trimmed)}» (требуется проверка носителем)`;

  return {
    queryText: normalizeLezgiOrthography(trimmed),
    direction,
    translatedText: draftRuText,
    transcriptionRu: null,
    contextNoteRu:
      'Пословный черновик. Не является проверенным переводом и ожидает модерации носителем.',
    isVerified: false,
    matchTier: 'unverified_draft',
    matchedSlug: null,
    wordBreakdown: breakdown,
    relatedPhrases: findRelatedPhrasesLez(normQueryLez, phrases),
  };
}

function findRelatedPhrasesRu(
  normQueryRu: string,
  phrases: PhrasebookEntry[],
  excludeSlug?: string
) {
  const queryWords = normQueryRu.split(' ').filter((w) => w.length >= 3);
  if (queryWords.length === 0) return [];

  return phrases
    .filter((p) => {
      if (p.slug === excludeSlug) return false;
      const normSource = normalizeRussianForLookup(p.source_ru);
      return queryWords.some((qw) => normSource.includes(qw));
    })
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      source_ru: p.source_ru,
      target_lez: p.target_lez,
    }));
}

function findRelatedPhrasesLez(
  normQueryLez: string,
  phrases: PhrasebookEntry[],
  excludeSlug?: string
) {
  const queryWords = normQueryLez.split(' ').filter((w) => w.length >= 2);
  if (queryWords.length === 0) return [];

  return phrases
    .filter((p) => {
      if (p.slug === excludeSlug) return false;
      const normTarget = normalizeLezgiInputForComparison(p.target_lez);
      return queryWords.some((qw) => normTarget.includes(qw));
    })
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      source_ru: p.source_ru,
      target_lez: p.target_lez,
    }));
}
