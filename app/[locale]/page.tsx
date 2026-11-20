import {
  Flame,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { getCurrentUserSession } from '@/features/profile/queries';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';

export default async function StartScreenPage() {
  const [words, session] = await Promise.all([
    getPublishedDictionaryWords(),
    getCurrentUserSession(),
  ]);

  const featuredWord =
    words.find((w) => w.slug === 'salam') ??
    words.find((w) => w.slug === 'chal') ??
    words[0];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between border-x-2 border-border bg-background px-6 py-8">
      {/* Top logo bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-b-4 border-[#B92B1C] bg-primary text-base font-black text-[#F8FAFC]">
            ЛӀ
          </div>
          <span className="text-xl font-black tracking-tight text-[#F8FAFC]">
            lezgi <span className="text-primary">learn</span>
          </span>
        </div>

        <Link
          href="/dictionary"
          className="flex h-10 items-center rounded-xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-black uppercase tracking-wider text-[#0B132B] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2"
        >
          150 слов
        </Link>
      </div>

      {/* Center mascot emblem & hero */}
      <div className="my-auto space-y-6 py-6 text-center">
        {/* Tactile Vermillion & Cloud White Emblem */}
        <div className="mx-auto flex h-36 w-40 flex-col items-center justify-center rounded-3xl border-2 border-b-[6px] border-[#B92B1C] bg-primary px-4 text-[#F8FAFC]">
          <span className="text-4xl font-black leading-none tracking-tight">
            Салам!
          </span>
          <span className="mt-2.5 rounded-xl bg-[#0B132B]/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#F8FAFC]">
            Лезги чӀал
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-[#F8FAFC]">
            Учи лезгинский язык шаг за шагом!
          </h1>
          <p className="mx-auto max-w-xs text-base font-bold text-muted-foreground">
            Короткие игровые уроки, умное повторение слов и живой словарь,
            проверенный носителями.
          </p>
        </div>

        {/* Cloud White contrast word card */}
        {featuredWord && (
          <div className="mx-auto flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3.5 text-left text-[#0B132B]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-lg font-black text-primary">
                  {featuredWord.lemma_lez}
                </span>
                <span className="text-sm font-extrabold text-[#0B132B]">
                  — {featuredWord.translation_ru}
                </span>
              </div>
              {featuredWord.examples[0] && (
                <p className="mt-0.5 text-xs font-bold text-[#334155]">
                  «{featuredWord.examples[0].sentence_lez}» —{' '}
                  {featuredWord.examples[0].translation_ru}
                </p>
              )}
            </div>
            <AudioPlayerButton
              textLez={featuredWord.lemma_lez}
              transcriptionRu={featuredWord.transcription_ru}
            />
          </div>
        )}

        {/* 3 feature tiles */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-2xl border-2 border-b-4 border-border bg-card p-3">
            <Flame className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1.5 text-xs font-extrabold text-[#F8FAFC]">
              10 уроков
            </p>
          </div>
          <div className="rounded-2xl border-2 border-b-4 border-border bg-card p-3">
            <ShieldCheck className="mx-auto h-5 w-5 text-[#F8FAFC]" />
            <p className="mt-1.5 text-xs font-extrabold text-[#F8FAFC]">
              Носители
            </p>
          </div>
          <div className="rounded-2xl border-2 border-b-4 border-border bg-card p-3">
            <Volume2 className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1.5 text-xs font-extrabold text-[#F8FAFC]">
              Озвучка
            </p>
          </div>
        </div>
      </div>

      {/* Bottom full-height 3D CTAs */}
      <div className="space-y-3">
        <Link
          href="/learn"
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-6 py-3.5 text-center text-base font-black uppercase tracking-wider text-[#F8FAFC] transition-all hover:brightness-105 active:translate-y-[2px] active:border-b-2"
        >
          {session.isAuthenticated
            ? `ПРОДОЛЖИТЬ (${session.displayName})`
            : 'НАЧАТЬ ОБУЧЕНИЕ'}
        </Link>

        <Link
          href={session.isAuthenticated ? '/profile' : '/login'}
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#CBD5E1] bg-[#F8FAFC] px-6 py-3.5 text-center text-sm font-black uppercase tracking-wider text-[#0B132B] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2"
        >
          {session.isAuthenticated
            ? 'МОЙ ПРОФИЛЬ'
            : 'У МЕНЯ УЖЕ ЕСТЬ АККАУНТ'}
        </Link>
      </div>
    </div>
  );
}
