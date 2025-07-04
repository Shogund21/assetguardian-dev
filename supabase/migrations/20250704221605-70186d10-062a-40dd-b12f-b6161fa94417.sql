-- Phase 1: Fix authentication issues for production deployment
-- This migration handles the transition from email-based to UUID-based user IDs

-- Update RLS policies to properly handle both email and UUID user identifiers
DROP POLICY IF EXISTS "Company users can view their own record" ON public.company_users;
CREATE POLICY "Company users can view their own record" 
ON public.company_users FOR SELECT 
USING (
  user_id = auth.uid()::text OR 
  user_id = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  user_id = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Update the get_current_user_company function to handle both scenarios
CREATE OR REPLACE FUNCTION public.get_current_user_company()
RETURNS TABLE(
  company_id UUID,
  company_name TEXT,
  user_role TEXT,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try with UUID
  RETURN QUERY
  SELECT 
    cu.company_id,
    c.name as company_name,
    cu.role as user_role,
    cu.is_admin
  FROM public.company_users cu
  JOIN public.companies c ON c.id = cu.company_id
  WHERE cu.user_id = auth.uid()::text
  LIMIT 1;
  
  -- If no results, try with email
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      cu.company_id,
      c.name as company_name,
      cu.role as user_role,
      cu.is_admin
    FROM public.company_users cu
    JOIN public.companies c ON c.id = cu.company_id
    WHERE cu.user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1;
  END IF;
END;
$$;

-- Create a function to migrate user from email to UUID
CREATE OR REPLACE FUNCTION public.migrate_user_to_uuid(p_email text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update company_users table
  UPDATE public.company_users 
  SET user_id = p_user_id::text 
  WHERE user_id = p_email;
  
  -- Update technicians table if user_id exists
  UPDATE public.technicians 
  SET user_id = p_user_id
  WHERE email = p_email AND user_id IS NULL;
END;
$$;

-- Ensure the super admin exists in the system
INSERT INTO public.company_users (user_id, company_id, role, is_admin)
SELECT 
  'edward@shogunai.com', 
  (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1), 
  'super_admin', 
  true
ON CONFLICT (user_id, company_id) DO UPDATE SET
  is_admin = true,
  role = 'super_admin';

-- Update the handle_new_user function to automatically migrate existing users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  
  -- Migrate existing user data
  PERFORM public.migrate_user_to_uuid(new.email, new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;