-- Fix RLS Policies: Replace problematic database functions with direct JWT claim checks
-- This resolves "permission denied for table users" errors by avoiding direct auth.users queries

-- Equipment table: Replace problematic policies with JWT-based super admin check
DROP POLICY IF EXISTS "Equipment: Company users can view" ON public.equipment;
DROP POLICY IF EXISTS "Equipment: Company admins can manage" ON public.equipment;

-- Create super-admin policy for equipment (unrestricted access)
CREATE POLICY "Equipment: Super admin can view all" 
ON public.equipment 
FOR SELECT 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Equipment: Super admin can manage all" 
ON public.equipment 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

-- Create company-scoped policy for equipment (regular users)
CREATE POLICY "Equipment: Company users can view their data" 
ON public.equipment 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Equipment: Company admins can manage their data" 
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

-- Projects table: Replace problematic policies
DROP POLICY IF EXISTS "Projects: Company users can view" ON public.projects;
DROP POLICY IF EXISTS "Projects: Company admins can manage" ON public.projects;

-- Create super-admin policy for projects
CREATE POLICY "Projects: Super admin can view all" 
ON public.projects 
FOR SELECT 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Projects: Super admin can manage all" 
ON public.projects 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

-- Create company-scoped policy for projects
CREATE POLICY "Projects: Company users can view their data" 
ON public.projects 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Projects: Company admins can manage their data" 
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

-- Maintenance checks table: Replace problematic policies  
DROP POLICY IF EXISTS "Maintenance: Company users can view" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Company users can manage" ON public.hvac_maintenance_checks;

-- Create super-admin policy for maintenance checks
CREATE POLICY "Maintenance: Super admin can view all" 
ON public.hvac_maintenance_checks 
FOR SELECT 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Maintenance: Super admin can manage all" 
ON public.hvac_maintenance_checks 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

-- Create company-scoped policy for maintenance checks
CREATE POLICY "Maintenance: Company users can view their data" 
ON public.hvac_maintenance_checks 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Maintenance: Company users can manage their data" 
ON public.hvac_maintenance_checks 
FOR ALL 
USING (company_id IS NOT NULL AND is_member_of(company_id))
WITH CHECK (company_id IS NOT NULL AND is_member_of(company_id));

-- Technicians table: Replace problematic policies
DROP POLICY IF EXISTS "Technicians: Company users can view" ON public.technicians;
DROP POLICY IF EXISTS "Technicians: Company admins can manage" ON public.technicians;

-- Create super-admin policy for technicians
CREATE POLICY "Technicians: Super admin can view all" 
ON public.technicians 
FOR SELECT 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Technicians: Super admin can manage all" 
ON public.technicians 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

-- Create company-scoped policy for technicians
CREATE POLICY "Technicians: Company users can view their data" 
ON public.technicians 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Technicians: Company admins can manage their data" 
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

-- Maintenance documents table: Replace problematic policies
DROP POLICY IF EXISTS "Documents: Company users can view" ON public.maintenance_documents;
DROP POLICY IF EXISTS "Documents: Company users can manage" ON public.maintenance_documents;

-- Create super-admin policy for maintenance documents
CREATE POLICY "Documents: Super admin can view all" 
ON public.maintenance_documents 
FOR SELECT 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

CREATE POLICY "Documents: Super admin can manage all" 
ON public.maintenance_documents 
FOR ALL 
USING ((auth.jwt() ->> 'isSuperAdmin')::boolean = true)
WITH CHECK ((auth.jwt() ->> 'isSuperAdmin')::boolean = true);

-- Create company-scoped policy for maintenance documents
CREATE POLICY "Documents: Company users can view their data" 
ON public.maintenance_documents 
FOR SELECT 
USING (company_id IS NOT NULL AND is_member_of(company_id));

CREATE POLICY "Documents: Company users can manage their data" 
ON public.maintenance_documents 
FOR ALL 
USING (company_id IS NOT NULL AND is_member_of(company_id))
WITH CHECK (company_id IS NOT NULL AND is_member_of(company_id));