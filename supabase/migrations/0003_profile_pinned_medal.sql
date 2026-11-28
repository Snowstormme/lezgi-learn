-- Add pinned achievement medal preference column to public.profiles
alter table public.profiles
  add column if not exists pinned_medal_id text;
