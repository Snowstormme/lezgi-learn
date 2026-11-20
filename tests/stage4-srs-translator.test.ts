import { describe, expect, it } from 'vitest';
import {
  createInitialSrsCardState,
  getSrsIntervalPreviews,
  scheduleNextSrsCardState,
} from '@/features/learning/fsrs';
import { runVerifiedFirstTranslation } from '@/features/translation/engine';
import { loadAndValidateContentBundle } from '@/content/loader';

describe('Stage 4: FSRS Spaced Repetition & Verified-First Translator', () => {
  it('schedules increasing intervals with ts-fsrs for Again vs Good vs Easy', () => {
    const now = new Date('2026-11-20T12:00:00Z');
    const initial = createInitialSrsCardState(now);

    const againState = scheduleNextSrsCardState(initial, 1, now);
    const goodState = scheduleNextSrsCardState(initial, 3, now);
    const easyState = scheduleNextSrsCardState(initial, 4, now);

    expect(againState.reps).toBe(1);
    expect(goodState.reps).toBe(1);
    expect(easyState.stability).toBeGreaterThan(goodState.stability);
    expect(new Date(easyState.due).getTime()).toBeGreaterThan(
      new Date(againState.due).getTime()
    );

    const previews = getSrsIntervalPreviews(initial, now);
    expect(previews[1]).toContain('мин');
    expect(previews[4]).toContain('д');
  });

  it('Translator Tier 1 returns verified match (isVerified = true) for phrases in verified_phrases', () => {
    const bundle = loadAndValidateContentBundle();
    const phrases = bundle.phrases
      .filter((p) => p.status === 'published')
      .map((p) => ({
        slug: p.slug,
        category: p.category,
        source_ru: p.source_ru,
        target_lez: p.target_lez,
        transcription_ru: p.transcription_ru ?? null,
        context_note_ru: p.context_note_ru ?? null,
        audio_path: null,
        audio_status: 'draft' as const,
      }));
    const words = bundle.words
      .filter((w) => w.status === 'published')
      .map((w) => ({
        slug: w.slug,
        lemma_lez: w.lemma_lez,
        translation_ru: w.translation_ru,
        transcription_ru: w.transcription_ru ?? null,
        part_of_speech: w.part_of_speech ?? null,
        grammar_notes_ru: w.grammar_notes_ru ?? null,
        audio_path: null,
        audio_status: 'draft' as const,
        examples: w.examples,
      }));

    const verifiedPhraseRes = runVerifiedFirstTranslation(
      'Я учу лезгинский язык.',
      'ru_to_lez',
      phrases,
      words
    );

    expect(verifiedPhraseRes.isVerified).toBe(true);
    expect(verifiedPhraseRes.matchTier).toBe('verified_phrase');
    expect(verifiedPhraseRes.translatedText).toBe('За лезги чӀал чирзава.');

    // Lezgi -> Russian with keyboard '1' instead of palochka 'Ӏ'
    const lezToRuRes = runVerifiedFirstTranslation(
      'За лезги ч1ал чирзава!',
      'lez_to_ru',
      phrases,
      words
    );
    expect(lezToRuRes.isVerified).toBe(true);
    expect(lezToRuRes.translatedText).toBe('Я учу лезгинский язык.');
  });

  it('Translator Tier 2 marks unknown composite sentences as unverified draft (isVerified = false)', () => {
    const bundle = loadAndValidateContentBundle();
    const phrases = bundle.phrases.map((p) => ({
      slug: p.slug,
      category: p.category,
      source_ru: p.source_ru,
      target_lez: p.target_lez,
      transcription_ru: null,
      context_note_ru: null,
      audio_path: null,
      audio_status: 'draft' as const,
    }));
    const words = bundle.words.map((w) => ({
      slug: w.slug,
      lemma_lez: w.lemma_lez,
      translation_ru: w.translation_ru,
      transcription_ru: null,
      part_of_speech: null,
      grammar_notes_ru: null,
      audio_path: null,
      audio_status: 'draft' as const,
      examples: w.examples,
    }));

    const draftRes = runVerifiedFirstTranslation(
      'Привет дорогой космонавт',
      'ru_to_lez',
      phrases,
      words
    );

    expect(draftRes.isVerified).toBe(false);
    expect(draftRes.matchTier).toBe('unverified_draft');
    expect(draftRes.wordBreakdown.length).toBeGreaterThanOrEqual(2);
  });
});
