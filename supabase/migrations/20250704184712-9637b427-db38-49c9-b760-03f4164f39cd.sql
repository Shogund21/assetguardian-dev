-- Create Shogunai company and ensure edward@shogunai.com has master permissions

-- First, create the Shogunai company
INSERT INTO public.companies (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, 
  'Shogunai', 
  now(), 
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = 'Shogunai',
  updated_at = now();

-- Ensure edward@shogunai.com is properly linked to Shogunai company with full admin privileges
INSERT INTO public.company_users (user_id, company_id, role, is_admin, created_at)
VALUES (
  'edward@shogunai.com', 
  '00000000-0000-0000-0000-000000000001'::uuid, 
  'super_admin', 
  true, 
  now()
)
ON CONFLICT (user_id, company_id) DO UPDATE SET
  role = 'super_admin',
  is_admin = true;

-- Create a super admin function that gives edward@shogunai.com master access
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    (auth.uid())::text = 'edward@shogunai.com' OR
    EXISTS (
      SELECT 1 
      FROM public.company_users cu
      WHERE cu.user_id = 'edward@shogunai.com'
      AND cu.is_admin = true
      AND cu.role = 'super_admin'
    );
$$;

-- Update the admin check function to include super admin check
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    public.is_super_admin() OR
    EXISTS (
      SELECT 1 
      FROM public.company_users cu
      WHERE cu.user_id = (auth.uid())::text 
      AND cu.is_admin = true
    );
$$;