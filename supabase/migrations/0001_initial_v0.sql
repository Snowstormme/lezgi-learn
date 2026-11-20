-- ============================================================================
-- Lezgi Learn — v0 Initial Database Schema & Row Level Security (RLS)
-- Target: Supabase Postgres 15+
-- Run this migration in the Supabase SQL Editor or via `npx supabase db push`
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

do $$ begin
  create type public.content_status as enum (
    'draft',
    'pending_review',
    'published',
    'rejected',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.user_role as enum (
    'learner',
    'reviewer',
    'admin'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.exercise_type as enum (
    'multiple_choice',
    'matching',
    'word_input'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_status as enum (
    'open',
    'resolved',
    'dismissed'
  );
exception
  when duplicate_object then null;
end $$;

-- ============================================================================
-- 2. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 3. TABLES (v0)
-- ============================================================================

-- 3.1. profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'learner',
  interface_locale text not null default 'ru' check (interface_locale in ('ru', 'lez', 'az')),
  xp integer not null default 0 check (xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile when a user signs up via Supabase Auth (Email + Password)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Prevent regular users from escalating their own role via client UPDATE
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Allow change only by service_role (seed/admin backend) or an existing admin
    if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
      if not exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      ) then
        raise exception 'Changing profile role is forbidden.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
before update on public.profiles
for each row execute function public.protect_profile_role();

-- Helper function for RLS to check if current user is reviewer or admin
create or replace function public.is_reviewer_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('reviewer', 'admin')
  );
$$;

-- 3.2. words (dictionary lemmas)
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  lemma_lez text not null,
  translation_ru text not null,
  translation_az text,
  transcription_ru text,
  part_of_speech text,
  grammar_notes_ru text,
  audio_path text,
  audio_status public.content_status not null default 'draft',
  status public.content_status not null default 'draft',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_words_status on public.words(status);
create index if not exists idx_words_lemma_lez on public.words(lemma_lez);
create index if not exists idx_words_translation_ru on public.words(translation_ru);

drop trigger if exists trg_words_updated_at on public.words;
create trigger trg_words_updated_at
before update on public.words
for each row execute function public.set_updated_at();

-- 3.3. word_examples (verified usage examples for dictionary entries)
create table if not exists public.word_examples (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  word_id uuid not null references public.words(id) on delete cascade,
  sentence_lez text not null,
  translation_ru text not null,
  audio_path text,
  status public.content_status not null default 'draft',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_word_examples_word_status on public.word_examples(word_id, status);

drop trigger if exists trg_word_examples_updated_at on public.word_examples;
create trigger trg_word_examples_updated_at
before update on public.word_examples
for each row execute function public.set_updated_at();

-- 3.4. units (course units, e.g., Unit 1: Greetings)
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  order_index integer not null check (order_index > 0),
  title_ru text not null,
  description_ru text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_units_status_order on public.units(status, order_index);

drop trigger if exists trg_units_updated_at on public.units;
create trigger trg_units_updated_at
before update on public.units
for each row execute function public.set_updated_at();

-- 3.5. lessons (lessons inside a unit)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  unit_id uuid not null references public.units(id) on delete cascade,
  order_index integer not null check (order_index > 0),
  title_ru text not null,
  grammar_tip_ru text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, order_index)
);

create index if not exists idx_lessons_unit_status_order on public.lessons(unit_id, status, order_index);

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

-- 3.6. exercises (exercises inside a lesson)
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  order_index integer not null check (order_index > 0),
  type public.exercise_type not null,
  word_id uuid references public.words(id) on delete set null,
  prompt_ru text not null,
  payload jsonb not null,
  status public.content_status not null default 'draft',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_exercises_lesson_status_order on public.exercises(lesson_id, status, order_index);
create index if not exists idx_exercises_word_id on public.exercises(word_id);

drop trigger if exists trg_exercises_updated_at on public.exercises;
create trigger trg_exercises_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();

-- 3.7. user_progress (authenticated user lesson completion & score)
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null check (status in ('in_progress', 'completed')),
  score smallint check (score is null or (score >= 0 and score <= 100)),
  attempts_count integer not null default 1 check (attempts_count >= 1),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists idx_user_progress_user_status on public.user_progress(user_id, status);

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

-- 3.8. content_reports (mistake reports from learners)
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null check (entity_type in ('word', 'word_example', 'exercise', 'lesson')),
  entity_id uuid not null,
  comment text not null check (char_length(trim(comment)) >= 3 and char_length(comment) <= 1000),
  report_status public.report_status not null default 'open',
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_reports_status_created on public.content_reports(report_status, created_at desc);
create index if not exists idx_content_reports_reporter on public.content_reports(reporter_id);

drop trigger if exists trg_content_reports_updated_at on public.content_reports;
create trigger trg_content_reports_updated_at
before update on public.content_reports
for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.words enable row level security;
alter table public.word_examples enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.user_progress enable row level security;
alter table public.content_reports enable row level security;

-- 4.1. profiles policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_reviewer_or_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4.2. Content tables (words, word_examples, units, lessons, exercises)
-- Guests (anon) and learners (authenticated) can browse ONLY 'published' content.
-- Native reviewers and admins can read and manage all statuses.

-- words
drop policy if exists "Anyone can read published words" on public.words;
create policy "Anyone can read published words"
  on public.words for select
  to anon, authenticated
  using (status = 'published' or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can manage words" on public.words;
create policy "Reviewers and admins can manage words"
  on public.words for all
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- word_examples
drop policy if exists "Anyone can read published word_examples" on public.word_examples;
create policy "Anyone can read published word_examples"
  on public.word_examples for select
  to anon, authenticated
  using (status = 'published' or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can manage word_examples" on public.word_examples;
create policy "Reviewers and admins can manage word_examples"
  on public.word_examples for all
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- units
drop policy if exists "Anyone can read published units" on public.units;
create policy "Anyone can read published units"
  on public.units for select
  to anon, authenticated
  using (status = 'published' or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can manage units" on public.units;
create policy "Reviewers and admins can manage units"
  on public.units for all
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- lessons
drop policy if exists "Anyone can read published lessons" on public.lessons;
create policy "Anyone can read published lessons"
  on public.lessons for select
  to anon, authenticated
  using (status = 'published' or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can manage lessons" on public.lessons;
create policy "Reviewers and admins can manage lessons"
  on public.lessons for all
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- exercises
drop policy if exists "Anyone can read published exercises" on public.exercises;
create policy "Anyone can read published exercises"
  on public.exercises for select
  to anon, authenticated
  using (status = 'published' or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can manage exercises" on public.exercises;
create policy "Reviewers and admins can manage exercises"
  on public.exercises for all
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- 4.3. user_progress policies (strictly private to each authenticated user)
drop policy if exists "Users can view own progress" on public.user_progress;
create policy "Users can view own progress"
  on public.user_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
  on public.user_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_progress;
create policy "Users can update own progress"
  on public.user_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4.4. content_reports policies
drop policy if exists "Users can insert own content reports" on public.content_reports;
create policy "Users can insert own content reports"
  on public.content_reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "Users can view own content reports or reviewers view all" on public.content_reports;
create policy "Users can view own content reports or reviewers view all"
  on public.content_reports for select
  to authenticated
  using (auth.uid() = reporter_id or public.is_reviewer_or_admin());

drop policy if exists "Reviewers and admins can update content reports" on public.content_reports;
create policy "Reviewers and admins can update content reports"
  on public.content_reports for update
  to authenticated
  using (public.is_reviewer_or_admin())
  with check (public.is_reviewer_or_admin());

-- ============================================================================
-- 5. TABLE & SCHEMA GRANTS (PostgREST role privileges)
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;

-- Guest (anon) can only SELECT from the 5 content tables (further filtered by RLS to status = 'published')
grant select on
  public.words,
  public.word_examples,
  public.units,
  public.lessons,
  public.exercises
to anon;

-- Authenticated users get table-level access gated by RLS policies above
grant select, insert, update, delete on
  public.words,
  public.word_examples,
  public.units,
  public.lessons,
  public.exercises
to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.user_progress to authenticated;
grant select, insert, update on public.content_reports to authenticated;
grant execute on function public.is_reviewer_or_admin() to anon, authenticated, service_role;

