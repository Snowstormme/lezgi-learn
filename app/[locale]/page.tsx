import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Keyboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { getPublishedDictionaryWords } from '@/features/dictionary/queries';
import { getCurrentUserSession } from '@/features/profile/queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StartScreenPage() {
  const tStart = await getTranslations('start');
  const [words, session] = await Promise.all([
    getPublishedDictionaryWords(),
    getCurrentUserSession(),
  ]);

  const wordOfDay =
    words.find((w) => w.slug === 'chal') ??
    words.find((w) => w.slug === 'salam') ??
    words[0];

  const pillars = [
    {
      icon: ShieldCheck,
      title: tStart('pillarVerifiedTitle'),
      desc: tStart('pillarVerifiedDesc'),
    },
    {
      icon: Keyboard,
      title: tStart('pillarOrthographyTitle'),
      desc: tStart('pillarOrthographyDesc'),
    },
    {
      icon: CheckCircle2,
      title: tStart('pillarFreeTitle'),
      desc: tStart('pillarFreeDesc'),
    },
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between border-x border-border/60 bg-background px-5 py-8">
      <div className="space-y-6">
        {/* Top brand bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground shadow">
              ЛӀ
            </div>
            <div>
              <p className="text-base font-bold leading-tight">Lezgi Learn</p>
              <p className="text-xs text-muted-foreground">Лезги чӀал • PWA</p>
            </div>
          </div>

          <Badge variant="verified">{tStart('badge')}</Badge>
        </div>

        {/* Hero block */}
        <div className="space-y-2.5 pt-2">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
            {tStart('heroTitle')}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tStart('heroSubtitle')}
          </p>
        </div>

        {/* Word of the day preview card */}
        {wordOfDay && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {tStart('wordOfDayLabel')}
                </span>
                <Badge variant="secondary">{wordOfDay.part_of_speech}</Badge>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <CardTitle className="text-2xl font-extrabold text-foreground">
                  {wordOfDay.lemma_lez}
                </CardTitle>
                {wordOfDay.transcription_ru && (
                  <span className="text-xs text-muted-foreground">
                    [{wordOfDay.transcription_ru}]
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-primary">
                {wordOfDay.translation_ru}
              </p>
            </CardHeader>
            {wordOfDay.examples[0] && (
              <CardContent className="pt-0">
                <div className="rounded-lg border border-border/70 bg-background/60 p-2.5 text-xs">
                  <p className="font-semibold text-foreground">
                    «{wordOfDay.examples[0].sentence_lez}»
                  </p>
                  <p className="text-muted-foreground">
                    {wordOfDay.examples[0].translation_ru}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* 3 Core Principles */}
        <div className="space-y-2.5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-card/70 p-3.5"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {pillar.title}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="space-y-2.5 pt-6">
        <Link
          href="/learn"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <GraduationCap className="h-4 w-4" />
          <span>
            {session.isAuthenticated
              ? `${tStart('continueAsUser')} (${session.displayName})`
              : tStart('primaryCta')}
          </span>
        </Link>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/dictionary"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/70 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{tStart('dictionaryCta')}</span>
          </Link>

          <Link
            href={session.isAuthenticated ? '/profile' : '/login'}
            className="flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {session.isAuthenticated ? 'Мой профиль' : tStart('loginCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
