import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserRole } from '@/features/shared/types';

export interface CurrentUserSession {
  isAuthenticated: boolean;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  xp: number;
  streakDays: number;
}

export async function getCurrentUserSession(): Promise<CurrentUserSession> {
  if (!isSupabaseConfigured()) {
    return {
      isAuthenticated: false,
      email: null,
      displayName: null,
      role: 'learner',
      xp: 0,
      streakDays: 0,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAuthenticated: false,
        email: null,
        displayName: null,
        role: 'learner',
        xp: 0,
        streakDays: 0,
      };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, role, xp, streak_days')
      .eq('id', user.id)
      .single();

    return {
      isAuthenticated: true,
      email: user.email ?? null,
      displayName:
        profile?.display_name ??
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split('@')[0] ??
        'Ученик',
      role: profile?.role ?? 'learner',
      xp: profile?.xp ?? 0,
      streakDays: profile?.streak_days ?? 0,
    };
  } catch {
    return {
      isAuthenticated: false,
      email: null,
      displayName: null,
      role: 'learner',
      xp: 0,
      streakDays: 0,
    };
  }
}
