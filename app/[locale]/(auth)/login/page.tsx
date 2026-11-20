import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { AuthForm } from '@/features/auth/components/auth-form';

export default async function LoginPage() {
  const tAuth = await getTranslations('auth');

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center border-x-2 border-border bg-background px-5 py-10">
      <div className="mb-6 space-y-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-b-4 border-[#B92B1C] bg-primary text-base font-black text-[#F8FAFC]">
          ЛӀ
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#F8FAFC]">
          {tAuth('title')}
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          {tAuth('subtitle')}
        </p>
      </div>

      <AuthForm />

      <div className="mt-5">
        <Link
          href="/learn"
          className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-b-4 border-border bg-card px-4 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-[#F8FAFC] transition-all hover:bg-secondary active:translate-y-[2px] active:border-b-2"
        >
          {tAuth('continueAsGuest')}
        </Link>
      </div>
    </div>
  );
}
