'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/features/shared/types';
import { createInitialSrsCardState } from './fsrs';
import {
  GUEST_COMPLETED_COOKIE,
  mergeGuestProgress,
  parseGuestProgressCookie,
} from './progression';

async function saveGuestLessonCompletion(
  lessonSlug: string,
  score: number
): Promise<number> {
  const cookieStore = await cookies();
  const current = parseGuestProgressCookie(
    cookieStore.get(GUEST_COMPLETED_COOKIE)?.value
  );
  const updated = mergeGuestProgress(current, lessonSlug, score);

  cookieStore.set(GUEST_COMPLETED_COOKIE, JSON.stringify(updated), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath('/learn');
  revalidatePath('/[locale]/(main)/learn', 'page');

  return updated[lessonSlug] ?? score;
}

const completeLessonSchema = z.object({
  lessonSlug: z.string().min(2).max(80),
  score: z.number().int().min(0).max(100),
});

export interface CompleteLessonPayload {
  savedToAccount: boolean;
  xpEarned: number;
  bestScore: number;
}

export async function completeLessonAction(
  input: z.infer<typeof completeLessonSchema>
): Promise<ActionResult<CompleteLessonPayload>> {
  const parsed = completeLessonSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Некорректные данные завершения урока',
      code: 'VALIDATION_ERROR',
    };
  }

  const xpEarned = Math.max(5, Math.round(parsed.data.score * 0.15));

  if (!isSupabaseConfigured()) {
    const bestScore = await saveGuestLessonCompletion(
      parsed.data.lessonSlug,
      parsed.data.score
    );
    return {
      ok: true,
      data: {
        savedToAccount: false,
        xpEarned,
        bestScore,
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const bestScore = await saveGuestLessonCompletion(
      parsed.data.lessonSlug,
      parsed.data.score
    );
    return {
      ok: true,
      data: {
        savedToAccount: false,
        xpEarned,
        bestScore,
      },
    };
  }

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id')
    .eq('slug', parsed.data.lessonSlug)
    .eq('status', 'published')
    .single();

  if (!lesson) {
    return {
      ok: false,
      error: 'Урок не найден в базе данных',
      code: 'NOT_FOUND',
    };
  }

  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('id, score, attempts_count')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .maybeSingle();

  const bestScore = Math.max(
    parsed.data.score,
    existingProgress?.score ?? 0
  );
  const attemptsCount = (existingProgress?.attempts_count ?? 0) + 1;

  const { error: progressError } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        status: 'completed',
        score: bestScore,
        attempts_count: attemptsCount,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );

  if (progressError) {
    return {
      ok: false,
      error: 'Не удалось сохранить прогресс урока',
      code: 'DB_ERROR',
    };
  }

  // Enroll practiced lesson words into user_word_cards (FSRS)
  const { data: lessonExercises } = await supabase
    .from('exercises')
    .select('word_id')
    .eq('lesson_id', lesson.id)
    .not('word_id', 'is', null);

  const uniqueWordIds = [
    ...new Set(
      (lessonExercises ?? [])
        .map((ex) => ex.word_id)
        .filter((wid): wid is string => Boolean(wid))
    ),
  ];

  if (uniqueWordIds.length > 0) {
    const initialCard = createInitialSrsCardState();
    const cardRows = uniqueWordIds.map((wordId) => ({
      user_id: user.id,
      word_id: wordId,
      ...initialCard,
    }));

    await supabase
      .from('user_word_cards')
      .upsert(cardRows, { onConflict: 'user_id,word_id', ignoreDuplicates: true });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, streak_days, last_active_date')
    .eq('id', user.id)
    .single();

  if (profile) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const isNewActiveDay = profile.last_active_date !== todayStr;

    await supabase
      .from('profiles')
      .update({
        xp: profile.xp + xpEarned,
        streak_days: isNewActiveDay
          ? Math.max(1, profile.streak_days + 1)
          : Math.max(1, profile.streak_days),
        last_active_date: todayStr,
      })
      .eq('id', user.id);
  }

  revalidatePath('/learn');
  revalidatePath('/[locale]/(main)/learn', 'page');
  revalidatePath('/profile');

  return {
    ok: true,
    data: {
      savedToAccount: true,
      xpEarned,
      bestScore,
    },
  };
}

const reportSchema = z.object({
  entityType: z.enum(['word', 'word_example', 'exercise', 'lesson']),
  entityId: z.string().uuid('Для отправки репорта нужен UUID записи в БД'),
  comment: z
    .string()
    .trim()
    .min(3, 'Комментарий должен содержать минимум 3 символа')
    .max(1000, 'Комментарий слишком длинный'),
});

export async function submitContentReportAction(
  input: z.infer<typeof reportSchema>
): Promise<ActionResult<{ reportId: string }>> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Некорректные данные репорта',
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
      error: 'Войдите в аккаунт, чтобы отправить сообщение об ошибке',
      code: 'AUTH_REQUIRED',
    };
  }

  const { data, error } = await supabase
    .from('content_reports')
    .insert({
      reporter_id: user.id,
      entity_type: parsed.data.entityType,
      entity_id: parsed.data.entityId,
      comment: parsed.data.comment,
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: 'Не удалось отправить сообщение об ошибке',
      code: 'DB_ERROR',
    };
  }

  return { ok: true, data: { reportId: data.id } };
}
