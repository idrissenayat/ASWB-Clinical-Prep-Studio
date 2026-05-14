create table if not exists public.account_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'paid')),
  status text not null default 'active',
  free_questions_used integer not null default 0 check (
    free_questions_used >= 0
    and free_questions_used <= 25
  ),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists account_entitlements_plan_status_idx
  on public.account_entitlements (plan, status);

create unique index if not exists account_entitlements_stripe_subscription_id_idx
  on public.account_entitlements (stripe_subscription_id)
  where stripe_subscription_id is not null;

alter table public.account_entitlements enable row level security;

alter table public.account_entitlements
  add column if not exists free_questions_used integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'account_entitlements_free_questions_used_check'
      and conrelid = 'public.account_entitlements'::regclass
  ) then
    alter table public.account_entitlements
      add constraint account_entitlements_free_questions_used_check
      check (
        free_questions_used >= 0
        and free_questions_used <= 25
      );
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.consume_free_question()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  next_used integer;
  current_used integer;
begin
  if current_user_id is null then
    return jsonb_build_object('allowed', false, 'freeQuestionsUsed', 25);
  end if;

  insert into public.account_entitlements (user_id, plan, status)
  values (current_user_id, 'free', 'active')
  on conflict (user_id) do nothing;

  update public.account_entitlements
    set free_questions_used = free_questions_used + 1
    where user_id = current_user_id
      and plan = 'free'
      and status = 'active'
      and free_questions_used < 25
    returning free_questions_used into next_used;

  if next_used is not null then
    return jsonb_build_object('allowed', true, 'freeQuestionsUsed', next_used);
  end if;

  select free_questions_used
    into current_used
    from public.account_entitlements
    where user_id = current_user_id;

  return jsonb_build_object(
    'allowed',
    false,
    'freeQuestionsUsed',
    coalesce(current_used, 25)
  );
end;
$$;

grant execute on function public.consume_free_question() to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'account_entitlements_set_updated_at'
      and tgrelid = 'public.account_entitlements'::regclass
  ) then
    create trigger account_entitlements_set_updated_at
      before update on public.account_entitlements
      for each row
      execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'account_entitlements'
      and policyname = 'Account owners can read entitlement'
  ) then
    create policy "Account owners can read entitlement"
      on public.account_entitlements
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'account_entitlements'
      and policyname = 'Account owners can create free entitlement'
  ) then
    create policy "Account owners can create free entitlement"
      on public.account_entitlements
      for insert
      to authenticated
      with check (
        auth.uid() = user_id
        and plan = 'free'
        and status = 'active'
      );
  end if;
end;
$$;
