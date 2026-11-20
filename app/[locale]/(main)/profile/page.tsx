import { getTranslations } from 'next-intl/server';
import { getCurrentUserSession } from '@/features/profile/queries';
import { signOutAction } from '@/features/auth/actions';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function ProfilePage() {
  const tProfile = await getTranslations('profile');
  const tAuth = await getTranslations('auth');
  const session = await getCurrentUserSession();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">{tProfile('title')}</h1>

      {session.isAuthenticated ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{session.displayName}</CardTitle>
              <Badge variant="verified">{session.role}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{session.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-lg font-bold text-primary">{session.xp}</p>
                <p className="text-xs text-muted-foreground">Опыт (XP)</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-lg font-bold text-primary">
                  {session.streakDays}
                </p>
                <p className="text-xs text-muted-foreground">Дней подряд</p>
              </div>
            </div>

            <form
              action={async () => {
                'use server';
                await signOutAction();
              }}
            >
              <Button type="submit" variant="secondary" className="w-full">
                {tAuth('signOutButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Гостевой просмотр</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <p>{tProfile('guestNotice')}</p>
            <Link
              href="/login"
              className="flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Войти по Email и паролю
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
