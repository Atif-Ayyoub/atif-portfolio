-- Migration: Persist app settings and contact messages

CREATE TABLE IF NOT EXISTS public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  subject text,
  message text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_submitted_at
  ON public.contact_messages (submitted_at DESC);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_settings_select_public ON public.app_settings;
CREATE POLICY app_settings_select_public
  ON public.app_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS app_settings_insert_public ON public.app_settings;
CREATE POLICY app_settings_insert_public
  ON public.app_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS app_settings_update_public ON public.app_settings;
CREATE POLICY app_settings_update_public
  ON public.app_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_messages_select_public ON public.contact_messages;
CREATE POLICY contact_messages_select_public
  ON public.contact_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS contact_messages_insert_public ON public.contact_messages;
CREATE POLICY contact_messages_insert_public
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_messages_update_public ON public.contact_messages;
CREATE POLICY contact_messages_update_public
  ON public.contact_messages
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_messages_delete_public ON public.contact_messages;
CREATE POLICY contact_messages_delete_public
  ON public.contact_messages
  FOR DELETE
  TO anon, authenticated
  USING (true);
