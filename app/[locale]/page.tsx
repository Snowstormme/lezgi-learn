import {
  BookOpen,
  Flame,
  ShieldCheck,
  Sparkles,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-11 items-center justify-center rounded-xl border-b-4 border-[#46a302] bg-primary text-base font-black text-primary-foreground">
            ЛӀ
          </div>
          <span className="text-xl font-black tracking-tight text-primary">
            lezgi learn
          </span>
        </div>

        <Link
          href="/dictionary"
          className="rounded-xl border-2 border-b-4 border-border bg-card px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground transition-all hover:text-foreground active:translate-y-[2px]"
        >
          150 слов
        </Link>
      </div>

      {/* Center mascot emblem & hero */}
      <div className="my-auto space-y-6 py-6 text-center">
        {/* Playful flat 3D character card */}
        <div className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-3xl border-2 border-b-[6px] border-[#46a302] bg-primary text-primary-foreground">
          <span className="text-5xl font-black leading-none">Салам!</span>
          <span className="mt-2 rounded-xl bg-background/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
            Лезги чӀал
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground">
            Учи лезгинский язык бесплатно и с удовольствием!
          </h1>
          <p className="mx-auto max-w-xs text-base font-bold text-muted-foreground">
            Короткие игровые уроки, умное повторение слов и живой словарь,
            проверенный носителями.
          </p>
        </div>

        {/* Interactive mini word bubble */}
        {featuredWord && (
          <div className="mx-auto flex items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-border bg-card px-4 py-3 text-left">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-primary">
                  {featuredWord.lemma_lez}
                </span>
                <span className="text-sm font-bold text-foreground">
                  — {featuredWord.translation_ru}
                </span>
              </div>
              {featuredWord.examples[0] && (
                <p className="text-xs font-bold text-muted-foreground">
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

        {/* 3 compact feature pills */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border-2 border-b-4 border-border bg-card p-2.5">
            <Flame className="mx-auto h-5 w-5 text-[#FF9600]" />
            <p className="mt-1 text-xs font-extrabold text-foreground">
              10 уроков
            </p>
          </div>
          <div className="rounded-2xl border-2 border-b-4 border-border bg-card p-2.5">
            <ShieldCheck className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-xs font-extrabold text-foreground">
              Носители
            </p>
          </div>
          <div className="rounded-2xl border-2 border-b-4 border-border bg-card p-2.5">
            <Volume2 className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-1 text-xs font-extrabold text-foreground">
              Озвучка
            </p>
          </div>
        </div>
      </div>

      {/* Bottom 3D CTAs */}
      <div className="space-y-3">
        <Link
          href="/learn"
          className="flex h-13 w-full items-center justify-center rounded-2xl border-b-4 border-[#46a302] bg-primary px-6 text-base font-black uppercase tracking-wider text-primary-foreground transition-all hover:brightness-105 active:translate-y-[2px] active:border-b-2"
        >
          {session.isAuthenticated
            ? `ПРОДОЛЖИТЬ (${session.displayName})`
            : 'НАЧАТЬ'}
        </Link>

        <Link
          href={session.isAuthenticated ? '/profile' : '/login'}
          className="flex h-13 w-full items-center justify-center rounded-2xl border-2 border-b-4 border-border bg-background px-6 text-sm font-extrabold uppercase tracking-wider text-accent transition-all hover:bg-secondary/60 active:translate-y-[2px] active:border-b-2"
        >
          {session.isAuthenticated
            ? 'МОЙ ПРОФИЛЬ'
            : 'У МЕНЯ УЖЕ ЕСТЬ АККАУНТ'}
        </Link>
      </div>
    </div>
  );
}
