-- Migration: Add blog-images storage bucket and policies

-- Create blog-images bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT DO NOTHING;

-- Allow anon and authenticated users to upload (insert) objects
DROP POLICY IF EXISTS "Allow upload to blog-images" ON storage.objects;
CREATE POLICY "Allow upload to blog-images"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow public read of objects
DROP POLICY IF EXISTS "Allow public read of blog-images" ON storage.objects;
CREATE POLICY "Allow public read of blog-images"
ON storage.objects
FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'blog-images');

-- Allow anon and authenticated users to update objects
DROP POLICY IF EXISTS "Allow update in blog-images" ON storage.objects;
CREATE POLICY "Allow update in blog-images"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

-- Allow anon and authenticated users to delete objects
DROP POLICY IF EXISTS "Allow delete in blog-images" ON storage.objects;
CREATE POLICY "Allow delete in blog-images"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'blog-images');
