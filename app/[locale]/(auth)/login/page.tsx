import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { AuthForm } from '@/features/auth/components/auth-form';

export default async function LoginPage() {
  const tAuth = await getTranslations('auth');

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center border-x border-border/60 bg-background px-5 py-10">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{tAuth('title')}</h1>
        <p className="text-xs text-muted-foreground">{tAuth('subtitle')}</p>
      </div>

      <AuthForm />

      <div className="mt-6 text-center">
        <Link
          href="/learn"
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {tAuth('continueAsGuest')}
        </Link>
      </div>
    </div>
  );
}
