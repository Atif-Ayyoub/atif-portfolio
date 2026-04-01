-- Phase 2.5: Learned facts versioning and source weighting
alter table public.learned_facts
  add column if not exists version int not null default 1,
  add column if not exists is_active boolean not null default true,
  add column if not exists source_weight int not null default 1;

create index if not exists learned_facts_entity_field_active_idx
  on public.learned_facts(entity_name, field_name, is_active);

create index if not exists learned_facts_entity_field_version_idx
  on public.learned_facts(entity_name, field_name, version desc);