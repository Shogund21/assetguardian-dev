-- Phase 4: Complete RLS Policy Cleanup and Consolidation
-- Fix all "ambiguous column reference" errors by removing duplicate policies

-- Step 1: Drop ALL existing conflicting RLS policies on affected tables

-- Equipment table - drop all existing policies
DROP POLICY IF EXISTS "Company users can view their equipment" ON public.equipment;
DROP POLICY IF EXISTS "Company admins can manage their equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can view equipment of their companies" ON public.equipment;
DROP POLICY IF EXISTS "Company admins can manage equipment" ON public.equipment;

-- Projects table - drop all existing policies  
DROP POLICY IF EXISTS "Company users can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Company admins can manage their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects of their companies" ON public.projects;
DROP POLICY IF EXISTS "Company admins can manage projects" ON public.projects;

-- HVAC Maintenance Checks table - drop all existing policies
DROP POLICY IF EXISTS "Company users can view their maintenance checks" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Company users can manage their maintenance checks" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Users can view maintenance checks of their companies" ON public.hvac_maintenance_checks;

-- Technicians table - drop all existing policies
DROP POLICY IF EXISTS "Company users can view their technicians" ON public.technicians;
DROP POLICY IF EXISTS "Company admins can manage their technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can view technicians of their companies" ON public.technicians;

-- Maintenance Documents table - drop all existing policies
DROP POLICY IF EXISTS "Company users can view their maintenance documents" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Company users can manage their maintenance documents" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Users can view documents of their companies" ON public.maintenance_documents;

-- Companies table - drop conflicting policies (keep basic ones)
DROP POLICY IF EXISTS "Allow all authenticated operations on companies" ON public.companies;

-- Step 2: Create single, clean policies for each table with explicit table aliases

-- Equipment policies - ONE SELECT, ONE ALL policy
CREATE POLICY "Equipment: Company users can view" 
ON public.equipment 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (equipment.company_id IS NOT NULL AND is_member_of(equipment.company_id))
);

CREATE POLICY "Equipment: Company admins can manage" 
ON public.equipment 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (equipment.company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = equipment.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (equipment.company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = equipment.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
);

-- Projects policies - ONE SELECT, ONE ALL policy
CREATE POLICY "Projects: Company users can view" 
ON public.projects 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (projects.company_id IS NOT NULL AND is_member_of(projects.company_id))
);

CREATE POLICY "Projects: Company admins can manage" 
ON public.projects 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (projects.company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = projects.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (projects.company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = projects.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
);

-- HVAC Maintenance Checks policies - ONE SELECT, ONE ALL policy
CREATE POLICY "Maintenance: Company users can view" 
ON public.hvac_maintenance_checks 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (hvac_maintenance_checks.company_id IS NOT NULL AND is_member_of(hvac_maintenance_checks.company_id))
);

CREATE POLICY "Maintenance: Company users can manage" 
ON public.hvac_maintenance_checks 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (hvac_maintenance_checks.company_id IS NOT NULL AND is_member_of(hvac_maintenance_checks.company_id))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (hvac_maintenance_checks.company_id IS NOT NULL AND is_member_of(hvac_maintenance_checks.company_id))
);

-- Technicians policies - ONE SELECT, ONE ALL policy
CREATE POLICY "Technicians: Company users can view" 
ON public.technicians 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (technicians.company_id IS NOT NULL AND is_member_of(technicians.company_id))
);

CREATE POLICY "Technicians: Company admins can manage" 
ON public.technicians 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (technicians.company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = technicians.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (technicians.company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = technicians.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
);

-- Maintenance Documents policies - ONE SELECT, ONE ALL policy
CREATE POLICY "Documents: Company users can view" 
ON public.maintenance_documents 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (maintenance_documents.company_id IS NOT NULL AND is_member_of(maintenance_documents.company_id))
);

CREATE POLICY "Documents: Company users can manage" 
ON public.maintenance_documents 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (maintenance_documents.company_id IS NOT NULL AND is_member_of(maintenance_documents.company_id))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (maintenance_documents.company_id IS NOT NULL AND is_member_of(maintenance_documents.company_id))
);

-- Step 3: Verify existing policies are still intact for locations, filter_changes, etc.
-- These should already be working correctly

COMMENT ON POLICY "Equipment: Company users can view" ON public.equipment IS 
'Single SELECT policy - company users can view equipment from their company, super admin can view all';

COMMENT ON POLICY "Equipment: Company admins can manage" ON public.equipment IS 
'Single ALL policy - company admins can manage equipment in their company, super admin can manage all';

-- Add similar comments for other policies for documentation