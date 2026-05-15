create table if not exists public.question_attempt_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.question_bank(id) on delete cascade,
  exam_model text not null check (exam_model in ('2026', 'pre2026')),
  domain text not null check (domain in ('ethics', 'assessment', 'intervention')),
  area text not null check (area in ('IA', 'IB', 'IC', 'IIA', 'IIB', 'IIC', 'IIIA', 'IIIB', 'IIIC', 'IIID', 'IVA', 'IVB', 'IVC')),
  selected_index integer not null check (selected_index >= 0 and selected_index <= 3),
  answer_index integer not null check (answer_index >= 0 and answer_index <= 3),
  is_correct boolean not null,
  source text not null check (source in ('practice', 'simulation')),
  response_seconds integer check (response_seconds is null or response_seconds >= 0),
  created_at timestamptz not null default now()
);

create index if not exists question_attempt_events_question_created_idx
  on public.question_attempt_events (question_id, created_at desc);

create index if not exists question_attempt_events_user_created_idx
  on public.question_attempt_events (user_id, created_at desc);

create index if not exists question_attempt_events_domain_area_idx
  on public.question_attempt_events (exam_model, domain, area);

alter table public.question_attempt_events enable row level security;

revoke all on table public.question_attempt_events from public, anon, authenticated;
grant all on table public.question_attempt_events to service_role;

create table if not exists public.question_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.question_bank(id) on delete cascade,
  exam_model text not null check (exam_model in ('2026', 'pre2026')),
  domain text not null check (domain in ('ethics', 'assessment', 'intervention')),
  area text not null check (area in ('IA', 'IB', 'IC', 'IIA', 'IIB', 'IIC', 'IIIA', 'IIIB', 'IIIC', 'IIID', 'IVA', 'IVB', 'IVC')),
  feedback_type text not null check (
    feedback_type in ('too_easy', 'confusing', 'answer_wrong', 'bad_distractor', 'not_realistic', 'typo', 'other')
  ),
  source text not null check (source in ('practice', 'simulation')),
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists question_feedback_question_created_idx
  on public.question_feedback (question_id, created_at desc);

create index if not exists question_feedback_type_created_idx
  on public.question_feedback (feedback_type, created_at desc);

create index if not exists question_feedback_user_created_idx
  on public.question_feedback (user_id, created_at desc);

alter table public.question_feedback enable row level security;

revoke all on table public.question_feedback from public, anon, authenticated;
grant all on table public.question_feedback to service_role;

create table if not exists public.question_sme_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references auth.users(id) on delete set null,
  question_id text not null references public.question_bank(id) on delete cascade,
  status text not null check (
    status in ('accurate', 'approved', 'too_easy', 'unclear', 'bad_distractor', 'needs_rewrite', 'retired')
  ),
  notes text check (notes is null or char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_sme_reviews_question_created_idx
  on public.question_sme_reviews (question_id, created_at desc);

create index if not exists question_sme_reviews_status_created_idx
  on public.question_sme_reviews (status, created_at desc);

alter table public.question_sme_reviews enable row level security;

revoke all on table public.question_sme_reviews from public, anon, authenticated;
grant all on table public.question_sme_reviews to service_role;

drop trigger if exists question_sme_reviews_set_updated_at on public.question_sme_reviews;
create trigger question_sme_reviews_set_updated_at
  before update on public.question_sme_reviews
  for each row
  execute function public.set_updated_at();

create or replace view public.question_quality_summary as
with attempt_rollup as (
  select
    question_id,
    count(*)::integer as attempts,
    round(avg(case when is_correct then 1 else 0 end)::numeric, 4) as correct_rate,
    round(avg(response_seconds)::numeric, 1) as avg_response_seconds,
    count(*) filter (where source = 'practice')::integer as practice_attempts,
    count(*) filter (where source = 'simulation')::integer as simulation_attempts
  from public.question_attempt_events
  group by question_id
),
feedback_rollup as (
  select
    question_id,
    count(*)::integer as feedback_count,
    count(*) filter (where feedback_type = 'too_easy')::integer as too_easy_count,
    count(*) filter (where feedback_type = 'confusing')::integer as confusing_count,
    count(*) filter (where feedback_type = 'answer_wrong')::integer as answer_wrong_count,
    count(*) filter (where feedback_type = 'bad_distractor')::integer as bad_distractor_count,
    count(*) filter (where feedback_type = 'not_realistic')::integer as not_realistic_count,
    count(*) filter (where feedback_type = 'typo')::integer as typo_count
  from public.question_feedback
  group by question_id
)
select
  question_bank.id as question_id,
  question_bank.domain,
  question_bank.area,
  question_bank.area_2026,
  coalesce(attempt_rollup.attempts, 0) as attempts,
  coalesce(attempt_rollup.correct_rate, 0) as correct_rate,
  attempt_rollup.avg_response_seconds,
  coalesce(attempt_rollup.practice_attempts, 0) as practice_attempts,
  coalesce(attempt_rollup.simulation_attempts, 0) as simulation_attempts,
  coalesce(feedback_rollup.feedback_count, 0) as feedback_count,
  coalesce(feedback_rollup.too_easy_count, 0) as too_easy_count,
  coalesce(feedback_rollup.confusing_count, 0) as confusing_count,
  coalesce(feedback_rollup.answer_wrong_count, 0) as answer_wrong_count,
  coalesce(feedback_rollup.bad_distractor_count, 0) as bad_distractor_count,
  coalesce(feedback_rollup.not_realistic_count, 0) as not_realistic_count,
  coalesce(feedback_rollup.typo_count, 0) as typo_count,
  (
    coalesce(feedback_rollup.feedback_count, 0) >= 3
    or coalesce(feedback_rollup.answer_wrong_count, 0) >= 1
    or coalesce(feedback_rollup.bad_distractor_count, 0) >= 2
    or coalesce(feedback_rollup.not_realistic_count, 0) >= 2
    or (
      coalesce(attempt_rollup.attempts, 0) >= 20
      and coalesce(attempt_rollup.correct_rate, 0) >= 0.9
    )
    or (
      coalesce(attempt_rollup.attempts, 0) >= 20
      and coalesce(attempt_rollup.correct_rate, 0) <= 0.25
    )
  ) as needs_review
from public.question_bank
left join attempt_rollup
  on attempt_rollup.question_id = question_bank.id
left join feedback_rollup
  on feedback_rollup.question_id = question_bank.id;

revoke all on table public.question_quality_summary from public, anon, authenticated;
grant select on table public.question_quality_summary to service_role;
