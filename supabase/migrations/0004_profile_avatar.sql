-- Add avatar_id column to public.profiles so learners can save their chosen profile avatar
alter table public.profiles
  add column if not exists avatar_id text;
