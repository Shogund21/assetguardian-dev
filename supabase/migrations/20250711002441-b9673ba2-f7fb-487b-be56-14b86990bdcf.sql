-- Create RPC function for updating project priority
CREATE OR REPLACE FUNCTION public.set_project_priority(p_project_id uuid, p_priority text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    
    -- Update project priority
    UPDATE public.projects
    SET priority = p_priority,
        updatedat = now()
    WHERE id = p_project_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Project update failed';
    END IF;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.set_project_priority(uuid, text) TO authenticated;

-- Update set_equipment_status function to ensure proper error handling
CREATE OR REPLACE FUNCTION public.set_equipment_status(p_equipment_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    equipment_company_id uuid;
BEGIN
    -- Get equipment's company ID
    SELECT company_id INTO equipment_company_id
    FROM public.equipment
    WHERE id = p_equipment_id;
    
    IF equipment_company_id IS NULL THEN
        RAISE EXCEPTION 'Equipment not found';
    END IF;
    
    -- Check if user has access (super admin or member of company)
    IF NOT (public.can_access_all_data() OR public.is_member_of(equipment_company_id)) THEN
        RAISE EXCEPTION 'Access denied: user not authorized for this equipment';
    END IF;
    
    -- Update equipment status
    UPDATE public.equipment
    SET status = p_status,
        updated_at = now()
    WHERE id = p_equipment_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Equipment update failed';
    END IF;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.set_equipment_status(uuid, text) TO authenticated;