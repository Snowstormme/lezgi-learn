import { cache } from 'react';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { getPublicEnv, isSupabaseConfigured } from '@/lib/env';

export async function createSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const cookieStore = await cookies();
  const env = getPublicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored inside Server Components
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>;
}

/**
 * Per-request deduplicated auth lookup.
 * Returns null immediately in 0ms for guests without any `sb-*` session cookie.
 */
export const getCurrentAuthUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const hasAuthCookie = cookieStore
      .getAll()
      .some((cookie) => cookie.name.startsWith('sb-'));
    if (!hasAuthCookie) {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});
