-- Fix type mismatches in get_maintenance_history function
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
BEGIN
    -- Check if user is super admin
    is_super_admin_user := public.is_super_admin();
    
    -- Get user's company ID if not super admin
    IF NOT is_super_admin_user THEN
        SELECT cu.company_id INTO user_company_id
        FROM public.company_users cu
        WHERE cu.user_id = auth.uid()::text
        LIMIT 1;
    END IF;
    
    RETURN QUERY
    SELECT 
        h.id,
        h.equipment_id,
        h.technician_id,
        h.check_date,
        h.status,
        e.name::text as equipment_name,
        COALESCE(h.equipment_type, e.type)::text as equipment_type,
        e.location::text as equipment_location,
        CONCAT(t."firstName", ' ', t."lastName")::text as technician_name,
        h.notes::text,
        h.company_id
    FROM public.hvac_maintenance_checks h
    LEFT JOIN public.equipment e ON e.id = h.equipment_id
    LEFT JOIN public.technicians t ON t.id = h.technician_id
    WHERE (
        (is_super_admin_user) OR 
        (NOT is_super_admin_user AND h.company_id = user_company_id)
    )
    AND (p_equipment_id IS NULL OR h.equipment_id = p_equipment_id)
    ORDER BY h.check_date DESC
    LIMIT LEAST(p_limit, 500)
    OFFSET p_offset;
END;
$$;