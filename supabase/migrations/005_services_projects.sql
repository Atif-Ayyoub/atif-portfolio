-- Migration: Create `services` and `projects` tables

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  image_path text,
  created_by uuid REFERENCES auth.users,
  inserted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  details text,
  repo_url text,
  live_url text,
  tech jsonb DEFAULT '[]'::jsonb,
  cover_image text,
  gallery jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users,
  inserted_at timestamptz DEFAULT now()
);

-- Enable RLS and add restrictive policies: only admin users (profiles.is_admin) can modify
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Services policies
DROP POLICY IF EXISTS services_select_public ON public.services;
CREATE POLICY services_select_public ON public.services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS services_modify_admin ON public.services;
CREATE POLICY services_modify_admin ON public.services FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
);

-- Projects policies
DROP POLICY IF EXISTS projects_select_public ON public.projects;
CREATE POLICY projects_select_public ON public.projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS projects_modify_admin ON public.projects;
CREATE POLICY projects_modify_admin ON public.projects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
);
