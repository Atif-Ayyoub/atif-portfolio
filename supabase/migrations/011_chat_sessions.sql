-- Chat session tracking: current state per session
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  current_topic text,
  selected_project text,
  last_intent text,
  context jsonb,
  message_count int default 0,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Index for session lookups
create index if not exists chat_sessions_session_id_idx on chat_sessions(session_id);
create index if not exists chat_sessions_updated_at_idx on chat_sessions(updated_at desc);

-- Enable RLS
alter table chat_sessions enable row level security;

-- Allow public read/write
create policy "Allow public read" on chat_sessions
  for select using (true);

create policy "Allow public insert" on chat_sessions
  for insert with check (true);

create policy "Allow public update" on chat_sessions
  for update using (true);
