# Feature Module: `translation` (Stage 4 — Planned)

> **Статус в v0 (Этап 1):** Папка-резерв без бизнес-логики. Реализация запланирована на Этап 4.

## Главный принцип
**Качество лезгинского контента важнее автоматизации.** LLM никогда не является источником истины и никогда не публикует переводы со статусом `published` самостоятельно.

## Архитектура переводчика (Этап 4)
1. **Шаг 1 — Поиск по проверенной базе (`verified_phrases` + `words`):**
   - Сначала выполняется точный и полнотекстовый поиск (`fts_vector` / нормализованная строка) по таблице `verified_phrases`, где хранятся только предложения со статусом `status = 'published'`, проверенные носителем языка (`reviewed_by`).
   - Если найдено совпадение — возвращается эталонный перевод с зелёным бейджем **«Проверено носителем»**.
2. **Шаг 2 — LLM-черновик с обязательной плашкой:**
   - Если фраза не найдена в `verified_phrases`, серверный Route Handler запрашивает черновой перевод у LLM.
   - Ответ сохраняется в `translation_requests` с флагом `is_verified = false` и отображается пользователю со строгим предупреждением: **«Черновик ИИ — требует проверки носителем»**.
3. **Шаг 3 — Обратная связь и модерация (`content_suggestions`):**
   - Пользователь или носитель может предложить исправление перевода, которое попадает в таблицу `content_suggestions` со статусом `pending_review`.
   - После одобрения ревьюером (`role in ('reviewer', 'admin')`) фраза переносится в `verified_phrases` (`status = 'published'`).

## Будущие таблицы БД (не создаются в v0)
- `verified_phrases` (`id`, `source_ru`, `target_lez`, `normalized_ru`, `status`, `reviewed_by`, `reviewed_at`)
- `translation_requests` (`id`, `user_id`, `direction`, `query_text`, `matched_phrase_id`, `llm_draft_output`, `is_verified`, `created_at`)
- `content_suggestions` (`id`, `request_id`, `suggested_by`, `source_ru`, `suggested_lez`, `status`, `reviewer_id`, `review_comment`, `created_at`)
