import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loadAndValidateContentBundle } from '@/content/loader';
import type { ContentStatus } from '@/features/shared/types';

export interface PhrasebookEntry {
  id?: string;
  slug: string;
  category: string;
  source_ru: string;
  target_lez: string;
  transcription_ru: string | null;
  context_note_ru: string | null;
  audio_path: string | null;
  audio_status: ContentStatus;
}

export async function getPublishedPhrases(): Promise<PhrasebookEntry[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from('verified_phrases')
        .select(
          'id, slug, category, source_ru, target_lez, transcription_ru, context_note_ru, audio_path, audio_status'
        )
        .eq('status', 'published')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback to local bundle
    }
  }

  const bundle = loadAndValidateContentBundle();
  return bundle.phrases
    .filter((p) => p.status === 'published')
    .map((p) => ({
      slug: p.slug,
      category: p.category,
      source_ru: p.source_ru,
      target_lez: p.target_lez,
      transcription_ru: p.transcription_ru ?? null,
      context_note_ru: p.context_note_ru ?? null,
      audio_path: p.audio_path ?? null,
      audio_status: p.audio_status ?? 'draft',
    }));
}
