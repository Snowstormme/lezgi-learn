'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isSupabaseConfigured } from '@/lib/env';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import type { ActionResult } from '@/features/shared/types';

const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(40, 'Имя должно быть короче 40 символов');

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
