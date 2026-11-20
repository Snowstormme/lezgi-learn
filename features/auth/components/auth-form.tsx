'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import {
  signInWithPasswordAction,
  signUpWithPasswordAction,
} from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result =
        mode === 'signin'
          ? await signInWithPasswordAction(formData)
          : await signUpWithPasswordAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (mode === 'signup') {
        setMessage('Аккаунт создан. Открываем курс...');
      }
      router.push('/learn');
      router.refresh();
    });
  }

  return (
    <div className="w-full space-y-5 rounded-xl border border-border bg-card p-5">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={mode === 'signin' ? 'cloud' : 'secondary'}
          size="sm"
          className="w-full"
          onClick={() => {
            setMode('signin');
            setError(null);
          }}
        >
          Вход
        </Button>
        <Button
          type="button"
          variant={mode === 'signup' ? 'cloud' : 'secondary'}
          size="sm"
          className="w-full"
          onClick={() => {
            setMode('signup');
            setError(null);
          }}
        >
          Регистрация
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1.5">
            <label
              htmlFor="displayName"
              className="text-xs font-medium text-[#CBD5E1]"
            >
              Имя
            </label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Али"
              required
              minLength={2}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-[#CBD5E1]"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="student@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-[#CBD5E1]"
          >
            Пароль (минимум 8 символов)
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete={
              mode === 'signin' ? 'current-password' : 'new-password'
            }
          />
        </div>

        {error && (
          <p className="rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-xs text-primary">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-200">
            {message}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {isPending
            ? 'Подождите...'
            : mode === 'signin'
              ? 'Войти'
              : 'Создать аккаунт'}
        </Button>
      </form>
    </div>
  );
}
