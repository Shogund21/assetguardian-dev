-- Create secure delete functions with proper error handling and audit logging

-- Function to delete projects with permission checks and audit logging
CREATE OR REPLACE FUNCTION delete_project(p_project_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    project_company_id UUID;
    deleted_count INTEGER;
    project_name TEXT;
BEGIN
    -- Get project details and verify existence
    SELECT company_id, name INTO project_company_id, project_name
    FROM public.projects
    WHERE id = p_project_id;
    
    IF project_company_id IS NULL THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Project not found',
            'code', 'NOT_FOUND'
        );
    END IF;
    
    -- Check permissions
    IF NOT (can_access_all_data() OR is_member_of(project_company_id)) THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Access denied: You do not have permission to delete this project',
            'code', 'ACCESS_DENIED'
        );
    END IF;
    
    -- Perform delete
    DELETE FROM public.projects WHERE id = p_project_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count = 0 THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Project could not be deleted',
            'code', 'DELETE_FAILED'
        );
    END IF;
    
    -- Log the deletion
    PERFORM log_audit_event(
        'DELETE', 
        'projects', 
        p_project_id, 
        json_build_object('name', project_name)::jsonb,
        null, 
        'Project deleted via delete_project function'
    );
    
    RETURN json_build_object(
        'success', true, 
        'deleted_count', deleted_count,
        'message', 'Project "' || project_name || '" deleted successfully'
    );
END;
$$;

-- Function to delete equipment with permission checks and audit logging
CREATE OR REPLACE FUNCTION delete_equipment(p_equipment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    equipment_company_id UUID;
    deleted_count INTEGER;
    equipment_name TEXT;
BEGIN
    -- Get equipment details and verify existence
    SELECT company_id, name INTO equipment_company_id, equipment_name
    FROM public.equipment
    WHERE id = p_equipment_id;
    
    IF equipment_company_id IS NULL THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Equipment not found',
            'code', 'NOT_FOUND'
        );
    END IF;
    
    -- Check permissions
    IF NOT (can_access_all_data() OR is_member_of(equipment_company_id)) THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Access denied: You do not have permission to delete this equipment',
            'code', 'ACCESS_DENIED'
        );
    END IF;
    
    -- Perform delete
    DELETE FROM public.equipment WHERE id = p_equipment_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count = 0 THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Equipment could not be deleted',
            'code', 'DELETE_FAILED'
        );
    END IF;
    
    -- Log the deletion
    PERFORM log_audit_event(
        'DELETE', 
        'equipment', 
        p_equipment_id, 
        json_build_object('name', equipment_name)::jsonb,
        null, 
        'Equipment deleted via delete_equipment function'
    );
    
    RETURN json_build_object(
        'success', true, 
        'deleted_count', deleted_count,
        'message', 'Equipment "' || equipment_name || '" deleted successfully'
    );
END;
$$;