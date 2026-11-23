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
  size?: 'sm' | 'md';
}

export function AudioPlayerButton({
  textLez,
  transcriptionRu,
  audioPath,
  audioStatus = 'draft',
  size = 'sm',
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

    // Fallback: Web Speech API phonetic synthesis preview
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
      title={
        hasVerifiedNativeAudio
          ? 'Прослушать запись носителя языка'
          : 'Прослушать фонетическое демо (запись носителя в очереди)'
      }
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 font-extrabold transition-all active:translate-y-[1px] active:border-b-2',
        size === 'sm' ? 'h-9 px-2.5 text-xs' : 'h-10 px-3.5 text-xs',
        hasVerifiedNativeAudio
          ? 'border-[#B92B1C] bg-primary text-[#F8FAFC] hover:brightness-105'
          : 'border-border bg-secondary text-foreground hover:border-primary',
        isPlaying && 'border-[#B92B1C] bg-primary text-[#F8FAFC]'
      )}
    >
      {isPlaying ? (
        <VolumeX className="h-3.5 w-3.5 animate-pulse" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      <span>
        {hasVerifiedNativeAudio ? 'Носитель' : isPlaying ? 'Звучит...' : 'Озвучить'}
      </span>
    </button>
  );
}
