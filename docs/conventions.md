# Инженерные соглашения и План на 2 недели

## 1. Соглашения по коду
- **Именование:**
  - Файлы и папки: `kebab-case` (`auth-form.tsx`, `lezgi-utils.ts`).
  - Компоненты и типы TypeScript: `PascalCase` (`MobileShell`, `ActionResult`).
  - Переменные и функции: `camelCase` (`getPublishedDictionaryWords`).
  - Таблицы, колонки и enum-значения в Postgres: `snake_case` (`word_examples`, `pending_review`).
- **Интернационализация (`next-intl`):**
  - Дефолтная локаль — `ru`. Все тексты UI вынесены в `lib/i18n/messages/ru.json`.
  - В будущем подключение `lez` и `az` потребует только добавления `lez.json` и `az.json` и включения локалей в `lib/i18n/routing.ts`.
- **Обработка ошибок (`ActionResult<T>`):**
  - Server Actions валидируют входные данные через `Zod` и всегда возвращают `{ ok: true, data }` либо `{ ok: false, error, code }`.
- **Переменные окружения (`lib/env.ts`):**
  - В браузер доступны только `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`.
  - `SUPABASE_SERVICE_ROLE_KEY` изолирован на сервере (`import 'server-only'`) и используется только в `lib/supabase/admin.ts` и `scripts/seed-content.ts`.
- **Правила коммитов (Conventional Commits):**
  - `feat(learning): ...`, `feat(auth): ...`, `content(unit-01): ...`, `fix(dictionary): ...`, `chore(db): ...`.

---

## 2. План Этапа 1 на 2 недели (по 15 часов в неделю)

### Неделя 1 (15 ч) — Цель: Каркас репозитория, облачная БД Supabase со схемой v0 + RLS и авторизация Email/Password
- **4 ч:** Инициализация Next.js App Router, Tailwind, тёмная тема, `next-intl` (`ru`), PWA-манифест (`app/manifest.ts`) и мобильный каркас (`MobileShell`).
- **6 ч:** Создание бесплатного проекта на `supabase.com`, выполнение миграции `supabase/migrations/0001_initial_v0.sql` в SQL Editor, проверка RLS-политик (гостевой просмотр `published` контента для `anon` + закрытый `user_progress`).
- **3 ч:** Настройка Email + Password авторизации (`features/auth/`) без лишних OAuth-провайдеров.
- **2 ч:** Ручное и автоматическое тестирование доступа гостя vs авторизованного ученика.

### Неделя 2 (15 ч) — Цель: Контентный пайплайн (`content/` + `db:seed`), нормализация лезгинской орфографии и первый деплой на Vercel
- **5 ч:** Zod-схемы контента (`content/schema.ts`), нормализация лезгинской палочки `Ӏ` (`lib/lezgi-utils.ts`), стартовый набор проверенных слов и 2 демо-урока.
- **5 ч:** Идемпотентный скрипт сидирования `scripts/seed-content.ts` (`npm run db:seed`) и тесты Vitest (`npm test`).
- **3 ч:** Документация архитектуры и формата контента (`docs/`), подготовка пустых модулей `translation/` и `community/`.
- **2 ч:** Пуш репозитория `lezgi-learn` на GitHub, подключение к Vercel, проверка деплоя на телефоне.
