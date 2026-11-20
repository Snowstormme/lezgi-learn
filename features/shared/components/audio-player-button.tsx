'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { ContentStatus } from '@/features/shared/types';
import { cn } from '@/lib/utils';

interface AudioPlayerButtonProps {
  textLez: string;
  transcriptionRu?: string | null;
  audioPath?: string | null;
  audioStatus?: ContentStatus;
  lightSurface?: boolean;
}

export function AudioPlayerButton({
  textLez,
  transcriptionRu,
  audioPath,
  audioStatus = 'draft',
  lightSurface = false,
}: AudioPlayerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const hasVerifiedNativeAudio =
    Boolean(audioPath) && audioStatus === 'published';

  function handlePlay() {
    if (isPlaying) return;

    if (hasVerifiedNativeAudio && audioPath) {
      try {
        setIsPlaying(true);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const fullUrl = audioPath.startsWith('http')
          ? audioPath
          : `${supabaseUrl}/storage/v1/object/public/audio/${audioPath}`;
        const audio = new Audio(fullUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        void audio.play();
        return;
      } catch {
        setIsPlaying(false);
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const spokenText = (transcriptionRu || textLez)
        .replace(/Ӏ/g, '')
        .replace(/\u0301/g, '');
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      aria-label={`Озвучить: ${textLez}`}
      title={
        hasVerifiedNativeAudio
          ? 'Запись носителя'
          : 'Прослушать слово'
      }
      className={cn(
        'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
        lightSurface
          ? 'border-[#CBD5E1] bg-white text-[#0B132B] hover:bg-[#E2E8F0]'
          : 'border-border bg-secondary text-[#F8FAFC] hover:border-[#41578E]',
        isPlaying && 'border-primary text-primary'
      )}
    >
      {isPlaying ? (
        <VolumeX className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      <span>{isPlaying ? 'Звук' : 'Слушать'}</span>
    </button>
  );
}
