-- Migration: Create `news` table
-- Run this SQL in Supabase SQL Editor or via psql connected to your Supabase DB

CREATE TABLE IF NOT EXISTS public.news (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT,
  description TEXT,
  url TEXT UNIQUE,
  image TEXT,
  published_at TIMESTAMPTZ,
  source TEXT,
  category TEXT,
  inserted_at TIMESTAMPTZ DEFAULT now()
);

-- Optional: index to speed up deletion/queries by published_at
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news (published_at);
