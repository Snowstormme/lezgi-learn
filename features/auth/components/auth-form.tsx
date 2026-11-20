'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import {
  signInWithPasswordAction,
  signUpWithPasswordAction,
} from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        setMessage('Аккаунт создан! Перенаправляем к курсу...');
      }
      router.push('/learn');
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/90">
      <CardHeader className="space-y-1">
        <div className="grid grid-cols-2 gap-2.5 pb-2">
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
        <CardTitle className="text-lg">
          {mode === 'signin' ? 'Вход по Email и паролю' : 'Создание аккаунта'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label
                htmlFor="displayName"
                className="text-xs font-medium text-muted-foreground"
              >
                Ваше имя
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
              className="text-xs font-medium text-muted-foreground"
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
              className="text-xs font-medium text-muted-foreground"
            >
              Пароль (от 8 символов)
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
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              {message}
            </div>
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
                : 'Зарегистрироваться'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
