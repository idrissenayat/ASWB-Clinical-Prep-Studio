alter table public.account_entitlements
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists purchased_at timestamptz;

drop index if exists account_entitlements_stripe_payment_intent_id_idx;
create unique index account_entitlements_stripe_payment_intent_id_idx
  on public.account_entitlements (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

drop index if exists account_entitlements_stripe_checkout_session_id_idx;
create unique index account_entitlements_stripe_checkout_session_id_idx
  on public.account_entitlements (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

alter table public.account_entitlements
  drop constraint if exists account_entitlements_free_questions_used_check;

alter table public.account_entitlements
  add constraint account_entitlements_free_questions_used_check
  check (
    free_questions_used >= 0
    and free_questions_used <= 75
  );

create table if not exists public.account_access_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in ('first_question', 'free_exhausted', 'purchase', 'access_expired')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists account_access_events_user_id_created_at_idx
  on public.account_access_events (user_id, created_at desc);

create index if not exists account_access_events_type_created_at_idx
  on public.account_access_events (event_type, created_at desc);

alter table public.account_access_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'account_access_events'
      and policyname = 'Account owners can read access events'
  ) then
    create policy "Account owners can read access events"
      on public.account_access_events
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end;
$$;

create or replace function public.get_account_access()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  entitlement public.account_entitlements%rowtype;
  free_limit constant integer := 75;
  now_value timestamptz := now();
  has_full_access boolean := false;
  days_remaining integer := 0;
begin
  if current_user_id is null then
    return jsonb_build_object(
      'plan', 'free',
      'status', 'anonymous',
      'freeQuestionsUsed', 0,
      'freeLimit', free_limit,
      'currentPeriodEnd', null,
      'hasFullAccess', false,
      'daysRemaining', 0,
      'expiresSoon', false,
      'isExpired', false
    );
  end if;

  insert into public.account_entitlements (user_id, plan, status)
  values (current_user_id, 'free', 'active')
  on conflict (user_id) do nothing;

  update public.account_entitlements
    set status = 'expired'
    where user_id = current_user_id
      and plan = 'paid'
      and current_period_end is not null
      and current_period_end <= now_value
      and status <> 'expired';

  if found then
    insert into public.account_access_events (user_id, event_type, metadata)
    values (current_user_id, 'access_expired', jsonb_build_object('expiredAt', now_value));
  end if;

  select *
    into entitlement
    from public.account_entitlements
    where user_id = current_user_id;

  has_full_access :=
    entitlement.plan = 'paid'
    and entitlement.status = 'active'
    and entitlement.current_period_end is not null
    and entitlement.current_period_end > now_value;

  if has_full_access then
    days_remaining :=
      greatest(0, ceil(extract(epoch from (entitlement.current_period_end - now_value)) / 86400)::integer);
  end if;

  return jsonb_build_object(
    'plan', entitlement.plan,
    'status', entitlement.status,
    'freeQuestionsUsed', entitlement.free_questions_used,
    'freeLimit', free_limit,
    'currentPeriodEnd', entitlement.current_period_end,
    'hasFullAccess', has_full_access,
    'daysRemaining', days_remaining,
    'expiresSoon', has_full_access and days_remaining <= 14,
    'isExpired', entitlement.plan = 'paid' and not has_full_access
  );
end;
$$;

create or replace function public.consume_question_access()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  entitlement public.account_entitlements%rowtype;
  free_limit constant integer := 75;
  now_value timestamptz := now();
  next_used integer;
  has_full_access boolean := false;
begin
  if current_user_id is null then
    return jsonb_build_object(
      'allowed', false,
      'freeQuestionsUsed', free_limit,
      'hasFullAccess', false,
      'status', 'anonymous'
    );
  end if;

  insert into public.account_entitlements (user_id, plan, status)
  values (current_user_id, 'free', 'active')
  on conflict (user_id) do nothing;

  update public.account_entitlements
    set status = 'expired'
    where user_id = current_user_id
      and plan = 'paid'
      and current_period_end is not null
      and current_period_end <= now_value
      and status <> 'expired';

  if found then
    insert into public.account_access_events (user_id, event_type, metadata)
    values (current_user_id, 'access_expired', jsonb_build_object('expiredAt', now_value));
  end if;

  select *
    into entitlement
    from public.account_entitlements
    where user_id = current_user_id;

  has_full_access :=
    entitlement.plan = 'paid'
    and entitlement.status = 'active'
    and entitlement.current_period_end is not null
    and entitlement.current_period_end > now_value;

  if has_full_access then
    return jsonb_build_object(
      'allowed', true,
      'freeQuestionsUsed', entitlement.free_questions_used,
      'hasFullAccess', true,
      'status', entitlement.status,
      'currentPeriodEnd', entitlement.current_period_end
    );
  end if;

  if entitlement.plan = 'paid' and entitlement.status = 'expired' then
    return jsonb_build_object(
      'allowed', false,
      'freeQuestionsUsed', entitlement.free_questions_used,
      'hasFullAccess', false,
      'status', 'expired',
      'currentPeriodEnd', entitlement.current_period_end
    );
  end if;

  update public.account_entitlements
    set free_questions_used = free_questions_used + 1
    where user_id = current_user_id
      and plan = 'free'
      and status = 'active'
      and free_questions_used < free_limit
    returning free_questions_used into next_used;

  if next_used is not null then
    if next_used = 1 then
      insert into public.account_access_events (user_id, event_type, metadata)
      values (current_user_id, 'first_question', jsonb_build_object('freeQuestionsUsed', next_used));
    end if;

    if next_used = free_limit then
      insert into public.account_access_events (user_id, event_type, metadata)
      values (current_user_id, 'free_exhausted', jsonb_build_object('freeQuestionsUsed', next_used));
    end if;

    return jsonb_build_object(
      'allowed', true,
      'freeQuestionsUsed', next_used,
      'hasFullAccess', false,
      'status', 'active'
    );
  end if;

  return jsonb_build_object(
    'allowed', false,
    'freeQuestionsUsed', entitlement.free_questions_used,
    'hasFullAccess', false,
    'status', entitlement.status
  );
end;
$$;

create or replace function public.consume_free_question()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.consume_question_access();
end;
$$;

create or replace function public.activate_paid_access(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_purchased_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.account_entitlements (
    user_id,
    plan,
    status,
    stripe_customer_id,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    purchased_at,
    current_period_end
  )
  values (
    p_user_id,
    'paid',
    'active',
    p_stripe_customer_id,
    p_stripe_checkout_session_id,
    p_stripe_payment_intent_id,
    p_purchased_at,
    p_purchased_at + interval '180 days'
  )
  on conflict (user_id) do update
    set plan = 'paid',
        status = 'active',
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_checkout_session_id = excluded.stripe_checkout_session_id,
        stripe_payment_intent_id = excluded.stripe_payment_intent_id,
        purchased_at = excluded.purchased_at,
        current_period_end = excluded.current_period_end,
        updated_at = now();

  insert into public.account_access_events (user_id, event_type, metadata)
  values (
    p_user_id,
    'purchase',
    jsonb_build_object(
      'stripeCheckoutSessionId', p_stripe_checkout_session_id,
      'stripePaymentIntentId', p_stripe_payment_intent_id,
      'purchasedAt', p_purchased_at,
      'accessDays', 180
    )
  );
end;
$$;

revoke all on function public.activate_paid_access(uuid, text, text, text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.activate_paid_access(uuid, text, text, text, timestamptz)
  to service_role;

grant execute on function public.get_account_access() to authenticated;
grant execute on function public.consume_question_access() to authenticated;
grant execute on function public.consume_free_question() to authenticated;
