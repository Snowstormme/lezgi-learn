import {
  Award,
  BookOpen,
  Brain,
  Check,
  Flame,
  GraduationCap,
  LogOut,
  Play,
  Sparkles,
  Star,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getCurrentUserSession } from '@/features/profile/queries';
import { getPublishedUnitsWithLessons } from '@/features/learning/queries';
import { getSrsReviewDeck } from '@/features/learning/srs-queries';
import { signOutAction } from '@/features/auth/actions';
import { ProfileNameEditor } from '@/features/profile/components/profile-name-editor';
import { Link } from '@/lib/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';
import { APP_VERSION } from '@/lib/version';
import { cn } from '@/lib/utils';

export const metadata = buildPageMetadata({
  title: 'Профиль ученика',
  description: 'Статистика прогресса, опыта и серии дней в Lezgi Learn.',
  path: '/profile',
  noIndex: true,
});

interface RankInfo {
  level: number;
  titleLez: string;
  titleRu: string;
  minXp: number;
  nextXp: number | null;
}

const RANKS: RankInfo[] = [
  { level: 1, titleLez: 'Мугьман', titleRu: 'Новичок', minXp: 0, nextXp: 50 },
  { level: 2, titleLez: 'Сейирчи', titleRu: 'Путник', minXp: 50, nextXp: 150 },
  { level: 3, titleLez: 'Чирвилер', titleRu: 'Ученик гор', minXp: 150, nextXp: 300 },
  { level: 4, titleLez: 'ЧӀалан устад', titleRu: 'Знаток', minXp: 300, nextXp: 500 },
  { level: 5, titleLez: 'Шалбуздаг', titleRu: 'Мастер', minXp: 500, nextXp: null },
];

