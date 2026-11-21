'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  normalizeLezgiOrthography,
  normalizeRussianForLookup,
} from '@/lib/lezgi-utils';
import type { ActionResult, ContentStatus } from '@/features/shared/types';

const suggestionSchema = z.object({
  requestId: z.string().uuid().nullable().optional(),
  sourceRu: z
    .string()
    .trim()
    .min(1, 'Введите фразу на русском')
    .max(500, 'Слишком длинная фраза'),
  suggestedLez: z
    .string()
    .trim()
    .min(1, 'Введите предлагаемый перевод на лезгинском')
    .max(500, 'Слишком длинный перевод'),
  comment: z.string().trim().max(500).optional(),
});

export interface ContentSuggestionItem {
  id: string;
  source_ru: string;
  suggested_lez: string;
  comment: string | null;
  status: ContentStatus;
  created_at: string;
}

/**
 * Submits a translation suggestion or correction into the moderation queue.
 * Always inserted with status = 'pending_review'. Never published automatically.
 */
export async function submitTranslationSuggestionAction(
  input: z.infer<typeof suggestionSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = suggestionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? 'Некорректные данные предложения',
      code: 'VALIDATION_ERROR',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: 'База данных не подключена',
      code: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error:
        'Войдите в аккаунт, чтобы предложить перевод в очередь модерации носителям.',
      code: 'AUTH_REQUIRED',
    };
  }

  const normalizedLez = normalizeLezgiOrthography(parsed.data.suggestedLez);

  const { data, error } = await supabase
    .from('content_suggestions')
    .insert({
      request_id: parsed.data.requestId ?? null,
      suggested_by: user.id,
      source_ru: parsed.data.sourceRu,
      suggested_lez: normalizedLez,
      comment: parsed.data.comment || null,
      status: 'pending_review',
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: 'Не удалось сохранить предложение в очередь модерации',
      code: 'DB_ERROR',
    };
  }

  revalidatePath('/translate');
  return { ok: true, data: { id: data.id } };
}

export async function getModerationSuggestions(): Promise<
  ContentSuggestionItem[]
> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
      .from('content_suggestions')
      .select('id, source_ru, suggested_lez, comment, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    return data ?? [];
  } catch {
    return [];
  }
}

const moderateSchema = z.object({
  suggestionId: z.string().uuid(),
  decision: z.enum(['published', 'rejected']),
  reviewComment: z.string().trim().max(500).optional(),
});

/**
 * Reviewer / Admin action to approve or reject a pending translation suggestion.
 * When approved ('published'), promotes the phrase into `verified_phrases`.
 */
export async function moderateSuggestionAction(
  input: z.infer<typeof moderateSchema>
): Promise<ActionResult<{ status: ContentStatus }>> {
  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Некорректные данные модерации',
      code: 'VALIDATION_ERROR',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: 'База данных не подключена',
      code: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: 'Требуется авторизация ревьюера',
      code: 'AUTH_REQUIRED',
    };
  }

  const { data: suggestion, error: fetchError } = await supabase
    .from('content_suggestions')
    .select('*')
    .eq('id', parsed.data.suggestionId)
    .single();

  if (fetchError || !suggestion) {
    return {
      ok: false,
      error: 'Предложение не найдено или у вас нет прав модератора',
      code: 'NOT_FOUND',
    };
  }

  const { error: updateError } = await supabase
    .from('content_suggestions')
    .update({
      status: parsed.data.decision,
      reviewer_id: user.id,
      review_comment: parsed.data.reviewComment || null,
    })
    .eq('id', suggestion.id);

  if (updateError) {
    return {
      ok: false,
      error: 'Только носитель-модератор (reviewer / admin) может менять статус',
      code: 'FORBIDDEN',
    };
  }

  if (parsed.data.decision === 'published') {
    const slug = `user-verified-${suggestion.id.slice(0, 8)}`;
    await supabase.from('verified_phrases').upsert(
      {
        slug,
        category: 'daily',
        source_ru: suggestion.source_ru,
        target_lez: normalizeLezgiOrthography(suggestion.suggested_lez),
        normalized_ru: normalizeRussianForLookup(suggestion.source_ru),
        context_note_ru: suggestion.comment,
        status: 'published',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );
  }

  revalidatePath('/translate');
  return { ok: true, data: { status: parsed.data.decision } };
}
