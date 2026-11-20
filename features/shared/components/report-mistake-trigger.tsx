'use client';

import { useState, useTransition } from 'react';
import { Flag } from 'lucide-react';
import { submitContentReportAction } from '@/features/learning/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReportMistakeTriggerProps {
  entityType: 'word' | 'word_example' | 'exercise' | 'lesson';
  entityId?: string;
}

export function ReportMistakeTrigger({
  entityType,
  entityId,
}: ReportMistakeTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!entityId) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entityId) return;
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      const res = await submitContentReportAction({
        entityType,
        entityId,
        comment,
      });

      if (!res.ok) {
        setErrorMessage(res.error);
        return;
      }

      setStatusMessage('Спасибо! Сообщение отправлено на проверку.');
      setComment('');
      setTimeout(() => {
        setIsOpen(false);
        setStatusMessage(null);
      }, 2000);
    });
  }

  return (
    <div className="pt-1">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Flag className="h-3 w-3" />
          <span>Сообщить о неточности</span>
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-2 space-y-2 rounded-lg border border-border bg-background/80 p-2.5"
        >
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Опишите ошибку или опечатку..."
            minLength={3}
            maxLength={500}
            required
            className="h-8 text-xs"
          />
          {errorMessage && (
            <p className="text-[11px] text-destructive">{errorMessage}</p>
          )}
          {statusMessage && (
            <p className="text-[11px] text-emerald-300">{statusMessage}</p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
