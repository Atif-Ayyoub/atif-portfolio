-- Migration: Add storage policies for `news-images` bucket
-- Run this in Supabase SQL Editor

-- Allow anon and authenticated users to upload (insert) objects
CREATE POLICY "Allow anon upload to news-images"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'news-images');

-- Allow public read of objects
CREATE POLICY "Allow public read of news-images"
ON storage.objects
FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'news-images');

-- Allow anon and authenticated users to update objects
CREATE POLICY "Allow anon update in news-images"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'news-images')
WITH CHECK (bucket_id = 'news-images');

-- Allow anon and authenticated users to delete objects
CREATE POLICY "Allow anon delete in news-images"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'news-images');
