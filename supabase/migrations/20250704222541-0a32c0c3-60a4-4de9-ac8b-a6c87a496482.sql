-- Fix authentication and company loading issues
-- This addresses the ambiguous column reference and RLS policy conflicts

-- Fix the is_member_of function to resolve ambiguous company_id reference
CREATE OR REPLACE FUNCTION public.is_member_of(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return false if user is not authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.company_users cu
    WHERE cu.company_id = target_company_id 
    AND (cu.user_id = auth.uid()::text OR cu.user_id = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
END;
$$;

-- Update companies RLS policy to allow unauthenticated users to see basic company info for landing page
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

-- Update company_users policies to be more robust
DROP POLICY IF EXISTS "Users can view company members of their companies" ON public.company_users;
CREATE POLICY "Users can view company members of their companies" 
ON public.company_users FOR SELECT 
USING (
  -- Only authenticated users can view company_users
  auth.uid() IS NOT NULL AND (
    is_member_of(company_id) OR 
    can_access_all_data()
  )
);