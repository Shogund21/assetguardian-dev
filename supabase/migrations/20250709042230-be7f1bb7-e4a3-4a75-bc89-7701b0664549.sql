-- Fix RLS Policies: Replace problematic database functions with direct JWT claim checks
-- This resolves "permission denied for table users" errors by avoiding direct auth.users queries

-- Equipment table: Drop ALL existing policies and recreate them properly
DROP POLICY IF EXISTS "Equipment: Company users can view their data" ON public.equipment;
DROP POLICY IF EXISTS "Equipment: Company admins can manage their data" ON public.equipment;
DROP POLICY IF EXISTS "Equipment: Super admin can view all" ON public.equipment;
DROP POLICY IF EXISTS "Equipment: Super admin can manage all" ON public.equipment;
DROP POLICY IF EXISTS "Equipment: Company users can view" ON public.equipment;
DROP POLICY IF EXISTS "Equipment: Company admins can manage" ON public.equipment;

-- Create new equipment policies
CREATE POLICY "Equipment: Super admin access" 
ON public.equipment 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Equipment: Company member access" 
ON public.equipment 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Equipment: Company admin manage" 
ON public.equipment 
FOR ALL 
USING (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = equipment.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  )
)
WITH CHECK (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = equipment.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  )
);

-- Projects table: Drop ALL existing policies and recreate them
DROP POLICY IF EXISTS "Projects: Company users can view their data" ON public.projects;
DROP POLICY IF EXISTS "Projects: Company admins can manage their data" ON public.projects;
DROP POLICY IF EXISTS "Projects: Super admin can view all" ON public.projects;
DROP POLICY IF EXISTS "Projects: Super admin can manage all" ON public.projects;
DROP POLICY IF EXISTS "Projects: Company users can view" ON public.projects;
DROP POLICY IF EXISTS "Projects: Company admins can manage" ON public.projects;

-- Create new projects policies
CREATE POLICY "Projects: Super admin access" 
ON public.projects 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Projects: Company member access" 
ON public.projects 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Projects: Company admin manage" 
ON public.projects 
FOR ALL 
USING (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = projects.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  )
)
WITH CHECK (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = projects.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  )
);

-- Maintenance checks table: Drop ALL existing policies and recreate them
DROP POLICY IF EXISTS "Maintenance: Company users can view their data" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Company users can manage their data" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Super admin can view all" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Super admin can manage all" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Company users can view" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Company users can manage" ON public.hvac_maintenance_checks;

-- Create new maintenance policies
CREATE POLICY "Maintenance: Super admin access" 
ON public.hvac_maintenance_checks 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Maintenance: Company member access" 
ON public.hvac_maintenance_checks 
FOR ALL 
USING (company_id IS NOT NULL AND is_member_of(company_id))
WITH CHECK (company_id IS NOT NULL AND is_member_of(company_id));

-- Technicians table: Drop ALL existing policies and recreate them
DROP POLICY IF EXISTS "Technicians: Company users can view their data" ON public.technicians;
DROP POLICY IF EXISTS "Technicians: Company admins can manage their data" ON public.technicians;
DROP POLICY IF EXISTS "Technicians: Super admin can view all" ON public.technicians;
DROP POLICY IF EXISTS "Technicians: Super admin can manage all" ON public.technicians;
DROP POLICY IF EXISTS "Technicians: Company users can view" ON public.technicians;
DROP POLICY IF EXISTS "Technicians: Company admins can manage" ON public.technicians;

-- Create new technicians policies
CREATE POLICY "Technicians: Super admin access" 
ON public.technicians 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Technicians: Company member access" 
ON public.technicians 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Technicians: Company admin manage" 
ON public.technicians 
FOR ALL 
USING (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = technicians.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  )
)
WITH CHECK (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = technicians.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  )
);

-- Maintenance documents table: Drop ALL existing policies and recreate them
DROP POLICY IF EXISTS "Documents: Company users can view their data" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Documents: Company users can manage their data" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Documents: Super admin can view all" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Documents: Super admin can manage all" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Documents: Company users can view" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Documents: Company users can manage" ON public.maintenance_documents;

-- Create new documents policies
CREATE POLICY "Documents: Super admin access" 
ON public.maintenance_documents 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Documents: Company member access" 
ON public.maintenance_documents 
FOR ALL 
USING (company_id IS NOT NULL AND is_member_of(company_id))
WITH CHECK (company_id IS NOT NULL AND is_member_of(company_id));