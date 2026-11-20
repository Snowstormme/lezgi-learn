-- ============================================================================
-- Lezgi Learn — Stage 4 Database Migration
-- Adds:
--   1. user_word_cards (ts-fsrs spaced repetition state per user & word)
--   2. verified_phrases (phrasebook & verified translator corpus)
--   3. translation_requests (audit log of translator queries & unverified drafts)
--   4. content_suggestions (learner/speaker suggestions & moderation queue)
-- ============================================================================

-- 1. user_word_cards (FSRS spaced repetition cards)
create table if not exists public.user_word_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_id uuid not null references public.words(id) on delete cascade,
  state smallint not null default 0 check (state in (0, 1, 2, 3)),
  due timestamptz not null default now(),
  stability double precision not null default 0,
  difficulty double precision not null default 0,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  last_review timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create index if not exists idx_user_word_cards_user_due
  on public.user_word_cards(user_id, due);

drop trigger if exists trg_user_word_cards_updated_at on public.user_word_cards;
create trigger trg_user_word_cards_updated_at
before update on public.user_word_cards
for each row execute function public.set_updated_at();

-- 2. verified_phrases (verified phrases for Phrasebook & Translator Tier 1)
create table if not exists public.verified_phrases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'general',
  source_ru text not null,
  target_lez text not null,
  normalized_ru text not null,
  transcription_ru text,
  context_note_ru text,
  audio_path text,
  audio_status public.content_status not null default 'draft',
  status public.content_status not null default 'draft',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_verified_phrases_status_category
  on public.verified_phrases(status, category);
create index if not exists idx_verified_phrases_normalized_ru
  on public.verified_phrases(normalized_ru);

drop trigger if exists trg_verified_phrases_updated_at on public.verified_phrases;
create trigger trg_verified_phrases_updated_at
before update on public.verified_phrases
for each row execute function public.set_updated_at();

-- 3. translation_requests (translator queries log)
create table if not exists public.translation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  direction text not null check (direction in ('ru_to_lez', 'lez_to_ru')),
  query_text text not null check (char_length(trim(query_text)) >= 1 and char_length(query_text) <= 500),
  matched_phrase_id uuid references public.verified_phrases(id) on delete set null,
  llm_draft_output text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_translation_requests_created
  on public.translation_requests(created_at desc);

-- 4. content_suggestions (moderation queue for suggested translations & edits)
create table if not exists public.content_suggestions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.translation_requests(id) on delete set null,
  suggested_by uuid not null references public.profiles(id) on delete cascade,
  source_ru text not null check (char_length(trim(source_ru)) >= 1 and char_length(source_ru) <= 500),
  suggested_lez text not null check (char_length(trim(suggested_lez)) >= 1 and char_length(suggested_lez) <= 500),
  comment text,
  status public.content_status not null default 'pending_review',
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_suggestions_status_created
  on public.content_suggestions(status, created_at desc);

drop trigger if exists trg_content_suggestions_updated_at on public.content_suggestions;
create trigger trg_content_suggestions_updated_at
before update on public.content_suggestions
for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.user_word_cards enable row level security;
alter table public.verified_phrases enable row level security;
alter table public.translation_requests enable row level security;
alter table public.content_suggestions enable row level security;

-- user_word_cards (private per learner)
drop policy if exists "Users can view own word cards" on public.user_word_cards;
create policy "Users can view own word cards"
  on public.user_word_cards for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own word cards" on public.user_word_cards;
create policy "Users can insert own word cards"
  on public.user_word_cards for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own word cards" on public.user_word_cards;
create policy "Users can update own word cards"
  on public.user_word_cards for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- verified_phrases (guests and learners see ONLY 'published'; reviewers/admins see all)
drop policy if exists "Anyone can read published verified_phrases" on public.verified_phrases;
create policy "Anyone can read published verified_phrases"
  on public.verified_phrases for select
  to anon, authenticated
  using (status = 'published' or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can manage verified_phrases" on public.verified_phrases;
create policy "Reviewers and admins can manage verified_phrases"
  on public.verified_phrases for all
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- translation_requests
drop policy if exists "Anyone can insert translation requests" on public.translation_requests;
create policy "Anyone can insert translation requests"
  on public.translation_requests for insert
  to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Users can view own translation requests or reviewers view all" on public.translation_requests;
create policy "Users can view own translation requests or reviewers view all"
  on public.translation_requests for select
  to authenticated
  using (auth.uid() = user_id or public.is_reviewer_or_admin());

-- content_suggestions (learners can ONLY submit as 'pending_review'; reviewers/admins moderate)
drop policy if exists "Authenticated users can submit pending content suggestions" on public.content_suggestions;
create policy "Authenticated users can submit pending content suggestions"
  on public.content_suggestions for insert
  to authenticated
  with check (auth.uid() = suggested_by and status = 'pending_review');

drop policy if exists "Users can view own suggestions or reviewers view all" on public.content_suggestions;
create policy "Users can view own suggestions or reviewers view all"
  on public.content_suggestions for select
  to authenticated
  using (auth.uid() = suggested_by or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can moderate content suggestions" on public.content_suggestions;
create policy "Reviewers and admins can moderate content suggestions"
  on public.content_suggestions for update
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- ============================================================================
-- 6. TABLE GRANTS FOR POSTGREST ROLES
-- ============================================================================

grant all on
  public.user_word_cards,
  public.verified_phrases,
  public.translation_requests,
  public.content_suggestions
to service_role;

grant select on public.verified_phrases to anon, authenticated;
grant insert on public.translation_requests to anon, authenticated;
grant select on public.translation_requests to authenticated;

grant select, insert, update, delete on public.verified_phrases to authenticated;
grant select, insert, update on public.user_word_cards to authenticated;
grant select, insert, update on public.content_suggestions to authenticated;
