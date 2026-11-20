'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  MessageSquarePlus,
  Search,
  X,
} from 'lucide-react';
import { translateTextAction } from '@/features/translation/actions';
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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
        'Отправлено в очередь модерации. После проверки носителем фраза появится в словаре.'
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
    <div className="space-y-6">
      {/* Direction & Search */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#F8FAFC]">
            {direction === 'ru_to_lez'
              ? 'Русский → Лезгинский'
              : 'Лезгинский → Русский'}
          </span>

          <button
            type="button"
            onClick={handleToggleDirection}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:text-[#F8FAFC]"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Поменять</span>
          </button>
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
                ? 'Введите фразу по-русски...'
                : 'Введите фразу по-лезгински...'
            }
            className="h-12 flex-1 text-sm"
          />
          <Button
            type="submit"
            size="default"
            className="shrink-0"
            disabled={isPending || !queryText.trim()}
          >
            <Search className="h-4 w-4" />
            <span>Найти</span>
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1">
          {quickExamples.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => handleTranslate(sample)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-left text-xs text-[#CBD5E1] transition-colors hover:border-[#41578E] hover:text-[#F8FAFC]"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div
          className={cn(
            'space-y-4 rounded-xl p-5',
            result.isVerified
              ? 'bg-[#F8FAFC] text-[#0B132B]'
              : 'border border-primary/60 bg-card text-[#F8FAFC]'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              {!result.isVerified && (
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Черновик — требует проверки носителем</span>
                </p>
              )}
              <p
                className={cn(
                  'text-xs',
                  result.isVerified ? 'text-[#334155]' : 'text-[#CBD5E1]'
                )}
              >
                {result.queryText}
              </p>
              <h2
                className={cn(
                  'text-balance text-xl font-bold leading-snug',
                  result.isVerified ? 'text-[#0B132B]' : 'text-[#F8FAFC]'
                )}
              >
                {result.translatedText}
              </h2>
              {result.transcriptionRu && (
                <p
                  className={cn(
                    'text-xs',
                    result.isVerified ? 'text-[#334155]' : 'text-[#CBD5E1]'
                  )}
                >
                  [{result.transcriptionRu}]
                </p>
              )}
            </div>

            <AudioPlayerButton
              textLez={
                result.direction === 'ru_to_lez'
                  ? result.translatedText
                  : result.queryText
              }
              transcriptionRu={result.transcriptionRu}
              lightSurface={result.isVerified}
            />
          </div>

          {result.contextNoteRu && (
            <p
              className={cn(
                'text-xs leading-relaxed',
                result.isVerified ? 'text-[#334155]' : 'text-[#CBD5E1]'
              )}
            >
              {result.contextNoteRu}
            </p>
          )}

          {result.wordBreakdown.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3 text-xs">
              <p className="font-semibold text-[#CBD5E1]">Слова из словаря</p>
              <div className="space-y-1.5">
                {result.wordBreakdown.map((item) => (
                  <div
                    key={`${item.sourceToken}-${item.matchedLez}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="font-semibold text-[#F8FAFC]">
                      {item.matchedLez}
                    </span>
                    <span className="text-[#CBD5E1]">{item.matchedRu}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.relatedPhrases.length > 0 && (
            <div
              className={cn(
                'space-y-2 border-t pt-3 text-xs',
                result.isVerified ? 'border-[#CBD5E1]' : 'border-border'
              )}
            >
              <p
                className={cn(
                  'font-semibold',
                  result.isVerified ? 'text-[#334155]' : 'text-[#CBD5E1]'
                )}
              >
                Похожие фразы
              </p>
              <div className="space-y-2">
                {result.relatedPhrases.map((rel) => (
                  <div key={rel.slug}>
                    <p
                      className={cn(
                        'font-semibold',
                        result.isVerified ? 'text-[#0B132B]' : 'text-[#F8FAFC]'
                      )}
                    >
                      {rel.target_lez}
                    </p>
                    <p
                      className={
                        result.isVerified ? 'text-[#334155]' : 'text-[#CBD5E1]'
                      }
                    >
                      {rel.source_ru}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={cn(
              'border-t pt-3',
              result.isVerified ? 'border-[#CBD5E1]' : 'border-border'
            )}
          >
            {!showSuggestionForm ? (
              <Button
                type="button"
                variant={result.isVerified ? 'default' : 'cloud'}
                size="default"
                className="w-full"
                onClick={() => setShowSuggestionForm(true)}
              >
                <MessageSquarePlus className="h-4 w-4 shrink-0" />
                <span>
                  {result.isVerified
                    ? 'Предложить свой вариант'
                    : 'Предложить точный перевод'}
                </span>
              </Button>
            ) : (
              <form
                onSubmit={handleSubmitSuggestion}
                className="space-y-3 rounded-xl border border-border bg-background p-4 text-[#F8FAFC]"
              >
                <p className="text-xs font-semibold">
                  Отправить перевод на проверку носителем
                </p>
                <Input
                  value={suggestSourceRu}
                  onChange={(e) => setSuggestSourceRu(e.target.value)}
                  placeholder="Фраза по-русски"
                  required
                />
                <Input
                  value={suggestTargetLez}
                  onChange={(e) => setSuggestTargetLez(e.target.value)}
                  placeholder="Перевод по-лезгински"
                  required
                />
                <Input
                  value={suggestComment}
                  onChange={(e) => setSuggestComment(e.target.value)}
                  placeholder="Примечание (необязательно)"
                />
                {suggestError && (
                  <p className="text-xs text-primary">{suggestError}</p>
                )}
                {suggestStatus && (
                  <p className="text-xs text-emerald-300">{suggestStatus}</p>
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
                    Отправить
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Moderation Queue */}
      <div className="space-y-3 border-t border-border pt-6">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[#F8FAFC]">
            Предложенные переводы
          </h2>
          <p className="text-xs text-[#CBD5E1]">
            Публикуются только после одобрения носителем языка.
          </p>
        </div>

        {!isAuthenticated ? (
          <p className="text-xs text-[#CBD5E1]">
            Войдите в аккаунт, чтобы предлагать переводы и следить за статусом.
          </p>
        ) : initialSuggestions.length === 0 ? (
          <p className="text-xs text-[#CBD5E1]">Пока нет предложений.</p>
        ) : (
          <div className="space-y-3">
            {initialSuggestions.map((item) => (
              <div
                key={item.id}
                className="space-y-2.5 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between text-[11px] text-[#CBD5E1]">
                  <span>
                    {item.status === 'published'
                      ? 'Одобрено'
                      : item.status === 'rejected'
                        ? 'Отклонено'
                        : 'На проверке'}
                  </span>
                  <span>
                    {new Date(item.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-[#F8FAFC]">
                    {item.suggested_lez}
                  </p>
                  <p className="text-xs text-[#CBD5E1]">{item.source_ru}</p>
                  {item.comment && (
                    <p className="mt-1 text-xs text-[#CBD5E1]">
                      {item.comment}
                    </p>
                  )}
                </div>

                {isReviewerOrAdmin && item.status === 'pending_review' && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={isPending}
                      onClick={() => handleModerate(item.id, 'published')}
                    >
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>Одобрить</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      disabled={isPending}
                      onClick={() => handleModerate(item.id, 'rejected')}
                    >
                      <X className="h-3.5 w-3.5 shrink-0" />
                      <span>Отклонить</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
