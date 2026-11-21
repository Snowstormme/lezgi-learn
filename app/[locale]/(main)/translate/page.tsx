import { getModerationSuggestions } from '@/features/community/actions';
import { getCurrentUserSession } from '@/features/profile/queries';
import { TranslatorWorkspace } from '@/features/translation/components/translator-workspace';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Лезгинский переводчик онлайн — с русского на лезгинский',
  description:
    'Переводчик с русского на лезгинский и с лезгинского на русский по базе фраз, проверенных носителями языка.',
  path: '/translate',
  keywords: [
    'лезгинский переводчик',
    'переводчик с русского на лезгинский',
    'перевод с лезгинского на русский',
    'лезгинские фразы перевод',
  ],
});

export default async function TranslatePage() {
  const [suggestions, session] = await Promise.all([
    getModerationSuggestions(),
    getCurrentUserSession(),
  ]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight">
          Переводчик
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          Сначала ищет точный ответ в базе проверенных носителями фраз, а для новых выражений собирает черновик с возможностью отправить правку.
        </p>
      </div>

      <TranslatorWorkspace
        initialSuggestions={suggestions}
        userRole={session.role}
        isAuthenticated={session.isAuthenticated}
      />
    </div>
  );
}
