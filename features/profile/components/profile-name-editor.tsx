'use client';

import { useState, useTransition } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { updateDisplayNameAction } from '@/features/profile/actions';

interface ProfileNameEditorProps {
  initialName: string;
}

export function ProfileNameEditor({ initialName }: ProfileNameEditorProps) {
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed === name) {
      setIsEditing(false);
      setError(null);
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await updateDisplayNameAction(trimmed);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setName(res.data.displayName);
      setDraft(res.data.displayName);
      setIsEditing(false);
    });
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <h2 className="truncate text-xl font-black tracking-tight text-foreground">
          {name}
        </h2>
        <button
          type="button"
          onClick={() => {
            setDraft(name);
            setError(null);
            setIsEditing(true);
          }}
          aria-label="Изменить имя"
          title="Изменить имя"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            } else if (e.key === 'Escape') {
              setIsEditing(false);
              setError(null);
            }
          }}
          maxLength={40}
          disabled={isPending}
          autoFocus
          className="h-9 min-w-0 flex-1 rounded-xl border-2 border-primary bg-background px-2.5 text-sm font-extrabold text-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          aria-label="Сохранить имя"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-[#B92B1C] bg-primary text-[#F8FAFC] disabled:opacity-50"
        >
          <Check className="h-4 w-4 stroke-[3]" />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setError(null);
          }}
          disabled={isPending}
          aria-label="Отмена"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-border bg-secondary text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
      {error && <p className="text-xs font-bold text-primary">{error}</p>}
    </div>
  );
}
