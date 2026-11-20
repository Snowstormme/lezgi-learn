import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage() {
  const tApp = await getTranslations('app');

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between border-x border-border/60 bg-background px-5 py-10">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-extrabold text-primary-foreground">
            ЛӀ
          </div>
          <div>
            <Badge variant="verified">Этап 1 • Каркас v0</Badge>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {tApp('name')}
            </h1>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {tApp('tagline')}. Все слова, примеры и упражнения проходят модерацию
          носителями языка (статус <code>published</code>).
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Как устроен доступ на платформе
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              • <strong>Без аккаунта (гость):</strong> можно свободно смотреть
              карту курса, демо-уроки и проверенный словарь.
            </p>
            <p>
              • <strong>С аккаунтом (Email + пароль):</strong> сохраняется
              личный прогресс уроков (<code>user_progress</code>), XP и серия
              дней.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 pt-8">
        <Link
          href="/learn"
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
        >
          Смотреть курс и словарь
        </Link>
        <Link
          href="/login"
          className="flex h-11 w-full items-center justify-center rounded-lg border border-border bg-secondary/70 px-6 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Войти или создать аккаунт
        </Link>
      </div>
    </div>
  );
}
