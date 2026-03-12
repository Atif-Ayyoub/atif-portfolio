-- Migration: Enable RLS and allow app access for `news` table
-- NOTE: These policies are permissive for anon/authenticated users.
-- Tighten them for production if needed.

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS news_select_all ON public.news;
DROP POLICY IF EXISTS news_insert_all ON public.news;
DROP POLICY IF EXISTS news_update_all ON public.news;
DROP POLICY IF EXISTS news_delete_all ON public.news;

CREATE POLICY news_select_all
ON public.news
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY news_insert_all
ON public.news
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY news_update_all
ON public.news
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY news_delete_all
ON public.news
FOR DELETE
TO anon, authenticated
USING (true);
