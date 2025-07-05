-- Fix permission denied errors by removing auth.users table access

-- Update the is_member_of function to avoid accessing auth.users table
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
  
  RETURN EXISTS (
    SELECT 1
    FROM public.company_users cu
    WHERE cu.company_id = is_member_of.company_id 
    AND cu.user_id = (auth.uid())::text
  );
END;
$$;

-- Update get_current_user_company function to avoid auth.users access
CREATE OR REPLACE FUNCTION public.get_current_user_company()
RETURNS TABLE(company_id uuid, company_name text, user_role text, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
END;
$$;