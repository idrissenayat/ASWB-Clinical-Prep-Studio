create extension if not exists pgcrypto;

create table if not exists public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 64),
  progress jsonb not null default '{
    "attempts": [],
    "bookmarks": [],
    "completedTasks": [],
    "targetDate": "2026-08-03"
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learner_profiles_user_id_idx
  on public.learner_profiles (user_id);

alter table public.learner_profiles enable row level security;

drop policy if exists "Learners can read their profiles" on public.learner_profiles;
create policy "Learners can read their profiles"
  on public.learner_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Learners can create their profiles" on public.learner_profiles;
create policy "Learners can create their profiles"
  on public.learner_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Learners can update their profiles" on public.learner_profiles;
create policy "Learners can update their profiles"
  on public.learner_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Learners can delete their profiles" on public.learner_profiles;
create policy "Learners can delete their profiles"
  on public.learner_profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learner_profiles_set_updated_at on public.learner_profiles;
create trigger learner_profiles_set_updated_at
  before update on public.learner_profiles
  for each row
  execute function public.set_updated_at();
