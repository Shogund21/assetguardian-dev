-- Change company_users.user_id from UUID to TEXT to properly store emails
-- Need to handle RLS policy dependencies first

-- Drop policies that depend on the user_id column
DROP POLICY IF EXISTS "Company admins can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "Company admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view company members of their companies" ON public.company_users;

-- Drop the foreign key constraint if it exists
ALTER TABLE public.company_users DROP CONSTRAINT IF EXISTS company_users_user_id_fkey;

-- Change the column type from UUID to TEXT
ALTER TABLE public.company_users 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Recreate the RLS policies with the updated column type
CREATE POLICY "Users can view company members of their companies" 
ON public.company_users 
FOR SELECT 
USING (is_member_of(company_id));

CREATE POLICY "Company admins can manage equipment" 
ON public.equipment 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM company_users
    WHERE company_users.company_id = equipment.company_id 
    AND company_users.user_id = auth.uid()::TEXT  -- Cast auth.uid() to TEXT now
    AND company_users.is_admin = true
  )
);

CREATE POLICY "Company admins can manage projects" 
ON public.projects 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM company_users
    WHERE company_users.company_id = projects.company_id 
    AND company_users.user_id = auth.uid()::TEXT  -- Cast auth.uid() to TEXT now
    AND company_users.is_admin = true
  )
);

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