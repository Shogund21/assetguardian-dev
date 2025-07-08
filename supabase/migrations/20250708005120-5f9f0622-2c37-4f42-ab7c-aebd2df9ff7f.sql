-- Debug auth.uid() and fix authentication issues
-- First, create a debug function to test auth.uid()
CREATE OR REPLACE FUNCTION public.debug_auth_uid()
RETURNS TABLE(
  auth_uid uuid,
  current_user_name text,
  session_user_name text,
  has_jwt boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as auth_uid,
    current_user as current_user_name,
    session_user as session_user_name,
    (current_setting('request.jwt.claims', true) IS NOT NULL) as has_jwt;
$$;

-- Update RLS policies to use authenticated role instead of public
-- Fix companies table policy
DROP POLICY IF EXISTS "Users can view companies they are members of" ON public.companies;
CREATE POLICY "Users can view companies they are members of" 
ON public.companies FOR SELECT 
TO authenticated
USING (
  -- Allow authenticated users to see their companies
  is_member_of(id) OR 
  -- Allow super admins to see all companies
  can_access_all_data()
);

-- Fix company_users policies to ensure consistent user_id format
DROP POLICY IF EXISTS "Users can view company members of their companies" ON public.company_users;
CREATE POLICY "Users can view company members of their companies" 
ON public.company_users FOR SELECT 
TO authenticated
USING (
  -- User can see their own record or records of companies they're members of
  (user_id = (auth.uid())::text) OR 
  (is_member_of(company_id)) OR
  (can_access_all_data())
);

-- Update is_member_of function to be more robust
CREATE OR REPLACE FUNCTION public.is_member_of(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return false if user is not authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check membership using both UUID and email formats for compatibility
  RETURN EXISTS (
    SELECT 1
    FROM public.company_users cu
    WHERE cu.company_id = is_member_of.company_id 
    AND (
      cu.user_id = (auth.uid())::text OR
      cu.user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
END;
$$;