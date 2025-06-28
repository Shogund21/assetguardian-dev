
-- Fix the storage policy for company assets bucket
-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload company assets" ON storage.objects;

-- Create INSERT policy with only WITH CHECK clause (USING is not allowed for INSERT)
CREATE POLICY "Authenticated users can upload company assets" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');
