-- Fix database functions while keeping original parameter names

-- Update the is_member_of function with original parameter name
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
    AND (cu.user_id = (auth.uid())::text OR cu.user_id = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
END;
$$;