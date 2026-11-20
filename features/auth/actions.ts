'use server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import type { ActionResult } from '@/features/shared/types';
import { revalidatePath } from 'next/cache';

const signInSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

const signUpSchema = signInSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя слишком длинное'),
});

export async function signInWithPasswordAction(
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        'Supabase ещё не подключён. Заполните NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local.',
      code: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Некорректные данные входа',
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      error: 'Неверный email или пароль',
      code: 'AUTH_ERROR',
    };
  }

  revalidatePath('/', 'layout');
  return { ok: true, data: { email: parsed.data.email } };
}

export async function signUpWithPasswordAction(
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        'Supabase ещё не подключён. Заполните NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local.',
      code: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? 'Некорректные данные регистрации',
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  });

  if (error) {
    return {
      ok: false,
      error: error.message || 'Не удалось создать аккаунт',
      code: 'AUTH_ERROR',
    };
  }

  revalidatePath('/', 'layout');
  return { ok: true, data: { email: parsed.data.email } };
}

export async function signOutAction(): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true, data: undefined };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return { ok: true, data: undefined };
}
