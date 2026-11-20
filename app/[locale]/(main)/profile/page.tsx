import { getTranslations } from 'next-intl/server';
import { getCurrentUserSession } from '@/features/profile/queries';
import { signOutAction } from '@/features/auth/actions';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';

export default async function ProfilePage() {
  const tProfile = await getTranslations('profile');
  const tAuth = await getTranslations('auth');
  const session = await getCurrentUserSession();

  return (
    <div className="space-y-6">
      <LezgiOrnament />

      <h1 className="text-balance text-2xl font-bold leading-tight text-[#F8FAFC]">
        {tProfile('title')}
      </h1>

      {session.isAuthenticated ? (
        <div className="space-y-6 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              {session.displayName}
            </h2>
            <p className="text-xs text-[#CBD5E1]">{session.email}</p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border rounded-xl border border-border bg-background py-4 text-center">
            <div className="space-y-1 px-2">
              <p className="text-2xl font-bold tabular-nums text-primary">
                {session.xp}
              </p>
              <p className="text-xs text-[#CBD5E1]">Опыт (XP)</p>
            </div>
            <div className="space-y-1 px-2">
              <p className="text-2xl font-bold tabular-nums text-[#F8FAFC]">
                {session.streakDays}
              </p>
              <p className="text-xs text-[#CBD5E1]">Дней подряд</p>
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
        </div>
      ) : (
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-[#F8FAFC]">
              Гостевой режим
            </h2>
            <p className="text-xs leading-relaxed text-[#CBD5E1]">
              {tProfile('guestNotice')}
            </p>
          </div>

          <Link
            href="/login"
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-[#F8FAFC] transition-colors hover:bg-[#DC3D26]"
          >
            Войти по Email и паролю
          </Link>
        </div>
      )}
    </div>
  );
}
