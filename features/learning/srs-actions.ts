'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/env';
import {
  createSupabaseServerClient,
  getCurrentAuthUser,
} from '@/lib/supabase/server';
import type { ActionResult } from '@/features/shared/types';
import {
  createInitialSrsCardState,
  scheduleNextSrsCardState,
  type SrsRatingGrade,
  type StoredSrsCardState,
} from './fsrs';
import {
  GUEST_SRS_COOKIE,
  parseGuestSrsCookie,
  serializeGuestSrsCookie,
} from './srs-guest-cookie';

const reviewCardSchema = z.object({
  wordId: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).optional(),
  grade: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  currentState: z.object({
    state: z.number(),
    due: z.string(),
    stability: z.number(),
    difficulty: z.number(),
    elapsed_days: z.number(),
    scheduled_days: z.number(),
    reps: z.number(),
    lapses: z.number(),
    last_review: z.string().nullable(),
  }),
});

export async function reviewWordCardAction(
  input: z.infer<typeof reviewCardSchema>
): Promise<
  ActionResult<{
    nextState: StoredSrsCardState;
    savedToDb: boolean;
  }>
> {
  const parsed = reviewCardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Некорректные данные карточки повторения',
      code: 'VALIDATION_ERROR',
    };
  }

  const nextState = scheduleNextSrsCardState(
    parsed.data.currentState ?? createInitialSrsCardState(),
    parsed.data.grade as SrsRatingGrade
  );

  const user = isSupabaseConfigured()
    ? await getCurrentAuthUser().catch(() => null)
    : null;

  if (user && isSupabaseConfigured() && parsed.data.wordId) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from('user_word_cards').upsert(
        {
          user_id: user.id,
          word_id: parsed.data.wordId,
          state: nextState.state,
          due: nextState.due,
          stability: nextState.stability,
          difficulty: nextState.difficulty,
          elapsed_days: nextState.elapsed_days,
          scheduled_days: nextState.scheduled_days,
          reps: nextState.reps,
          lapses: nextState.lapses,
          last_review: nextState.last_review,
        },
        { onConflict: 'user_id,word_id' }
      );

      if (!error) {
        revalidatePath('/review');
        return {
          ok: true,
          data: { nextState, savedToDb: true },
        };
      }
    } catch {
      // Fall through to cookie persistence
    }
  }

  // Persist spaced-repetition schedule for guests in cookie so daily review works without login
  if (parsed.data.slug) {
    try {
      const cookieStore = await cookies();
      const existing = parseGuestSrsCookie(
        cookieStore.get(GUEST_SRS_COOKIE)?.value
      );
      existing[parsed.data.slug] = nextState;
      cookieStore.set(GUEST_SRS_COOKIE, serializeGuestSrsCookie(existing), {
        path: '/',
        maxAge: 60 * 60 * 24 * 180,
        sameSite: 'lax',
      });
      revalidatePath('/review');
    } catch {
      // Ignore cookie write errors in non-request contexts
    }
  }

  return {
    ok: true,
    data: { nextState, savedToDb: false },
  };
}
