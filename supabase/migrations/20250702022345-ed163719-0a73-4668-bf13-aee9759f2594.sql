-- Add role column to technicians table for UI display
ALTER TABLE public.technicians 
ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'technician';

-- Create function to update technician role
CREATE OR REPLACE FUNCTION public.update_technician_role(
  p_technician_id uuid,
  p_new_role text,
  p_is_admin boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the technician's role in the technicians table
  UPDATE public.technicians 
  SET user_role = p_new_role 
  WHERE id = p_technician_id;
  
  -- Insert or update in company_users table using email as user identifier
  INSERT INTO public.company_users (user_id, company_id, role, is_admin)
  SELECT 
    t.email,  -- Use email as string identifier instead of UUID
    t.company_id,
    p_new_role,
    p_is_admin
  FROM public.technicians t
  WHERE t.id = p_technician_id
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin;
END;
$$;

-- Create function to get technician with role info
CREATE OR REPLACE FUNCTION public.get_technicians_with_roles()
RETURNS TABLE(
  id uuid,
  "firstName" varchar,
  "lastName" varchar,
  email varchar,
  phone varchar,
  specialization varchar,
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
  LEFT JOIN public.company_users cu ON cu.user_id = t.email
  ORDER BY t."firstName";
END;
$$;