-- Fix companies RLS policy to allow unauthenticated users (for landing page)
-- This prevents the "could not load companies" error on the landing page

DROP POLICY IF EXISTS "Users can view companies they are members of" ON public.companies;
CREATE POLICY "Users can view companies they are members of" 
ON public.companies FOR SELECT 
USING (
  -- Allow unauthenticated users to see companies (for landing page)
  auth.uid() IS NULL OR 
  -- Allow authenticated users to see their companies
  is_member_of(id) OR 
  -- Allow super admins to see all companies
  can_access_all_data()
);