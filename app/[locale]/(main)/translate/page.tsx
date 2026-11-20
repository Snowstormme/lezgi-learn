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
        <h1 className="text-xl font-bold tracking-tight">
          Переводчик с проверкой
        </h1>
        <p className="text-xs text-muted-foreground">
          1) Сначала ищет в базе проверенных носителями фраз и слов → 2) Если
          фразы нет, собирает черновик с пометкой «Требует проверки» → 3)
          Позволяет отправить исправление в очередь модерации.
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
