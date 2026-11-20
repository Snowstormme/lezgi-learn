'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  MessageSquarePlus,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  translateTextAction,
} from '@/features/translation/actions';
import type {
  TranslationDirection,
  TranslationResult,
} from '@/features/translation/engine';
import {
  moderateSuggestionAction,
  submitTranslationSuggestionAction,
  type ContentSuggestionItem,
} from '@/features/community/actions';
import type { UserRole } from '@/features/shared/types';
import { AudioPlayerButton } from '@/features/shared/components/audio-player-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const QUICK_EXAMPLES_RU = [
  'Я учу лезгинский язык.',
  'Здравствуй, брат! Как твои дела?',
  'Заходи, добро пожаловать в наш дом!',
  'Привет, дорогой товарищ',
];

const QUICK_EXAMPLES_LEZ = [
  'За лезги чӀал чирзава.',
  'Салам, зи дуст!',
  'Ша, илифа чи кӀвализ!',
];

interface TranslatorWorkspaceProps {
  initialSuggestions: ContentSuggestionItem[];
  userRole: UserRole;
  isAuthenticated: boolean;
}

export function TranslatorWorkspace({
  initialSuggestions,
  userRole,
  isAuthenticated,
}: TranslatorWorkspaceProps) {
  const [direction, setDirection] = useState<TranslationDirection>('ru_to_lez');
  const [queryText, setQueryText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Suggestion form state
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestSourceRu, setSuggestSourceRu] = useState('');
  const [suggestTargetLez, setSuggestTargetLez] = useState('');
  const [suggestComment, setSuggestComment] = useState('');
  const [suggestStatus, setSuggestStatus] = useState<string | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const isReviewerOrAdmin = userRole === 'reviewer' || userRole === 'admin';

  function handleTranslate(textToTranslate?: string) {
    const q = (textToTranslate ?? queryText).trim();
    if (!q) return;
    if (textToTranslate) setQueryText(textToTranslate);
    setError(null);
    setSuggestStatus(null);

    startTransition(async () => {
      const res = await translateTextAction({
        queryText: q,
        direction,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setResult(res.data);
      setShowSuggestionForm(false);
      setSuggestSourceRu(
        direction === 'ru_to_lez' ? res.data.queryText : res.data.translatedText
      );
      setSuggestTargetLez(
        direction === 'ru_to_lez' ? res.data.translatedText : res.data.queryText
      );
    });
  }

  function handleToggleDirection() {
    setDirection((d) => (d === 'ru_to_lez' ? 'lez_to_ru' : 'ru_to_lez'));
    setResult(null);
    setQueryText('');
  }

  function handleSubmitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setSuggestError(null);
    setSuggestStatus(null);

    startTransition(async () => {
      const res = await submitTranslationSuggestionAction({
        requestId: result?.requestId ?? null,
        sourceRu: suggestSourceRu,
        suggestedLez: suggestTargetLez,
        comment: suggestComment,
      });

      if (!res.ok) {
        setSuggestError(res.error);
        return;
      }

      setSuggestStatus(
        'Отправлено в очередь модерации (status = pending_review)! После проверки носителем фраза пополнит верифицированную базу.'
      );
      setSuggestComment('');
    });
  }

  function handleModerate(
    suggestionId: string,
    decision: 'published' | 'rejected'
  ) {
    startTransition(async () => {
      await moderateSuggestionAction({
        suggestionId,
        decision,
      });
    });
  }

  const quickExamples =
    direction === 'ru_to_lez' ? QUICK_EXAMPLES_RU : QUICK_EXAMPLES_LEZ;

  return (
    <div className="space-y-5">
      {/* Direction switcher & search card */}
      <Card className="border-border/90">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary">
              {direction === 'ru_to_lez'
                ? 'Русский → Лезгинский'
                : 'Лезгинский → Русский'}
            </Badge>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleDirection}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Сменить направление</span>
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTranslate();
            }}
            className="flex gap-2"
          >
            <Input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={
                direction === 'ru_to_lez'
                  ? 'Введите слово или фразу по-русски...'
                  : 'Введите слово или фразу по-лезгински...'
              }
              className="h-11 flex-1 text-sm"
            />
            <Button type="submit" disabled={isPending || !queryText.trim()}>
              <Search className="h-4 w-4" />
              <span>Найти</span>
            </Button>
          </form>

          {/* Quick test chips */}
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">
              Попробуйте проверенные фразы или составной запрос:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickExamples.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleTranslate(sample)}
                  className="rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-foreground/90 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Translation Result Card */}
      {result && (
        <Card
          className={
            result.isVerified
              ? 'border-primary bg-card'
              : 'border-[#FF9600] bg-card'
          }
        >
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center justify-between gap-2">
              {result.isVerified ? (
                <Badge variant="verified">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    {result.matchTier === 'verified_phrase'
                      ? 'Проверено носителем'
                      : 'Из проверенного словаря'}
                  </span>
                </Badge>
              ) : (
                <Badge variant="warning">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Черновик • Требует проверки</span>
                </Badge>
              )}

              <AudioPlayerButton
                textLez={
                  result.direction === 'ru_to_lez'
                    ? result.translatedText
                    : result.queryText
                }
                transcriptionRu={result.transcriptionRu}
              />
            </div>

            <div className="pt-1">
              <p className="text-xs text-muted-foreground">
                {result.queryText}
              </p>
              <CardTitle className="mt-1 text-xl font-extrabold text-primary">
                {result.translatedText}
              </CardTitle>
              {result.transcriptionRu && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  [{result.transcriptionRu}]
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            {/* Strict unverified draft warning banner */}
            {!result.isVerified && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
                <p className="font-semibold">
                  ⚠️ Требует проверки носителем языка
                </p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  Точного совпадения в проверенной базе фраз не найдено. Этот
                  черновик собран автоматически по словарным основам и не
                  является эталоном.
                </p>
              </div>
            )}

            {result.contextNoteRu && (
              <p className="text-muted-foreground">{result.contextNoteRu}</p>
            )}

            {/* Word-by-word breakdown */}
            {result.wordBreakdown.length > 0 && (
              <div className="space-y-1.5 rounded-xl border border-border/80 bg-background/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Найденные проверенные слова в словаре
                </p>
                <div className="divide-y divide-border/50">
                  {result.wordBreakdown.map((item) => (
                    <div
                      key={`${item.sourceToken}-${item.matchedLez}`}
                      className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0"
                    >
                      <span className="font-bold text-primary">
                        {item.matchedLez}
                      </span>
                      <span className="text-foreground">{item.matchedRu}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related verified phrases */}
            {result.relatedPhrases.length > 0 && (
              <div className="space-y-1.5 rounded-xl border border-border/80 bg-background/60 p-3">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  <span>Похожие проверенные фразы из базы</span>
                </p>
                <div className="space-y-2 pt-1">
                  {result.relatedPhrases.map((rel) => (
                    <div
                      key={rel.slug}
                      className="rounded-lg border border-border/60 bg-card/70 p-2"
                    >
                      <p className="font-semibold text-primary">
                        {rel.target_lez}
                      </p>
                      <p className="text-muted-foreground">{rel.source_ru}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Feedback & Moderation Trigger */}
            <div className="border-t border-border/60 pt-2">
              {!showSuggestionForm ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowSuggestionForm(true)}
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  <span>
                    {result.isVerified
                      ? 'Предложить альтернативный вариант перевода'
                      : 'Предложить точный перевод для проверки носителем'}
                  </span>
                </Button>
              ) : (
                <form
                  onSubmit={handleSubmitSuggestion}
                  className="space-y-2.5 rounded-xl border border-border bg-background/80 p-3"
                >
                  <p className="text-xs font-semibold text-foreground">
                    Предложить перевод в очередь модерации (status =
                    pending_review)
                  </p>
                  <Input
                    value={suggestSourceRu}
                    onChange={(e) => setSuggestSourceRu(e.target.value)}
                    placeholder="Фраза на русском..."
                    required
                    className="h-9 text-xs"
                  />
                  <Input
                    value={suggestTargetLez}
                    onChange={(e) => setSuggestTargetLez(e.target.value)}
                    placeholder="Перевод на лезгинском (1/I заменится на Ӏ)..."
                    required
                    className="h-9 text-xs"
                  />
                  <Input
                    value={suggestComment}
                    onChange={(e) => setSuggestComment(e.target.value)}
                    placeholder="Комментарий или диалект (необязательно)..."
                    className="h-9 text-xs"
                  />
                  {suggestError && (
                    <p className="text-[11px] text-destructive">
                      {suggestError}
                    </p>
                  )}
                  {suggestStatus && (
                    <p className="text-[11px] text-emerald-300">
                      {suggestStatus}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSuggestionForm(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" size="sm" disabled={isPending}>
                      Отправить на проверку
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderation Queue Section */}
      <Card className="border-border/80">
        <CardHeader className="pb-2.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Очередь модерации переводов
            </CardTitle>
            <Badge variant="outline">
              {isReviewerOrAdmin ? `Роль: ${userRole}` : 'Только чтение своих'}
            </Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground">
            Предложенные пользователями переводы проходят проверку носителями языка перед публикацией.
          </p>
        </CardHeader>

        <CardContent className="space-y-2.5 text-xs">
          {!isAuthenticated ? (
            <p className="text-muted-foreground">
              Войдите в аккаунт, чтобы предлагать переводы и отслеживать статус
              модерации.
            </p>
          ) : initialSuggestions.length === 0 ? (
            <p className="text-muted-foreground">
              Пока нет отправленных предложений.
            </p>
          ) : (
            initialSuggestions.map((item) => (
              <div
                key={item.id}
                className="space-y-2 rounded-xl border border-border bg-background/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      item.status === 'published'
                        ? 'verified'
                        : item.status === 'pending_review'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-primary">{item.suggested_lez}</p>
                  <p className="text-foreground">{item.source_ru}</p>
                  {item.comment && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Примечание: {item.comment}
                    </p>
                  )}
                </div>

                {isReviewerOrAdmin && item.status === 'pending_review' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleModerate(item.id, 'published')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Одобрить в базу</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => handleModerate(item.id, 'rejected')}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Отклонить</span>
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
