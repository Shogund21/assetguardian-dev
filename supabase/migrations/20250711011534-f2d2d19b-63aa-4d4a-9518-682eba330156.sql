-- Fix column reference ambiguity in get_maintenance_history function
CREATE OR REPLACE FUNCTION public.get_maintenance_history(
    p_equipment_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    equipment_id uuid,
    technician_id uuid,
    check_date timestamp with time zone,
    status maintenance_check_status,
    equipment_name text,
    equipment_type text,
    equipment_location text,
    technician_name text,
    notes text,
    company_id uuid
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    is_super_admin_user boolean;
    user_company_id uuid;
    current_user_id uuid;
    current_user_email text;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();
    
    -- If we have a user ID, get their email
    IF current_user_id IS NOT NULL THEN
        SELECT u.email INTO current_user_email
        FROM auth.users u
        WHERE u.id = current_user_id;
    END IF;
    
    -- Check if user is super admin by email
    is_super_admin_user := (
        current_user_email = 'edward@shogunaillc.com' OR
        EXISTS (
            SELECT 1 FROM public.company_users cu 
            WHERE cu.user_id = 'edward@shogunaillc.com'
            AND cu.role = 'super_admin'
        )
    );
    
    -- Get user's company ID if not super admin
    IF NOT is_super_admin_user THEN
        -- Try to get company ID using UUID first, then fallback to email
        SELECT cu.company_id INTO user_company_id
        FROM public.company_users cu
        WHERE (
            cu.user_id = current_user_id::text OR 
            cu.user_id = current_user_email
        )
        LIMIT 1;
        
        -- If no company found and user is authenticated, return empty result
        IF user_company_id IS NULL AND current_user_id IS NOT NULL THEN
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY
    SELECT 
        h.id,
        h.equipment_id,
        h.technician_id,
        h.check_date,
        h.status,
        COALESCE(e.name, 'Unknown Equipment')::text as equipment_name,
        COALESCE(h.equipment_type, e.type, 'Unknown')::text as equipment_type,
        COALESCE(e.location, 'Unknown Location')::text as equipment_location,
        COALESCE(CONCAT(t."firstName", ' ', t."lastName"), 'Unknown Technician')::text as technician_name,
        COALESCE(h.notes, '')::text as notes,
        h.company_id
    FROM public.hvac_maintenance_checks h
    LEFT JOIN public.equipment e ON e.id = h.equipment_id
    LEFT JOIN public.technicians t ON t.id = h.technician_id
    WHERE (
        (is_super_admin_user) OR 
        (NOT is_super_admin_user AND h.company_id = user_company_id)
    )
    AND (p_equipment_id IS NULL OR h.equipment_id = p_equipment_id)
    ORDER BY h.check_date DESC NULLS LAST
    LIMIT LEAST(p_limit, 500)
    OFFSET p_offset;
END;
$$;