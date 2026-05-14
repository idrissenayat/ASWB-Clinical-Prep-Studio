create table if not exists public.question_bank (
  id text primary key,
  domain text not null check (domain in ('ethics', 'assessment', 'intervention')),
  area text not null check (area in ('IA', 'IB', 'IC', 'IIA', 'IIB', 'IIC', 'IIIA', 'IIIB', 'IIIC', 'IIID', 'IVA', 'IVB', 'IVC')),
  area_2026 text not null check (area_2026 in ('IA', 'IB', 'IC', 'IIA', 'IIB', 'IIC', 'IIIA', 'IIIB', 'IIIC', 'IIID')),
  competency text not null,
  skill text not null check (skill in ('recall', 'application', 'reasoning')),
  difficulty text not null check (difficulty in ('foundation', 'applied', 'exam-ready')),
  tags text[] not null default '{}',
  stem text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  answer_index integer not null check (answer_index >= 0 and answer_index <= 3),
  rationale text not null,
  exam_lens text not null,
  is_free_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_bank_free_sample_idx
  on public.question_bank (is_free_sample);

create index if not exists question_bank_domain_idx
  on public.question_bank (domain);

create index if not exists question_bank_area_idx
  on public.question_bank (area);

create index if not exists question_bank_area_2026_idx
  on public.question_bank (area_2026);

alter table public.question_bank enable row level security;

revoke all on table public.question_bank from public, anon, authenticated;
grant all on table public.question_bank to service_role;

drop trigger if exists question_bank_set_updated_at on public.question_bank;
create trigger question_bank_set_updated_at
  before update on public.question_bank
  for each row
  execute function public.set_updated_at();

create table if not exists public.study_flashcards (
  id text primary key,
  domain text not null check (domain in ('ethics', 'assessment', 'intervention')),
  front text not null,
  back text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_flashcards_domain_idx
  on public.study_flashcards (domain);

alter table public.study_flashcards enable row level security;

revoke all on table public.study_flashcards from public, anon, authenticated;
grant all on table public.study_flashcards to service_role;

drop trigger if exists study_flashcards_set_updated_at on public.study_flashcards;
create trigger study_flashcards_set_updated_at
  before update on public.study_flashcards
  for each row
  execute function public.set_updated_at();

revoke all on function public.get_account_access() from public, anon;
revoke all on function public.consume_question_access() from public, anon;
revoke all on function public.consume_free_question() from public, anon;

grant execute on function public.get_account_access() to authenticated;
grant execute on function public.consume_question_access() to authenticated;
grant execute on function public.consume_free_question() to authenticated;
