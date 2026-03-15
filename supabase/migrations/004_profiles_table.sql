-- Migration: Create `profiles` table for user metadata (is_admin flag)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles (is_admin);
