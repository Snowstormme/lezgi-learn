import type {
  ContentStatus,
  ExerciseType,
  InterfaceLocale,
  ReportStatus,
  UserRole,
} from '@/lib/supabase/database.types';

export type {
  ContentStatus,
  ExerciseType,
  InterfaceLocale,
  ReportStatus,
  UserRole,
};

/**
 * Standard return envelope for all Server Actions.
 * Never throw raw unhandled errors to the client.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
