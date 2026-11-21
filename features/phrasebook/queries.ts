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

let cachedPhrases: PhrasebookEntry[] | null = null;

export async function getPublishedPhrases(): Promise<PhrasebookEntry[]> {
  if (cachedPhrases) {
    return cachedPhrases;
  }

  const bundle = loadAndValidateContentBundle();
  cachedPhrases = bundle.phrases
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

  return cachedPhrases;
}
