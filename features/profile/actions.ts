'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isSupabaseConfigured } from '@/lib/env';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import { ACHIEVEMENT_IDS } from '@/components/profile/achievements';
import { PINNED_MEDAL_COOKIE } from '@/features/profile/queries';
import type { ActionResult } from '@/features/shared/types';

const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(40, 'Имя должно быть короче 40 символов');

const medalIdSchema = z.enum(ACHIEVEMENT_IDS);

export async function updateDisplayNameAction(
  displayName: string
): Promise<ActionResult<{ displayName: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: 'Синхронизация профиля недоступна в автономном режиме',
      code: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  const parsed = displayNameSchema.safeParse(displayName);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Некорректное имя',
      code: 'VALIDATION_ERROR',
    };
  }

  const user = await getCurrentAuthUser();
  if (!user) {
    return {
      ok: false,
      error: 'Войдите в аккаунт, чтобы изменить имя',
      code: 'UNAUTHORIZED',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: parsed.data })
    .eq('id', user.id);

  if (error) {
    return {
      ok: false,
      error: 'Не удалось сохранить имя. Попробуйте ещё раз.',
      code: 'DB_ERROR',
    };
  }

  await supabase.auth
    .updateUser({ data: { display_name: parsed.data } })
    .catch(() => null);

  revalidatePath('/', 'layout');
  return { ok: true, data: { displayName: parsed.data } };
}

export async function pinProfileMedalAction(
  medalId: string
): Promise<ActionResult<{ medalId: string }>> {
  const parsed = medalIdSchema.safeParse(medalId);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Некорректный идентификатор награды',
      code: 'VALIDATION_ERROR',
    };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(PINNED_MEDAL_COOKIE, parsed.data, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    // Ignore cookie write failure outside request context
  }

  if (isSupabaseConfigured()) {
    try {
      const user = await getCurrentAuthUser();
      if (user) {
        const supabase = await createSupabaseServerClient();
        await supabase
          .from('profiles')
          .update({ pinned_medal_id: parsed.data })
          .eq('id', user.id);
        await supabase.auth
          .updateUser({ data: { pinned_medal_id: parsed.data } })
          .catch(() => null);
      }
    } catch {
      // Cookie fallback still preserves choice if DB column is pending migration
    }
  }

  revalidatePath('/profile');
  return { ok: true, data: { medalId: parsed.data } };
}
