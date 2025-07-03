-- Change company_users.user_id from UUID to TEXT to properly store emails
-- This is a safer long-term solution

-- First, drop the foreign key constraint if it exists
ALTER TABLE public.company_users DROP CONSTRAINT IF EXISTS company_users_user_id_fkey;

-- Change the column type from UUID to TEXT
ALTER TABLE public.company_users 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Update the get_technicians_with_roles function to work without casting
CREATE OR REPLACE FUNCTION public.get_technicians_with_roles()
RETURNS TABLE(
  id uuid, 
  "firstName" character varying, 
  "lastName" character varying, 
  email character varying, 
  phone character varying, 
  specialization character varying, 
  company_id uuid, 
  user_role text, 
  is_admin boolean
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
    COALESCE(cu.is_admin, false) as is_admin
  FROM public.technicians t
  LEFT JOIN public.company_users cu ON cu.user_id = t.email  -- No casting needed now
  ORDER BY t."firstName";
END;
$$;