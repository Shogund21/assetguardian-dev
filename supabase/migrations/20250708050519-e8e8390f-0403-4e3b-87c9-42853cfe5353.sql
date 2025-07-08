-- Complete Fix for Company Selector & Empty Data Bug
-- Phase 1: Clean up super admin company associations and fix RLS policies

-- Remove any conflicting company_users records for super admin to prevent auth conflicts
DELETE FROM public.company_users 
WHERE user_id = 'edward@shogunaillc.com';

-- Super admin access will be handled via is_super_admin() function instead of company_users table

-- Phase 2: Fix RLS policies to properly handle super admin access
-- Update equipment SELECT policy to include super admin bypass
DROP POLICY IF EXISTS "Equipment: Company users can view" ON public.equipment;
CREATE POLICY "Equipment: Company users can view" 
ON public.equipment 
FOR SELECT 
USING (
  can_access_all_data() OR 
  ((company_id IS NOT NULL) AND is_member_of(company_id))
);

-- Update hvac_maintenance_checks SELECT policy 
DROP POLICY IF EXISTS "Maintenance: Company users can view" ON public.hvac_maintenance_checks;
CREATE POLICY "Maintenance: Company users can view" 
ON public.hvac_maintenance_checks 
FOR SELECT 
USING (
  can_access_all_data() OR 
  ((company_id IS NOT NULL) AND is_member_of(company_id))
);

-- Update projects SELECT policy
DROP POLICY IF EXISTS "Projects: Company users can view" ON public.projects;
CREATE POLICY "Projects: Company users can view" 
ON public.projects 
FOR SELECT 
USING (
  can_access_all_data() OR 
  ((company_id IS NOT NULL) AND is_member_of(company_id))
);

-- Update technicians SELECT policy
DROP POLICY IF EXISTS "Technicians: Company users can view" ON public.technicians;
CREATE POLICY "Technicians: Company users can view" 
ON public.technicians 
FOR SELECT 
USING (
  can_access_all_data() OR 
  ((company_id IS NOT NULL) AND is_member_of(company_id))
);