-- Fix the update_technician_role function to work properly
DROP FUNCTION IF EXISTS public.update_technician_role(uuid, text, boolean);

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
    t.email,  -- Use email as string identifier
    t.company_id,
    p_new_role,
    p_is_admin
  FROM public.technicians t
  WHERE t.id = p_technician_id
  ON CONFLICT (user_id, company_id) DO UPDATE SET
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin;
END;
$$;