-- Update equipment RLS policies to use consistent super admin detection
-- Drop the existing JWT-based super admin policy
DROP POLICY IF EXISTS "Equipment: Super admin access" ON public.equipment;

-- Create new super admin policy using the function-based approach
CREATE POLICY "Equipment: Super admin access" 
ON public.equipment 
FOR ALL 
USING (can_access_all_data())
WITH CHECK (can_access_all_data());