function getLearnerRank(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i -= 1) {
    if (xp >= RANKS[i].minXp) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

function getInitials(name: string | null): string {
  if (!name) return 'Г';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
  const [tAuth, session, units, srs] = await Promise.all([
    getTranslations('auth'),
    getCurrentUserSession(),
    getPublishedUnitsWithLessons(),
    getSrsReviewDeck(),
  ]);

  const allLessons = units.flatMap((u) => u.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.is_completed);
  const completedCount = completedLessons.length;
  const courseProgressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const scoredLessons = completedLessons.filter(
    (l): l is typeof l & { best_score: number } => l.best_score !== null
  );
  const averageScore =
    scoredLessons.length > 0
      ? Math.round(
          scoredLessons.reduce((acc, l) => acc + l.best_score, 0) /
            scoredLessons.length
        )
      : null;
  const hasPerfectScore = scoredLessons.some((l) => l.best_score === 100);

  const nextLesson =
    allLessons.find((l) => l.is_unlocked && !l.is_completed) ?? allLessons[0];
  const nextLessonSlug = nextLesson?.slug ?? srs.nextLessonSlug;

  const rank = getLearnerRank(session.xp);
  const rankProgressPct = rank.nextXp
    ? Math.min(
        100,
        Math.max(
          6,
          Math.round(
            ((session.xp - rank.minXp) / (rank.nextXp - rank.minXp)) * 100
          )
        )
      )
    : 100;

  const achievements = [
    {
      id: 'first-lesson',
      title: 'Первый шаг',
      hint: completedCount >= 1 ? '1-й урок пройден' : 'Пройдите 1 урок',
      unlocked: completedCount >= 1,
      icon: GraduationCap,
      colorClass: 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10',
    },
    {
      id: 'streak-3',
      title: 'Огонь серии',
      hint:
        session.streakDays >= 3
          ? `${session.streakDays} дн. подряд`
          : `${session.streakDays} / 3 дней`,
      unlocked: session.streakDays >= 3,
      icon: Flame,
      colorClass: 'text-primary border-primary/40 bg-primary/10',
    },
    {
      id: 'words-10',
      title: 'Словарный запас',
      hint:
        srs.totalLearnedWords >= 10
          ? `${srs.totalLearnedWords} слов изучено`
          : `${srs.totalLearnedWords} / 10 слов`,
      unlocked: srs.totalLearnedWords >= 10,
      icon: BookOpen,
      colorClass: 'text-sky-500 border-sky-500/40 bg-sky-500/10',
    },
    {
      id: 'perfect-100',
      title: 'Без ошибок',
      hint: hasPerfectScore ? 'Урок на 100%' : 'Пройдите урок на 100%',
      unlocked: hasPerfectScore,
      icon: Trophy,
      colorClass:
        'text-amber-500 border-amber-500/40 bg-amber-500/10 dark:text-[#FFC800]',
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-5">
      {/* Hero Profile Card */}
      <Card className="overflow-hidden border-2 border-b-[6px] border-border bg-card">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-[#FF8A3D] to-[#FFC800]" />
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-4">
            {/* Avatar medallion with level badge */}
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary text-xl font-black tracking-wider text-[#F8FAFC] shadow-sm">
                {session.isAuthenticated ? (
                  getInitials(session.displayName)
                ) : (
                  <User className="h-8 w-8 stroke-[2.5]" />
                )}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-card bg-[#FFC800] px-1.5 text-[10px] font-black text-[#0B132B]">
                Ур.{rank.level}
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              {session.isAuthenticated ? (
                <ProfileNameEditor
                  initialName={session.displayName ?? 'Ученик'}
                />
              ) : (
                <h1 className="text-xl font-black tracking-tight text-foreground">
                  Гостевой профиль
                </h1>
              )}

              <p className="truncate text-xs font-bold text-muted-foreground">
                {session.isAuthenticated
                  ? session.email
                  : 'Прогресс сохраняется на этом устройстве'}
              </p>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-extrabold text-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>{rank.titleLez}</span>
                <span className="text-muted-foreground">· {rank.titleRu}</span>
              </div>
            </div>
          </div>

          {/* Level XP Progress Bar */}
          <div className="space-y-1.5 rounded-2xl border border-border bg-secondary/70 p-3">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider">
              <span className="text-muted-foreground">
                Уровень {rank.level} · {rank.titleLez}
              </span>
              <span className="tabular-nums text-foreground">
                {rank.nextXp
                  ? `${session.xp} / ${rank.nextXp} XP`
                  : `${session.xp} XP · MAX`}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-background">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-primary to-[#FFC800] transition-all duration-300"
                style={{ width: `${rankProgressPct}%` }}
              >
                <div className="mx-1.5 mt-0.5 h-1 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2x2 Key Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="duo-card-3d rounded-2xl border-2 border-b-4 border-border bg-card p-3.5">
          <div className="flex items-center gap-2 text-amber-500 dark:text-[#FFC800]">
            <Zap className="h-5 w-5 fill-current" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Опыт
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-foreground">
            {session.xp} <span className="text-sm font-extrabold text-muted-foreground">XP</span>
          </p>
        </div>

        <div className="duo-card-3d rounded-2xl border-2 border-b-4 border-border bg-card p-3.5">
          <div className="flex items-center gap-2 text-primary">
            <Flame className="h-5 w-5 fill-current" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Серия
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-foreground">
            {session.streakDays}{' '}
            <span className="text-sm font-extrabold text-muted-foreground">дн.</span>
          </p>
        </div>

        <div className="duo-card-3d rounded-2xl border-2 border-b-4 border-border bg-card p-3.5">
          <div className="flex items-center gap-2 text-emerald-500">
            <GraduationCap className="h-5 w-5 stroke-[2.5]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Уроки
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-foreground">
            {completedCount}
            <span className="text-sm font-extrabold text-muted-foreground">
              /{totalLessons}
            </span>
          </p>
        </div>

        <div className="duo-card-3d rounded-2xl border-2 border-b-4 border-border bg-card p-3.5">
          <div className="flex items-center gap-2 text-sky-500">
            <BookOpen className="h-5 w-5 stroke-[2.5]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Слова
            </span>
          </div>
          <p className="mt-1.5 text-2xl font-black tabular-nums text-foreground">
            {srs.totalLearnedWords}
          </p>
        </div>
      </div>

      {/* Course Progress & Quick Actions */}
      <Card className="border-2 border-b-4 border-border bg-card">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Прогресс курса
              </p>
              <p className="text-sm font-black text-foreground">
                Модуль 1 · {courseProgressPct}%
              </p>
            </div>
            {averageScore !== null && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary px-2.5 py-1 text-xs font-extrabold text-foreground">
                <Star className="h-3.5 w-3.5 fill-[#FFC800] text-[#FFC800]" />
                <span>Точность {averageScore}%</span>
              </span>
            )}
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-secondary">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(courseProgressPct, completedCount > 0 ? 8 : 0)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              href={`/lesson/${nextLessonSlug}`}
              className="duo-card-3d flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border-2 border-b-4 border-[#B92B1C] bg-primary px-3 py-2 text-xs font-black uppercase tracking-wider text-[#F8FAFC] hover:brightness-105"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{completedCount > 0 ? 'Продолжить' : 'Начать урок'}</span>
            </Link>

            <Link
              href="/review"
              className="duo-card-3d flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border-2 border-b-4 border-border bg-secondary px-3 py-2 text-xs font-black uppercase tracking-wider text-foreground hover:border-primary/60"
            >
              <Brain className="h-4 w-4 text-primary" />
              <span>Повтор</span>
              {srs.dueCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black text-[#F8FAFC]">
                  {srs.dueCount}
                </span>
              )}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-2 border-b-4 border-border bg-card">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Достижения
              </h2>
            </div>
            <span className="text-xs font-extrabold tabular-nums text-muted-foreground">
              {unlockedCount} / {achievements.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {achievements.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'relative flex items-start gap-2.5 rounded-2xl border-2 p-3 transition-opacity',
                    item.unlocked
                      ? 'border-border bg-secondary/70'
                      : 'border-border/60 bg-secondary/30 opacity-65'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                      item.unlocked
                        ? item.colorClass
                        : 'border-border bg-background text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold leading-tight text-muted-foreground">
                      {item.hint}
                    </p>
                  </div>
                  {item.unlocked && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-emerald-500 text-white">
                      <Check className="h-3 w-3 stroke-[3.5]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Action (Sign In for Guest / Sign Out for Authenticated) */}
      {session.isAuthenticated ? (
        <form
          action={async () => {
            'use server';
            await signOutAction();
          }}
        >
          <button
            type="submit"
            className="duo-card-3d flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-border bg-card px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4 stroke-[2.5]" />
            <span>{tAuth('signOutButton')}</span>
          </button>
        </form>
      ) : (
        <Card className="border-2 border-b-4 border-primary/40 bg-card">
          <CardContent className="space-y-3 p-4">
            <p className="text-xs font-bold leading-relaxed text-muted-foreground">
              Создайте аккаунт или войдите, чтобы сохранить ваш опыт, серию дней
              и изученные слова на всех устройствах.
            </p>
            <Link
              href="/login"
              className="duo-card-3d flex min-h-[50px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-6 py-3 text-xs font-black uppercase tracking-wider text-[#F8FAFC] hover:brightness-105"
            >
              Войти или создать аккаунт
            </Link>
          </CardContent>
        </Card>
      )}

      <p className="pt-1 text-center text-[11px] font-bold tracking-wider text-muted-foreground">
        Lezgi Learn · v{APP_VERSION}
      </p>
    </div>
  );
}
