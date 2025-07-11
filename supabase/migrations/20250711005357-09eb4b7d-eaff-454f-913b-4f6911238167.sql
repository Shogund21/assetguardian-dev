-- Fix "permission denied for table users" error
-- Grant SELECT permissions on auth.users to functions that need it

-- Grant SELECT on auth.users to authenticated users (needed for RPC functions)
GRANT SELECT ON auth.users TO authenticated;

-- Update is_member_of function to handle auth.users access properly
CREATE OR REPLACE FUNCTION public.is_member_of(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
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
      cu.user_id = (
        SELECT email 
        FROM auth.users 
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );
END;
$function$;

-- Update is_super_admin function to handle auth.users access properly
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Check if the current user is the super admin by UUID or email
  RETURN (
    -- Check by UUID - if the user is authenticated and their email is super admin
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'edward@shogunaillc.com'
      LIMIT 1
    )) OR
    -- Check by email in company_users table for backwards compatibility
    EXISTS (
      SELECT 1 FROM public.company_users cu 
      WHERE cu.user_id = 'edward@shogunaillc.com'
      AND cu.role = 'super_admin'
      LIMIT 1
    )
  );
END;
$function$;

-- Update can_access_all_data function
CREATE OR REPLACE FUNCTION public.can_access_all_data()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT public.is_super_admin();
$function$;

-- Update is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT 
    public.is_super_admin() OR
    EXISTS (
      SELECT 1 
      FROM public.company_users cu
      WHERE cu.user_id = (auth.uid())::text 
      AND cu.is_admin = true
      LIMIT 1
    );
$function$;

-- Ensure all functions have proper execute permissions
GRANT EXECUTE ON FUNCTION public.is_member_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_all_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;