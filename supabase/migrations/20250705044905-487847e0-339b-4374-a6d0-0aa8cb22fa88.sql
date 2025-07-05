-- Fix ambiguous column reference issues in database functions

-- Fix the is_member_of function with proper parameter naming
DROP FUNCTION IF EXISTS public.is_member_of(uuid);

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
    AND (cu.user_id = (auth.uid())::text OR cu.user_id = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
END;
$$;

-- Update get_current_user_company function to avoid any ambiguity
CREATE OR REPLACE FUNCTION public.get_current_user_company()
RETURNS TABLE(company_id uuid, company_name text, user_role text, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try with UUID as string
  RETURN QUERY
  SELECT 
    cu.company_id,
    c.name as company_name,
    cu.role as user_role,
    cu.is_admin
  FROM public.company_users cu
  JOIN public.companies c ON c.id = cu.company_id
  WHERE cu.user_id = (auth.uid())::text
  LIMIT 1;
  
  -- If no results, try with email
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      cu.company_id,
      c.name as company_name,
      cu.role as user_role,
      cu.is_admin
    FROM public.company_users cu
    JOIN public.companies c ON c.id = cu.company_id
    WHERE cu.user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1;
  END IF;
END;
$$;

-- Update companies RLS policy to be more explicit
DROP POLICY IF EXISTS "Users can view companies they are members of" ON public.companies;
CREATE POLICY "Users can view companies they are members of" 
ON public.companies FOR SELECT 
USING (
  -- Allow unauthenticated users to see companies (for landing page)
  auth.uid() IS NULL OR 
  -- Allow authenticated users to see their companies
  public.is_member_of(companies.id) OR 
  -- Allow super admins to see all companies
  public.can_access_all_data()
);