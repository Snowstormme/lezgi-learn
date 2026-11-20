import { getModerationSuggestions } from '@/features/community/actions';
import { getCurrentUserSession } from '@/features/profile/queries';
import { TranslatorWorkspace } from '@/features/translation/components/translator-workspace';
import { LezgiOrnament } from '@/components/ui/lezgi-ornament';

export default async function TranslatePage() {
  const [suggestions, session] = await Promise.all([
    getModerationSuggestions(),
    getCurrentUserSession(),
  ]);

  return (
    <div className="space-y-6">
      <LezgiOrnament />

      <div className="space-y-1.5">
        <h1 className="text-balance text-2xl font-bold leading-tight text-[#F8FAFC]">
          Переводчик
        </h1>
        <p className="text-xs leading-relaxed text-[#CBD5E1]">
          Сначала ищет точный ответ в базе проверенных фраз, а новые запросы
          отмечает как черновик для проверки носителем.
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
