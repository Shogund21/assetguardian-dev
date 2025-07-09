-- Create dashboard_payload function for enhanced stats
CREATE OR REPLACE FUNCTION public.dashboard_payload()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_company_id uuid;
    is_super_admin_user boolean;
    equipment_count integer := 0;
    project_count integer := 0;
    active_projects_count integer := 0;
    maintenance_count integer := 0;
    pending_tasks_count integer := 0;
    technician_count integer := 0;
BEGIN
    -- Check if user is super admin
    is_super_admin_user := public.is_super_admin();
    
    -- Get user's company ID if not super admin
    IF NOT is_super_admin_user THEN
        SELECT cu.company_id INTO user_company_id
        FROM public.company_users cu
        WHERE cu.user_id = auth.uid()::text
        LIMIT 1;
        
        -- If no company found, return empty counts
        IF user_company_id IS NULL THEN
            RETURN jsonb_build_object(
                'equipment_count', 0,
                'project_count', 0,
                'active_projects_count', 0,
                'maintenance_count', 0,
                'pending_tasks_count', 0,
                'technician_count', 0
            );
        END IF;
    END IF;
    
    -- Get equipment count
    IF is_super_admin_user THEN
        SELECT COUNT(*) INTO equipment_count FROM public.equipment;
    ELSE
        SELECT COUNT(*) INTO equipment_count 
        FROM public.equipment 
        WHERE company_id = user_company_id;
    END IF;
    
    -- Get project counts
    IF is_super_admin_user THEN
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE LOWER(status) IN ('in_progress', 'in progress', 'ongoing'))
        INTO project_count, active_projects_count
        FROM public.projects;
    ELSE
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE LOWER(status) IN ('in_progress', 'in progress', 'ongoing'))
        INTO project_count, active_projects_count
        FROM public.projects 
        WHERE company_id = user_company_id;
    END IF;
    
    -- Get maintenance counts (including pending tasks from maintenance checks)
    IF is_super_admin_user THEN
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE LOWER(status::text) = 'pending')
        INTO maintenance_count, pending_tasks_count
        FROM public.hvac_maintenance_checks;
    ELSE
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE LOWER(status::text) = 'pending')
        INTO maintenance_count, pending_tasks_count
        FROM public.hvac_maintenance_checks 
        WHERE company_id = user_company_id;
    END IF;
    
    -- Get technician count
    IF is_super_admin_user THEN
        SELECT COUNT(*) INTO technician_count FROM public.technicians;
    ELSE
        SELECT COUNT(*) INTO technician_count 
        FROM public.technicians 
        WHERE company_id = user_company_id;
    END IF;
    
    -- Return all counts as JSON
    RETURN jsonb_build_object(
        'equipment_count', equipment_count,
        'project_count', project_count,
        'active_projects_count', active_projects_count,
        'maintenance_count', maintenance_count,
        'pending_tasks_count', pending_tasks_count,
        'technician_count', technician_count
    );
END;
$$;