-- Conversation memory table: stores individual messages for context retrieval
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_message text,
  bot_reply text,
  current_topic text,
  selected_project text,
  last_intent text,
  last_entities jsonb,
  created_at timestamp with time zone default now()
);

-- Index for session queries
create index if not exists conversations_session_id_idx on conversations(session_id);
create index if not exists conversations_created_at_idx on conversations(created_at desc);

-- Enable RLS
alter table conversations enable row level security;

-- Allow public read/write (portfolio assistant is public)
create policy "Allow public read" on conversations
  for select using (true);

create policy "Allow public insert" on conversations
  for insert with check (true);

create policy "Allow public update" on conversations
  for update using (true);
