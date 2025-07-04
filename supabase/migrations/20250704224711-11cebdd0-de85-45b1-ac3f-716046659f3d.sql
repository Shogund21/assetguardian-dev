-- Update edward@shogunai.com to edward@shogunaillc.com across the system

-- Update company_users table
UPDATE public.company_users 
SET user_id = 'edward@shogunaillc.com'
WHERE user_id = 'edward@shogunai.com';

-- Update the super admin function to use new email
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    (auth.uid())::text = 'edward@shogunaillc.com' OR
    EXISTS (
      SELECT 1 
      FROM public.company_users cu
      WHERE cu.user_id = 'edward@shogunaillc.com'
      AND cu.is_admin = true
      AND cu.role = 'super_admin'
    );
$$;