
-- Fix the storage policy for company assets bucket
-- Drop the existing INSERT policy that may be causing issues
DROP POLICY IF EXISTS "Authenticated users can upload company assets" ON storage.objects;

-- Create a corrected INSERT policy with proper bucket restriction
CREATE POLICY "Authenticated users can upload company assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');
