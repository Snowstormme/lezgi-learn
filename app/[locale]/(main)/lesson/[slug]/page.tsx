import { notFound } from 'next/navigation';
import { loadAndValidateContentBundle } from '@/content/loader';
import { Link } from '@/lib/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function LessonScaffoldPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = loadAndValidateContentBundle();
  const lesson = bundle.lessons.find(
    (l) => l.slug === slug && l.status === 'published'
  );

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/learn"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          ← Назад к карте курса
        </Link>
        <Badge variant="verified">Этап 1 • Данные урока</Badge>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold">{lesson.title_ru}</h1>
        {lesson.grammar_tip_ru && (
          <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            {lesson.grammar_tip_ru}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {lesson.exercises
          .filter((ex) => ex.status === 'published')
          .map((ex) => (
            <Card key={ex.slug}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    #{ex.order_index} • {ex.type}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {ex.slug}
                  </span>
                </div>
                <CardTitle className="pt-1 text-sm">{ex.prompt_ru}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {ex.type === 'multiple_choice' && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground">
                      Вопрос: {ex.payload.question}
                    </p>
                    <ul className="grid grid-cols-2 gap-1.5">
                      {ex.payload.options.map((opt, idx) => (
                        <li
                          key={opt}
                          className="rounded-md border border-border bg-background/60 px-2.5 py-1.5"
                        >
                          {idx + 1}. {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ex.type === 'matching' && (
                  <div className="grid grid-cols-2 gap-2">
                    {ex.payload.pairs.map((pair) => (
                      <div
                        key={pair.left}
                        className="col-span-2 flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-1.5"
                      >
                        <span className="font-semibold text-foreground">
                          {pair.left}
                        </span>
                        <span>↔ {pair.right}</span>
                      </div>
                    ))}
                  </div>
                )}

                {ex.type === 'word_input' && (
                  <p>
                    Эталонный ответ:{' '}
                    <strong className="text-foreground">
                      {ex.payload.accepted_answers.join(', ')}
                    </strong>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
