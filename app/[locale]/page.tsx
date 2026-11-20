import { Link } from '@/lib/i18n/routing';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { getCurrentUserSession } from '@/features/profile/queries';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';

export default async function StartScreenPage() {
  const [words, session] = await Promise.all([
    getPublishedDictionaryWords(),
    getCurrentUserSession(),
  ]);

  const featuredWord =
    words.find((w) => w.slug === 'chal') ??
    words.find((w) => w.slug === 'salam') ??
    words[0];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-between bg-background px-5 py-6">
      {/* Top minimal bar */}
      <header className="flex items-baseline justify-between">
        <span className="text-base font-bold tracking-tight text-[#F8FAFC]">
          Лезги ч<span className="text-primary">Ӏ</span>ал
        </span>
        <Link
          href="/dictionary"
          className="text-xs font-medium text-[#CBD5E1] underline-offset-4 transition-colors hover:text-[#F8FAFC] hover:underline"
        >
          Словарь
        </Link>
      </header>

      {/* Main editorial hero */}
      <main className="my-auto space-y-8 py-8">
        <LezgiOrnament />

        <div className="space-y-4">
          <h1 className="text-balance text-3xl font-bold leading-[1.18] tracking-tight text-[#F8FAFC]">
            Учи лезгинский язык шаг за шагом
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-[#CBD5E1]">
            Короткие уроки, интервальное повторение и словарь, проверенный
            носителями языка.
          </p>
        </div>

        {/* Cloud White live word preview */}
        {featuredWord && (
          <div className="rounded-xl bg-[#F8FAFC] p-5 text-[#0B132B]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold leading-tight text-[#0B132B]">
                  {featuredWord.lemma_lez}
                </p>
                <p className="text-sm font-medium text-[#334155]">
                  {featuredWord.translation_ru}
                </p>
              </div>
              <AudioPlayerButton
                textLez={featuredWord.lemma_lez}
                transcriptionRu={featuredWord.transcription_ru}
                lightSurface
              />
            </div>

            {featuredWord.examples[0] && (
              <div className="mt-4 border-t border-[#CBD5E1] pt-3 text-xs leading-relaxed">
                <p className="font-semibold text-[#0B132B]">
                  {featuredWord.examples[0].sentence_lez}
                </p>
                <p className="mt-0.5 text-[#334155]">
                  {featuredWord.examples[0].translation_ru}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom CTA group */}
      <footer className="space-y-3">
        <Link
          href="/learn"
          className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-[#F8FAFC] transition-colors hover:bg-[#DC3D26] active:scale-[0.99]"
        >
          {session.isAuthenticated
            ? `Продолжить обучение`
            : 'Начать обучение'}
        </Link>

        <Link
          href={session.isAuthenticated ? '/profile' : '/login'}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-[#F8FAFC] transition-colors hover:bg-secondary"
        >
          {session.isAuthenticated ? 'Профиль' : 'Войти в аккаунт'}
        </Link>
      </footer>
    </div>
  );
}
