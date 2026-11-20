'use server';

import { z } from 'zod';
import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPublishedPhrases } from '@/features/phrasebook/queries';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import type { ActionResult } from '@/features/shared/types';
import {
  runVerifiedFirstTranslation,
  type TranslationResult,
} from './engine';

const translateInputSchema = z.object({
  queryText: z
    .string()
    .trim()
    .min(1, 'Введите слово или фразу для перевода')
    .max(500, 'Текст слишком длинный (максимум 500 символов)'),
  direction: z.enum(['ru_to_lez', 'lez_to_ru']),
});

export async function translateTextAction(
  input: z.infer<typeof translateInputSchema>
): Promise<ActionResult<TranslationResult>> {
  const parsed = translateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Некорректный запрос',
      code: 'VALIDATION_ERROR',
    };
  }

  const [phrases, words] = await Promise.all([
    getPublishedPhrases(),
    getPublishedDictionaryWords(),
  ]);

  const result = runVerifiedFirstTranslation(
    parsed.data.queryText,
    parsed.data.direction,
    phrases,
    words
  );

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: reqRow } = await supabase
        .from('translation_requests')
        .insert({
          user_id: user?.id ?? null,
          direction: parsed.data.direction,
          query_text: parsed.data.queryText,
          matched_phrase_id: result.matchedPhraseId ?? null,
          llm_draft_output: result.isVerified ? null : result.translatedText,
          is_verified: result.isVerified,
        })
        .select('id')
        .maybeSingle();

      result.requestId = reqRow?.id ?? null;
    } catch {
      // Non-fatal if logging fails
    }
  }

  return { ok: true, data: result };
}
