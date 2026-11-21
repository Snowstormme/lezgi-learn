import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/env';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import {
  GUEST_COMPLETED_COOKIE,
  parseGuestProgressCookie,
} from '@/features/learning/progression';
import type { UserRole } from '@/features/shared/types';

export interface CurrentUserSession {
  isAuthenticated: boolean;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  xp: number;
  streakDays: number;
}

async function computeGuestStatsFromCookie(): Promise<{
  xp: number;
  streakDays: number;
}> {
  try {
    const cookieStore = await cookies();
    const guestMap = parseGuestProgressCookie(
      cookieStore.get(GUEST_COMPLETED_COOKIE)?.value
    );
    const entries = Object.entries(guestMap);
    if (entries.length === 0) {
      return { xp: 0, streakDays: 0 };
    }

    let xp = 0;
    for (const [key, score] of entries) {
      if (key.startsWith('chest-')) {
        xp += 25;
      } else {
        xp += Math.max(5, Math.round(score * 0.15));
      }
    }
    return { xp, streakDays: 1 };
  } catch {
    return { xp: 0, streakDays: 0 };
  }
}

export async function getCurrentUserSession(): Promise<CurrentUserSession> {
  if (!isSupabaseConfigured()) {
    const guest = await computeGuestStatsFromCookie();
    return {
      isAuthenticated: false,
      email: null,
      displayName: null,
      role: 'learner',
      xp: guest.xp,
      streakDays: guest.streakDays,
    };
  }

  try {
    const user = await getCurrentAuthUser();

    if (!user) {
      const guest = await computeGuestStatsFromCookie();
      return {
        isAuthenticated: false,
        email: null,
        displayName: null,
        role: 'learner',
        xp: guest.xp,
        streakDays: guest.streakDays,
      };
    }

    const supabase = await createSupabaseServerClient();
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
    const guest = await computeGuestStatsFromCookie();
    return {
      isAuthenticated: false,
      email: null,
      displayName: null,
      role: 'learner',
      xp: guest.xp,
      streakDays: guest.streakDays,
    };
  }
}
