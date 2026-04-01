-- Phase 2: FAQ pattern learning and reuse
create table if not exists public.faq_patterns (
  id uuid primary key default gen_random_uuid(),
  question_pattern text not null,
  normalized_pattern text not null unique,
  frequency int not null default 1,
  last_seen timestamp with time zone not null default now(),
  suggested_answer text,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists faq_patterns_status_idx on public.faq_patterns(status);
create index if not exists faq_patterns_frequency_idx on public.faq_patterns(frequency desc);

alter table public.faq_patterns enable row level security;
