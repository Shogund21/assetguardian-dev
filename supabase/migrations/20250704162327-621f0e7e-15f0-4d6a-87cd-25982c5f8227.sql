-- Drop and recreate the function with proper return type
DROP FUNCTION IF EXISTS public.get_technicians_with_roles();

CREATE FUNCTION public.get_technicians_with_roles()
RETURNS TABLE(
  id uuid, 
  "firstName" character varying, 
  "lastName" character varying, 
  email character varying, 
  phone character varying, 
  specialization character varying, 
  company_id uuid, 
  user_role text, 
  is_admin boolean,
  company_name text,
  status character varying,
  "isAvailable" boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t."firstName",
    t."lastName", 
    t.email,
    t.phone,
    t.specialization,
    t.company_id,
    COALESCE(t.user_role, 'technician') as user_role,
    COALESCE(cu.is_admin, false) as is_admin,
    t.company_name,
    COALESCE(t.status, 'active') as status,
    COALESCE(t."isAvailable", true) as "isAvailable"
  FROM public.technicians t
  LEFT JOIN public.company_users cu ON cu.user_id = t.email AND cu.company_id = t.company_id
  ORDER BY t."firstName";
END;
$$;