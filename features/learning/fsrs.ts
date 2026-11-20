import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card as FsrsCard,
  type Grade,
} from 'ts-fsrs';

const params = generatorParameters({
  enable_fuzz: false,
  request_retention: 0.9,
});

const scheduler = fsrs(params);

export type SrsRatingGrade = 1 | 2 | 3 | 4;

export interface StoredSrsCardState {
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
}

export function createInitialSrsCardState(
  now: Date = new Date()
): StoredSrsCardState {
  const empty = createEmptyCard(now);
  return {
    state: empty.state,
    due: empty.due.toISOString(),
    stability: empty.stability,
    difficulty: empty.difficulty,
    elapsed_days: 0,
    scheduled_days: empty.scheduled_days,
    reps: empty.reps,
    lapses: empty.lapses,
    last_review: null,
  };
}

function toFsrsCard(stored: StoredSrsCardState): FsrsCard {
  return {
    due: new Date(stored.due),
    stability: stored.stability,
    difficulty: stored.difficulty,
    scheduled_days: stored.scheduled_days,
    learning_steps: 0,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state as State,
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  } as FsrsCard;
}

const GRADE_MAP: Record<SrsRatingGrade, Grade> = {
  1: Rating.Again,
  2: Rating.Hard,
  3: Rating.Good,
  4: Rating.Easy,
};

export function scheduleNextSrsCardState(
  current: StoredSrsCardState,
  gradeNum: SrsRatingGrade,
  now: Date = new Date()
): StoredSrsCardState {
  const card = toFsrsCard(current);
  const grade = GRADE_MAP[gradeNum];
  const result = scheduler.next(card, now, grade);
  const nextCard = result.card;

  const elapsedDays = current.last_review
    ? Math.max(
        0,
        Math.round(
          (now.getTime() - new Date(current.last_review).getTime()) / 86400000
        )
      )
    : 0;

  return {
    state: nextCard.state,
    due: nextCard.due.toISOString(),
    stability: Number(nextCard.stability.toFixed(4)),
    difficulty: Number(nextCard.difficulty.toFixed(4)),
    elapsed_days: elapsedDays,
    scheduled_days: nextCard.scheduled_days,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    last_review: now.toISOString(),
  };
}

/**
 * Computes human-readable Russian interval previews for all 4 FSRS ratings (Again, Hard, Good, Easy).
 */
export function getSrsIntervalPreviews(
  current: StoredSrsCardState,
  now: Date = new Date()
): Record<SrsRatingGrade, string> {
  const grades: SrsRatingGrade[] = [1, 2, 3, 4];
  const previews = {} as Record<SrsRatingGrade, string>;

  for (const g of grades) {
    const next = scheduleNextSrsCardState(current, g, now);
    const diffMs = new Date(next.due).getTime() - now.getTime();
    const diffMin = Math.max(1, Math.round(diffMs / 60000));

    if (diffMin < 60) {
      previews[g] = `${diffMin} мин`;
    } else if (diffMin < 1440) {
      previews[g] = `${Math.round(diffMin / 60)} ч`;
    } else {
      const days = Math.max(1, Math.round(diffMin / 1440));
      previews[g] = `${days} д`;
    }
  }

  return previews;
}
