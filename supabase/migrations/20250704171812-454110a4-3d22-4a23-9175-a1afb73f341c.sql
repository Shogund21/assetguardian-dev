-- Fix audit logs RLS policy to avoid column ambiguity issues

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

-- Create a security definer function to check admin status
-- This avoids RLS recursion and column ambiguity issues
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.company_users cu
    WHERE cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  );
$$;

-- Create a new, cleaner RLS policy using the security definer function
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (public.is_current_user_admin());

-- Also ensure the system can still insert audit logs
-- Recreate the insert policy to be explicit
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);