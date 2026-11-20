# Архитектура Lezgi Learn (v0 — Этап 1)

## 1. Главные архитектурные принципы
1. **Качество лезгинского контента превыше всего:**
   - Каждая единица контента (`units`, `lessons`, `exercises`, `words`, `word_examples`) и каждое аудио (`audio_status`) имеют строгий статус жизненного цикла:
     `draft` → `pending_review` → `published` (либо `rejected` / `archived`).
   - Гости (`anon`) и обычные ученики (`learner`) видят **только** записи со статусом `status = 'published'`. Это гарантируется на уровне **Postgres Row Level Security (RLS)**.
   - LLM никогда не публикует контент самостоятельно.
2. **Контент как данные (Data-Driven Course):**
   - Никакие слова или уроки не зашиты в React-компоненты.
   - Исходники уроков и словаря хранятся в `content/` (JSON), валидируются через Zod (`content/schema.ts`) с нормализацией лезгинской палочки (`Ӏ`) и загружаются в Supabase идемпотентным скриптом `scripts/seed-content.ts`.
3. **Гостевой просмотр + Аккаунт (Email & Password):**
   - Без аккаунта (`anon`) можно свободно просматривать карту курса (`/learn`), уроки и словарь (`/dictionary`).
   - Авторизация (Email + пароль в Supabase Auth) нужна для сохранения личного прогресса (`user_progress`), опыта (`xp`), ударного режима (`streak_days`) и отправки сообщений об ошибках (`content_reports`).

---

## 2. Схема БД v0 (`supabase/migrations/0001_initial_v0.sql`)

| Таблица | Назначение | Ключевые поля и индексы | Политика RLS |
| :--- | :--- | :--- | :--- |
| `profiles` | Профиль пользователя (1:1 с `auth.users`) | `id` (PK), `role` (`learner`, `reviewer`, `admin`), `interface_locale`, `xp`, `streak_days` | `SELECT`/`UPDATE` только своего профиля (`auth.uid() = id`). Триггер `protect_profile_role` запрещает самопроизвольное повышение `role`. |
| `words` | Леммы словаря | `id` (PK), `slug` (UNIQUE), `lemma_lez`, `translation_ru`, `status`, `audio_status`, `reviewed_by` | `SELECT` для `anon` и `authenticated` только при `status = 'published'`. Полный доступ для `reviewer`/`admin`. |
| `word_examples` | Проверенные примеры к словам | `id` (PK), `slug` (UNIQUE), `word_id` (FK), `sentence_lez`, `translation_ru`, `status` | `SELECT` только при `status = 'published'` (или роль `reviewer`/`admin`). |
| `units` | Юниты курса | `id` (PK), `slug` (UNIQUE), `order_index`, `title_ru`, `status` | `SELECT` только при `status = 'published'` (или роль `reviewer`/`admin`). |
| `lessons` | Уроки внутри юнита | `id` (PK), `slug` (UNIQUE), `unit_id` (FK), `order_index`, `title_ru`, `grammar_tip_ru`, `status` | `SELECT` только при `status = 'published'` (или роль `reviewer`/`admin`). |
| `exercises` | Упражнения урока | `id` (PK), `slug` (UNIQUE), `lesson_id` (FK), `type`, `word_id` (FK), `payload` (`jsonb`), `status` | `SELECT` только при `status = 'published'` (или роль `reviewer`/`admin`). |
| `user_progress` | Прогресс ученика по урокам | `id` (PK), `user_id` (FK), `lesson_id` (FK), `status`, `score`, `UNIQUE(user_id, lesson_id)` | `SELECT`, `INSERT`, `UPDATE` строго при `auth.uid() = user_id`. |
| `content_reports` | Репорты об ошибках в контенте | `id` (PK), `reporter_id` (FK), `entity_type`, `entity_id`, `comment`, `report_status` | `INSERT`/`SELECT` своих репортов (`auth.uid() = reporter_id`), чтение и модерация всех для `reviewer`/`admin`. |

---

## 3. Будущие таблицы под Переводчик и Модерацию (Этап 4 — в v0 НЕ создаются)

На Этапе 4 для реализации безопасного переводчика («сначала проверенная база, затем LLM-черновик с пометкой, затем модерация») будут добавлены 3 таблицы:

1. **`verified_phrases`** — корпус проверенных носителями фраз и предложений:
   - `id` (`uuid`, PK)
   - `source_ru` (`text`, NOT NULL)
   - `target_lez` (`text`, NOT NULL)
   - `normalized_ru` (`text`, NOT NULL, индекс для быстрого точного поиска)
   - `fts_ru` (`tsvector`, GIN-индекс для полнотекстового поиска)
   - `status` (`content_status`, default `'published'`)
   - `reviewed_by` (`uuid`, FK -> `profiles.id`)
   - `reviewed_at` (`timestamptz`)
2. **`translation_requests`** — журнал обращений к переводчику:
   - `id` (`uuid`, PK)
   - `user_id` (`uuid`, nullable, FK -> `profiles.id`)
   - `direction` (`text`, `'ru_to_lez' | 'lez_to_ru'`)
   - `query_text` (`text`, NOT NULL)
   - `matched_phrase_id` (`uuid`, nullable, FK -> `verified_phrases.id`)
   - `llm_draft_output` (`text`, nullable)
   - `is_verified` (`boolean`, NOT NULL, default `false`)
   - `created_at` (`timestamptz`)
3. **`content_suggestions`** — предложенные пользователями переводы и правки к черновикам LLM:
   - `id` (`uuid`, PK)
   - `request_id` (`uuid`, nullable, FK -> `translation_requests.id`)
   - `suggested_by` (`uuid`, NOT NULL, FK -> `profiles.id`)
   - `source_ru` (`text`, NOT NULL)
   - `suggested_lez` (`text`, NOT NULL)
   - `status` (`content_status`, default `'pending_review'`)
   - `reviewer_id` (`uuid`, nullable, FK -> `profiles.id`)
   - `review_comment` (`text`, nullable)
   - `created_at`, `updated_at` (`timestamptz`)
