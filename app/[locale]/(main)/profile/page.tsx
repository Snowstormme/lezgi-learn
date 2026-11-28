import "@/components/profile/profile.css";

import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { buildLearnerAchievements } from "@/components/profile/achievements";
import { getCurrentUserSession } from "@/features/profile/queries";
import { getPublishedUnitsWithLessons } from "@/features/learning/queries";
import { getSrsReviewDeck } from "@/features/learning/srs-queries";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Профиль и достижения ученика",
  description: "Коллекция наград, опыт, серия занятий и личный прогресс в Lezgi Learn.",
  path: "/profile",
  noIndex: true,
});

const GENITIVE_MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

const INSTRUMENTAL_MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

const CULTURE_THEME_SLUGS = new Set([
  "u1-l6-origin",
  "u1-l7-languages",
  "u1-l8-politeness",
  "u1-l9-hospitality",
  "u1-l10-farewell",
]);

function formatStreakDays(days: number): string {
  const mod10 = days % 10;
  const mod100 = days % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${days} день подряд`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${days} дня подряд`;
  }
  return `${days} дней подряд`;
}

function formatJoinedLabel(isoDate: string | null): string {
  const parsed = isoDate ? new Date(isoDate) : new Date();
  const valid = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const month = INSTRUMENTAL_MONTHS[valid.getUTCMonth()] ?? "ноября";
  return `В пути с ${month} ${valid.getUTCFullYear()}`;
}

function formatEarnedDateLabel(isoDate: string | null): string {
  const parsed = isoDate ? new Date(isoDate) : new Date();
  const valid = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = valid.getUTCDate();
  const month = GENITIVE_MONTHS[valid.getUTCMonth()] ?? "ноября";
  return `${day} ${month} ${valid.getUTCFullYear()}`;
}

export default async function ProfilePage() {
  const [session, units, srs] = await Promise.all([
    getCurrentUserSession(),
    getPublishedUnitsWithLessons(),
    getSrsReviewDeck(),
  ]);

  const allLessons = units.flatMap((u) => u.lessons);
  const completedLessons = allLessons.filter((l) => l.is_completed);
  const completedUnitsCount = units.filter(
    (u) => u.lessons.length > 0 && u.completed_count >= u.lessons.length,
  ).length;

  const unit1 = units.find((u) => u.order_index === 1) ?? units[0];
  const unit1Completed = Boolean(
    unit1 && unit1.lessons.length > 0 && unit1.completed_count >= unit1.lessons.length,
  );

  const hospitalityCompleted = completedLessons.some(
    (l) => l.slug === "u1-l9-hospitality",
  );
  const cultureThemesCompleted = completedLessons.filter((l) =>
    CULTURE_THEME_SLUGS.has(l.slug),
  ).length;
  const perfectExamCount = completedLessons.filter(
    (l) => l.slug.includes("exam") && (l.best_score ?? 0) >= 100,
  ).length;

  const items = buildLearnerAchievements({
    completedLessonsCount: completedLessons.length,
    completedUnitsCount,
    unit1Completed,
    hospitalityCompleted,
    cultureThemesCompleted,
    perfectExamCount,
    wordsLearned: srs.totalLearnedWords,
    streakDays: session.streakDays,
    earnedDateLabel: formatEarnedDateLabel(session.lastActiveDate ?? session.createdAt),
  });

  const level = Math.max(1, Math.floor(session.xp / 50) + 1);
  const learnerName = session.isAuthenticated
    ? (session.displayName ?? "Ученик")
    : "Гость";

  return (
    <ProfilePreview
      homeHref="/learn"
      profileHref="/profile"
      items={items}
      initialShowcase={session.pinnedMedalId}
      learnerName={learnerName}
      level={level}
      subtitle="Исследователь лезгинского языка"
      streakLabel={formatStreakDays(session.streakDays)}
      joinedLabel={formatJoinedLabel(session.createdAt)}
      wordsLearned={srs.totalLearnedWords}
      xp={session.xp}
    />
  );
}
