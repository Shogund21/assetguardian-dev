
-- Phase 1: Fix Storage Bucket and Policies (already done, but ensuring consistency)
-- Ensure the company-assets bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Drop all existing storage policies for company-assets to start fresh
DROP POLICY IF EXISTS "Authenticated users can upload company assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update company assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete company assets" ON storage.objects;

-- Create comprehensive storage policies for company-assets bucket
CREATE POLICY "Authenticated users can upload company assets" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view company assets" ON storage.objects
FOR SELECT 
USING (bucket_id = 'company-assets');

CREATE POLICY "Authenticated users can update company assets" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'company-assets' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete company assets" ON storage.objects
FOR DELETE 
USING (bucket_id = 'company-assets' AND auth.role() = 'authenticated');

-- Phase 2: Fix Companies Table RLS
-- Enable RLS on companies table (if not already enabled)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can delete companies" ON public.companies;

-- Recreate all policies for companies table
CREATE POLICY "Authenticated users can view companies" 
  ON public.companies 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update companies" 
  ON public.companies 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete companies" 
  ON public.companies 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
