-- Create is_super_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'edward@shogunaillc.com'
  );
$$;

-- Create function to check if user can switch companies
CREATE OR REPLACE FUNCTION public.can_switch_companies()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin();
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.can_switch_companies() IS 'Returns true only if the current user is a super admin and can switch between companies';