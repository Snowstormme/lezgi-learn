import { loadAndValidateContentBundle } from '@/content/loader';
import {
  createInitialSrsCardState,
  type StoredSrsCardState,
} from './fsrs';

export const GUEST_SRS_COOKIE = 'lezgi_guest_srs';

interface CompactGuestSrsEntry {
  st: number; // state
  du: string; // due ISO
  sb: number; // stability
  df: number; // difficulty
  sd: number; // scheduled_days
  rp: number; // reps
  lp: number; // lapses
  lr: string | null; // last_review ISO
}

export type GuestSrsMap = Record<string, StoredSrsCardState>;

export function parseGuestSrsCookie(raw: string | undefined): GuestSrsMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<
      string,
      CompactGuestSrsEntry
    >;
    if (!parsed || typeof parsed !== 'object') return {};

    const out: GuestSrsMap = {};
    for (const [slug, entry] of Object.entries(parsed)) {
      if (!entry || typeof entry.du !== 'string') continue;
      out[slug] = {
        state: Number(entry.st) || 0,
        due: entry.du,
        stability: Number(entry.sb) || 0,
        difficulty: Number(entry.df) || 0,
        elapsed_days: 0,
        scheduled_days: Number(entry.sd) || 0,
        reps: Number(entry.rp) || 0,
        lapses: Number(entry.lp) || 0,
        last_review: typeof entry.lr === 'string' ? entry.lr : null,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function serializeGuestSrsCookie(map: GuestSrsMap): string {
  const compact: Record<string, CompactGuestSrsEntry> = {};
  for (const [slug, s] of Object.entries(map)) {
    compact[slug] = {
      st: s.state,
      du: s.due,
      sb: s.stability,
      df: s.difficulty,
      sd: s.scheduled_days,
      rp: s.reps,
      lp: s.lapses,
      lr: s.last_review,
    };
  }
  return encodeURIComponent(JSON.stringify(compact));
}

/**
 * Returns the unique published word slugs taught in the given completed lessons,
 * preserving lesson progression order.
 */
export function collectLearnedWordSlugs(
  completedLessonSlugs: Iterable<string>
): string[] {
  const completedSet = new Set(completedLessonSlugs);
  if (completedSet.size === 0) return [];

  const bundle = loadAndValidateContentBundle();
  const publishedWordSlugs = new Set(
    bundle.words.filter((w) => w.status === 'published').map((w) => w.slug)
  );

  const orderedCompletedLessons = bundle.lessons
    .filter((l) => l.status === 'published' && completedSet.has(l.slug))
    .sort((a, b) => a.order_index - b.order_index);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const lesson of orderedCompletedLessons) {
    for (const ex of lesson.exercises) {
      if (
        ex.status === 'published' &&
        ex.word_slug &&
        publishedWordSlugs.has(ex.word_slug) &&
        !seen.has(ex.word_slug)
      ) {
        seen.add(ex.word_slug);
        result.push(ex.word_slug);
      }
    }
  }

  return result;
}

export function formatNextDueLabel(dueIso: string, now: Date = new Date()): string {
  const diffMs = new Date(dueIso).getTime() - now.getTime();
  if (diffMs <= 60_000) return 'сейчас';
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return `через ${diffMin} мин`;
  const diffHours = Math.round(diffMs / 3_600_000);
  if (diffHours < 24) return `через ${diffHours} ч`;
  const diffDays = Math.max(1, Math.round(diffMs / 86_400_000));
  return `через ${diffDays} д`;
}

export { createInitialSrsCardState };
