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

export const PINNED_MEDAL_COOKIE = 'lezgi_pinned_medal';
export const PROFILE_AVATAR_COOKIE = 'lezgi_profile_avatar';

export interface CurrentUserSession {
  isAuthenticated: boolean;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  xp: number;
  streakDays: number;
  pinnedMedalId: string | null;
  avatarId: string | null;
  createdAt: string | null;
  lastActiveDate: string | null;
}

async function readPinnedMedalCookieSafe(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(PINNED_MEDAL_COOKIE)?.value?.trim() || null;
  } catch {
    return null;
  }
}

async function readProfileAvatarCookieSafe(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(PROFILE_AVATAR_COOKIE)?.value?.trim() || null;
  } catch {
    return null;
  }
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
  const [cookiePinned, cookieAvatar] = await Promise.all([
    readPinnedMedalCookieSafe(),
    readProfileAvatarCookieSafe(),
  ]);

  if (!isSupabaseConfigured()) {
    const guest = await computeGuestStatsFromCookie();
    return {
      isAuthenticated: false,
      email: null,
      displayName: null,
      role: 'learner',
      xp: guest.xp,
      streakDays: guest.streakDays,
      pinnedMedalId: cookiePinned,
      avatarId: cookieAvatar,
      createdAt: null,
      lastActiveDate: null,
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
        pinnedMedalId: cookiePinned,
        avatarId: cookieAvatar,
        createdAt: null,
        lastActiveDate: null,
      };
    }

    const supabase = await createSupabaseServerClient();

    // Try reading pinned_medal_id & avatar_id from profiles first; fall back cleanly if migrations 0003/0004 are not yet applied
    let profileRow: {
      display_name: string | null;
      role: UserRole | null;
      xp: number | null;
      streak_days: number | null;
      created_at?: string | null;
      last_active_date?: string | null;
      pinned_medal_id?: string | null;
      avatar_id?: string | null;
    } | null = null;

    const fullRes = await supabase
      .from('profiles')
      .select(
        'display_name, role, xp, streak_days, created_at, last_active_date, pinned_medal_id, avatar_id'
      )
      .eq('id', user.id)
      .single();

    if (!fullRes.error && fullRes.data) {
      profileRow = fullRes.data;
    } else {
      const baseRes = await supabase
        .from('profiles')
        .select(
          'display_name, role, xp, streak_days, created_at, last_active_date'
        )
        .eq('id', user.id)
        .single();
      profileRow = baseRes.data;
    }

    const metaPinned =
      typeof user.user_metadata?.pinned_medal_id === 'string'
        ? user.user_metadata.pinned_medal_id
        : null;
    const metaAvatar =
      typeof user.user_metadata?.avatar_id === 'string'
        ? user.user_metadata.avatar_id
        : null;

    return {
      isAuthenticated: true,
      email: user.email ?? null,
      displayName:
        profileRow?.display_name ??
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split('@')[0] ??
        'Ученик',
      role: profileRow?.role ?? 'learner',
      xp: profileRow?.xp ?? 0,
      streakDays: profileRow?.streak_days ?? 0,
      pinnedMedalId: profileRow?.pinned_medal_id ?? metaPinned ?? cookiePinned,
      avatarId: profileRow?.avatar_id ?? metaAvatar ?? cookieAvatar,
      createdAt: profileRow?.created_at ?? user.created_at ?? null,
      lastActiveDate: profileRow?.last_active_date ?? null,
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
      pinnedMedalId: cookiePinned,
      avatarId: cookieAvatar,
      createdAt: null,
      lastActiveDate: null,
    };
  }
}
