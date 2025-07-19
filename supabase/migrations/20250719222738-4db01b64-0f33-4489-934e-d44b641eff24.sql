
-- Fix the locations INSERT policy to allow super admin bypass
DROP POLICY IF EXISTS "Users can insert locations for their organization" ON public.locations;

CREATE POLICY "Users can insert locations for their organization" 
ON public.locations 
FOR INSERT 
WITH CHECK (
  -- Allow super admins to insert regardless of company_id
  is_super_admin() OR 
  -- Regular users must be authenticated and provide company_id
  (auth.uid() IS NOT NULL AND company_id IS NOT NULL)
);
