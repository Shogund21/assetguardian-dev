-- Enhanced RPC Functions for Equipment and Projects Data
-- Fixes deployment-blocking issues and adds production safeguards

-- Function to get equipment data with pagination, search, and company filtering
CREATE OR REPLACE FUNCTION public.get_equipment_data(
    p_company_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0,
    p_search text DEFAULT ''
)
RETURNS TABLE(
    id uuid,
    name text,
    type text,
    model text,
    serial_number text,
    location text,
    status text,
    "lastMaintenance" timestamp with time zone,
    "nextMaintenance" timestamp with time zone,
    company_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
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
        e.id,
        e.name::text,
        e.type::text,
        e.model::text,
        e.serial_number::text,
        e.location::text,
        e.status::text,
        e."lastMaintenance",
        e."nextMaintenance",
        e.company_id,
        e.created_at,
        e.updated_at
    FROM public.equipment e
    WHERE (
        (is_super_admin_user AND (p_company_id IS NULL OR e.company_id = p_company_id)) OR 
        (NOT is_super_admin_user AND e.company_id = user_company_id)
    )
    AND (
        p_search = '' OR 
        LOWER(e.name) LIKE '%' || LOWER(p_search) || '%' OR
        LOWER(e.type) LIKE '%' || LOWER(p_search) || '%' OR
        LOWER(e.location) LIKE '%' || LOWER(p_search) || '%'
    )
    ORDER BY e.name
    LIMIT LEAST(p_limit, 500)
    OFFSET p_offset;
END;
$$;

-- Function to get projects data with pagination, search, and company filtering
CREATE OR REPLACE FUNCTION public.get_projects_data(
    p_company_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0,
    p_search text DEFAULT ''
)
RETURNS TABLE(
    id uuid,
    name text,
    description text,
    status text,
    priority text,
    location text,
    startdate timestamp with time zone,
    enddate timestamp with time zone,
    createdat timestamp with time zone,
    updatedat timestamp with time zone,
    company_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
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
        p.id,
        p.name::text,
        p.description::text,
        p.status::text,
        p.priority::text,
        p.location::text,
        p.startdate,
        p.enddate,
        p.createdat,
        p.updatedat,
        p.company_id
    FROM public.projects p
    WHERE (
        (is_super_admin_user AND (p_company_id IS NULL OR p.company_id = p_company_id)) OR 
        (NOT is_super_admin_user AND p.company_id = user_company_id)
    )
    AND (
        p_search = '' OR 
        LOWER(p.name) LIKE '%' || LOWER(p_search) || '%' OR
        LOWER(p.description) LIKE '%' || LOWER(p_search) || '%' OR
        LOWER(p.location) LIKE '%' || LOWER(p_search) || '%'
    )
    ORDER BY p.name
    LIMIT LEAST(p_limit, 500)
    OFFSET p_offset;
END;
$$;

-- Function to get equipment dropdown data (id and name only)
CREATE OR REPLACE FUNCTION public.equipment_dropdown(
    p_company_id uuid DEFAULT NULL,
    p_search text DEFAULT ''
)
RETURNS TABLE(
    id uuid,
    name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
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
        e.id,
        e.name::text
    FROM public.equipment e
    WHERE (
        (is_super_admin_user AND (p_company_id IS NULL OR e.company_id = p_company_id)) OR 
        (NOT is_super_admin_user AND e.company_id = user_company_id)
    )
    AND (
        p_search = '' OR 
        LOWER(e.name) LIKE '%' || LOWER(p_search) || '%'
    )
    ORDER BY e.name
    LIMIT 100;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_equipment_data(uuid, integer, integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_projects_data(uuid, integer, integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.equipment_dropdown(uuid, text) TO authenticated, service_role;

-- Add comments for documentation
COMMENT ON FUNCTION public.get_equipment_data IS 'Returns paginated equipment data with company filtering and search. Super admins can access all companies.';
COMMENT ON FUNCTION public.get_projects_data IS 'Returns paginated projects data with company filtering and search. Super admins can access all companies.';
COMMENT ON FUNCTION public.equipment_dropdown IS 'Returns equipment id/name pairs for dropdowns with company filtering and search. Super admins can access all companies.';