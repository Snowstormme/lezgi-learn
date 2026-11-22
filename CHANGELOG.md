# Changelog

All notable changes to **Lezgi Learn** are documented in this file.
Versioning follows [Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-11-23

### Added
- **Daily Spaced Repetition (SRS) Review Mode (`/review`)**:
  - Replaced the generic starter deck with a strict daily review queue built **only from words taught in lessons the user has already completed** (`collectLearnedWordSlugs`).
  - Simplified flashcard grading to 2 tactile 3D buttons: **«Не помню»** (re-queues at the end of today's session) and **«Помню»** (schedules the next FSRS interval).
  - Added cookie-backed SRS persistence (`lezgi_guest_srs`) so spaced repetition works seamlessly for guests without login, alongside Supabase `user_word_cards` for signed-in users.
  - Added clean empty state (prompting Lesson 1 when no lessons are completed yet), all-caught-up state with next review countdown, and celebratory CSS confetti burst on session completion.

## [0.1.0] — 2026-11-22

### Added
- **Course Path & Progression (`/learn`)**:
  - 10 structured lessons + capstone **«Экзамен раздела»** (`u1-l11-unit-exam`) with sequential lesson unlocking for both guests (cookie-backed) and authenticated Supabase users.
  - Winding mountain road with glossy 3D lesson pucks, interactive «Сундук этапа» golden 3D milestone chest (`+25 XP`), night-sky mountain backdrop, and 5 animated SVG scenes (`PathDecor`).
  - Pure-CSS celebratory confetti bursts on chest claims and lesson completion (`70%+`).
- **Start Screen & Brand Identity (`/`)**:
  - Minimalist start screen with authentic stepped South Dagestan **«Сумаг»** carpet medallion portal (`app/icon.svg`, `public/icon.svg`, `LezgiBrandIcon`, `public/og-image.png`).
- **Dictionary, Translator & SRS Review**:
  - Lezgi–Russian dictionary (`/dictionary`) with search, examples, and speech/audio playback.
  - Phrase-backed translator (`/translate`) and spaced-repetition review deck (`/review`).
- **SEO & Deployment**:
  - `robots.txt`, `sitemap.xml`, per-section canonical/OpenGraph/JSON-LD metadata, Google Search Console verification, IndexNow submission script, and Cloudflare Workers OpenNext deployment.
