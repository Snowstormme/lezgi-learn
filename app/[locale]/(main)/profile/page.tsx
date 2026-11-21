import { getTranslations } from 'next-intl/server';
import { getCurrentUserSession } from '@/features/profile/queries';
import { signOutAction } from '@/features/auth/actions';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Профиль ученика',
  description: 'Статистика прогресса, опыта и серии дней в Lezgi Learn.',
  path: '/profile',
  noIndex: true,
});

export default async function ProfilePage() {
  const tProfile = await getTranslations('profile');
  const tAuth = await getTranslations('auth');
  const session = await getCurrentUserSession();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black tracking-tight text-[#F8FAFC]">
        {tProfile('title')}
      </h1>

      {session.isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-black text-[#F8FAFC]">
              {session.displayName}
            </CardTitle>
            <p className="text-xs font-bold text-[#CBD5E1]">
              {session.email}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border-2 border-b-4 border-border bg-secondary p-3.5">
                <p className="text-2xl font-black text-primary">{session.xp}</p>
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Опыт (XP)
                </p>
              </div>
              <div className="rounded-2xl border-2 border-b-4 border-border bg-secondary p-3.5">
                <p className="text-2xl font-black text-[#F8FAFC]">
                  {session.streakDays}
                </p>
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Дней подряд
                </p>
              </div>
            </div>

            <form
              action={async () => {
                'use server';
                await signOutAction();
              }}
            >
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
              >
                {tAuth('signOutButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-black">
              Гостевой просмотр
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-bold text-muted-foreground">
            <p>{tProfile('guestNotice')}</p>
            <Link
              href="/login"
              className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary px-6 py-3 text-sm font-black uppercase tracking-wider text-[#F8FAFC] transition-all hover:brightness-105 active:translate-y-[2px]"
            >
              Войти по Email и паролю
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
