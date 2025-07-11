-- Phase 1: Production-Ready RLS & RPC Fix (Revised)
-- Drop conflicting policies first
DROP POLICY IF EXISTS "Enable read access for users" ON auth.users;
DROP POLICY IF EXISTS "Users can view own profile" ON auth.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON auth.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON auth.users;

-- Ensure RLS is enabled on all relevant tables
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hvac_maintenance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update is_member_of function for better security (use CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.is_member_of(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Return false if user is not authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check membership using both UUID and email formats for compatibility
  RETURN EXISTS (
    SELECT 1
    FROM public.company_users cu
    WHERE cu.company_id = is_member_of.company_id 
    AND (
      cu.user_id = (auth.uid())::text OR
      cu.user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
END;
$$;

-- Re-grant EXECUTE permissions
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_all_data() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_member_of(uuid) TO authenticated, service_role;

-- Create get_recent_activities RPC function
CREATE OR REPLACE FUNCTION public.get_recent_activities()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  timestamp_val timestamp with time zone,
  type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH combined_activities AS (
    -- Recent maintenance checks
    SELECT 
      hmc.id,
      ('Maintenance: ' || COALESCE(e.name, 'Unknown Equipment')) as title,
      CASE 
        WHEN hmc.status = 'completed' THEN 'Maintenance completed successfully'
        WHEN hmc.status = 'pending' THEN 'Maintenance scheduled'
        ELSE 'Maintenance check in progress'
      END as description,
      hmc.check_date as timestamp_val,
      'maintenance' as type
    FROM public.hvac_maintenance_checks hmc
    LEFT JOIN public.equipment e ON e.id = hmc.equipment_id
    WHERE (
      public.can_access_all_data() OR 
      (hmc.company_id IS NOT NULL AND public.is_member_of(hmc.company_id))
    )
    AND hmc.check_date IS NOT NULL
    
    UNION ALL
    
    -- Recent project updates
    SELECT 
      p.id,
      ('Project: ' || p.name) as title,
      CASE 
        WHEN LOWER(p.status) = 'completed' THEN 'Project completed'
        WHEN LOWER(p.status) IN ('in_progress', 'in progress', 'ongoing') THEN 'Project in progress'
        ELSE 'Project ' || LOWER(p.status)
      END as description,
      COALESCE(p.updatedat, p.createdat) as timestamp_val,
      'project' as type
    FROM public.projects p
    WHERE (
      public.can_access_all_data() OR 
      (p.company_id IS NOT NULL AND public.is_member_of(p.company_id))
    )
    AND COALESCE(p.updatedat, p.createdat) IS NOT NULL
  )
  SELECT 
    ca.id,
    ca.title,
    ca.description,
    ca.timestamp_val,
    ca.type
  FROM combined_activities ca
  ORDER BY ca.timestamp_val DESC
  LIMIT 10;
END;
$$;

-- Create set_project_status RPC function
CREATE OR REPLACE FUNCTION public.set_project_status(p_project_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    project_company_id uuid;
BEGIN
    -- Get project's company ID
    SELECT company_id INTO project_company_id
    FROM public.projects
    WHERE id = p_project_id;
    
    IF project_company_id IS NULL THEN
        RAISE EXCEPTION 'Project not found';
    END IF;
    
    -- Check if user has access (super admin or member of company)
    IF NOT (public.can_access_all_data() OR public.is_member_of(project_company_id)) THEN
        RAISE EXCEPTION 'Access denied: user not authorized for this project';
    END IF;
    
    -- Update project status
    UPDATE public.projects
    SET status = p_status,
        updatedat = now()
    WHERE id = p_project_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Project update failed';
    END IF;
END;
$$;

-- Grant EXECUTE on new RPC functions
GRANT EXECUTE ON FUNCTION public.get_recent_activities() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_project_status(uuid, text) TO authenticated, service_role;

-- Add UPDATE policies with WITH CHECK clauses (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Equipment: Company member update" ON public.equipment;
CREATE POLICY "Equipment: Company member update" ON public.equipment
FOR UPDATE TO authenticated
USING (public.can_access_all_data() OR (company_id IS NOT NULL AND public.is_member_of(company_id)))
WITH CHECK (public.can_access_all_data() OR (company_id IS NOT NULL AND public.is_member_of(company_id)));

DROP POLICY IF EXISTS "Projects: Company member update" ON public.projects;
CREATE POLICY "Projects: Company member update" ON public.projects
FOR UPDATE TO authenticated
USING (public.can_access_all_data() OR (company_id IS NOT NULL AND public.is_member_of(company_id)))
WITH CHECK (public.can_access_all_data() OR (company_id IS NOT NULL AND public.is_member_of(company_id)));

-- Add auth.users SELECT policy
CREATE POLICY "Users can view user data" ON auth.users
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.can_access_all_data()
);