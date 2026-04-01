-- Migration: Add blog_posts table for SEO blog and admin CRUD

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image text,
  category text,
  target_keyword text,
  seo_title text,
  seo_description text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts (is_published, published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_posts_select_public ON public.blog_posts;
CREATE POLICY blog_posts_select_public
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS blog_posts_insert_public ON public.blog_posts;
CREATE POLICY blog_posts_insert_public
  ON public.blog_posts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS blog_posts_update_public ON public.blog_posts;
CREATE POLICY blog_posts_update_public
  ON public.blog_posts
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS blog_posts_delete_public ON public.blog_posts;
CREATE POLICY blog_posts_delete_public
  ON public.blog_posts
  FOR DELETE
  TO anon, authenticated
  USING (true);
