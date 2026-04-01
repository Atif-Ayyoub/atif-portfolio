-- Phase 2: Learned facts storage for controlled long-term learning
create table if not exists public.learned_facts (
  id uuid primary key default gen_random_uuid(),
  fact_key text not null unique,
  fact_type text not null,
  entity_name text,
  field_name text,
  field_value jsonb,
  confidence double precision not null default 0.0,
  source text not null default 'conversation',
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  approved_at timestamp with time zone,
  updated_at timestamp with time zone not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists learned_facts_status_idx on public.learned_facts(status);
create index if not exists learned_facts_entity_idx on public.learned_facts(entity_name);
create index if not exists learned_facts_fact_type_idx on public.learned_facts(fact_type);

alter table public.learned_facts enable row level security;
