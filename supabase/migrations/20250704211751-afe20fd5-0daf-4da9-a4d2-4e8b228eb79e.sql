-- Phase 1: Fix RLS Policies for Strict Data Isolation
-- Step 1.1: Remove overly permissive policies and create strict company-scoped access

-- Drop overly permissive policies on equipment
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.equipment;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.equipment;

-- Drop overly permissive policies on technicians  
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.technicians;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.technicians;

-- Drop overly permissive policies on hvac_maintenance_checks
DROP POLICY IF EXISTS "Enable all access for all users" ON public.hvac_maintenance_checks;

-- Drop overly permissive policies on projects
DROP POLICY IF EXISTS "Enable all access for all users" ON public.projects;

-- Drop overly permissive policies on maintenance_documents
DROP POLICY IF EXISTS "Enable all access for all users" ON public.maintenance_documents;

-- Step 1.2: Enhance super admin function for comprehensive access
CREATE OR REPLACE FUNCTION public.can_access_all_data()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT public.is_super_admin();
$$;

-- Step 1.3: Create strict company-scoped RLS policies

-- Equipment policies - strict company access + super admin override
CREATE POLICY "Company users can view their equipment" 
ON public.equipment 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Company admins can manage their equipment" 
ON public.equipment 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = equipment.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = equipment.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
);

-- Technicians policies - strict company access + super admin override
CREATE POLICY "Company users can view their technicians" 
ON public.technicians 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Company admins can manage their technicians" 
ON public.technicians 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = technicians.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = technicians.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
);

-- HVAC Maintenance Checks policies - strict company access + super admin override
CREATE POLICY "Company users can view their maintenance checks" 
ON public.hvac_maintenance_checks 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Company users can manage their maintenance checks" 
ON public.hvac_maintenance_checks 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

-- Projects policies - strict company access + super admin override  
CREATE POLICY "Company users can view their projects" 
ON public.projects 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Company admins can manage their projects" 
ON public.projects 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = projects.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.company_id = projects.company_id 
    AND cu.user_id = (auth.uid())::text 
    AND cu.is_admin = true
  ))
);

-- Maintenance Documents policies - strict company access + super admin override
CREATE POLICY "Company users can view their maintenance documents" 
ON public.maintenance_documents 
FOR SELECT 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Company users can manage their maintenance documents" 
ON public.maintenance_documents 
FOR ALL 
USING (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
)
WITH CHECK (
  public.can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);