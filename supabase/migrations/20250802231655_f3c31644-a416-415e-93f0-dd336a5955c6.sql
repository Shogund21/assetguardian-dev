-- Update get_current_user_company function to handle both UUID and email formats
CREATE OR REPLACE FUNCTION public.get_current_user_company()
RETURNS TABLE(company_id uuid, company_name text, user_role text, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
     OR cu.user_id = (
       SELECT email 
       FROM auth.users 
       WHERE id = auth.uid()
       LIMIT 1
     )
  LIMIT 1;
END;
$function$;