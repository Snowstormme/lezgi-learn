# Lezgi Learn (`lezgi-learn`)

Мобильная веб-платформа (PWA) для изучения лезгинского языка с русского по материалам, проверенным носителями языка.

## Стек
- **Frontend:** Next.js 15 (App Router, TypeScript), Tailwind CSS, shadcn/ui, `next-intl` (`ru` по умолчанию, задел под `lez` и `az`), тёмная тема.
- **Backend & DB:** Supabase (Postgres, Auth Email+Password, RLS).
- **Тесты и валидация:** Zod + Vitest.

---

## Быстрый старт локально

1. Установите зависимости и запустите проверку контента и тесты:
   ```bash
   npm install
   npm run content:validate
   npm test
   ```

2. Запустите сервер разработки (даже без `.env.local` приложение откроется в режиме локального предпросмотра JSON-контента!):
   ```bash
   npm run dev
   ```

---

## Подключение бесплатного облачного проекта Supabase

1. Создайте бесплатный проект на [supabase.com](https://supabase.com/dashboard).
2. Откройте **SQL Editor** в панели Supabase, скопируйте содержимое файла [`supabase/migrations/0001_initial_v0.sql`](supabase/migrations/0001_initial_v0.sql) и нажмите **Run**.
3. В разделе **Authentication → Providers → Email** убедитесь, что включён вход по Email и паролю (при желании отключите *Confirm email* на время разработки, чтобы тестовые аккаунты входили сразу).
4. Скопируйте `.env.example` в `.env.local` и вставьте ключи из **Project Settings → API**:
   ```bash
   cp .env.example .env.local
   ```
5. Загрузите словарь и уроки из папки `content/` в вашу облачную БД:
   ```bash
   npm run db:seed
   ```

---

## Документация
- [Архитектура и схема БД v0](docs/architecture.md)
- [Руководство по добавлению слов и уроков](docs/content-guide.md)
- [Инженерные соглашения и план на 2 недели](docs/conventions.md)
