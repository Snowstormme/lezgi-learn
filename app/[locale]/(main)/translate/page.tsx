import { getModerationSuggestions } from '@/features/community/actions';
import { getCurrentUserSession } from '@/features/profile/queries';
import { TranslatorWorkspace } from '@/features/translation/components/translator-workspace';

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
