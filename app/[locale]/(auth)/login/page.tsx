import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { AuthForm } from '@/features/auth/components/auth-form';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';

export default async function LoginPage() {
  const tAuth = await getTranslations('auth');

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center bg-background px-5 py-10">
      <div className="space-y-6">
        <LezgiOrnament />

        <div className="space-y-2 text-center">
          <h1 className="text-balance text-2xl font-bold leading-tight text-[#F8FAFC]">
            {tAuth('title')}
          </h1>
          <p className="text-pretty text-xs leading-relaxed text-[#CBD5E1]">
            {tAuth('subtitle')}
          </p>
        </div>

        <AuthForm />

        <Link
          href="/learn"
          className="flex min-h-[46px] w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:text-[#F8FAFC]"
        >
          {tAuth('continueAsGuest')}
        </Link>
      </div>
    </div>
  );
}
