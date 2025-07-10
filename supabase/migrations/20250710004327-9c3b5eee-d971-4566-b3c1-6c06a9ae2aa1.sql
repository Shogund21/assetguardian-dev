-- Create get_maintenance_history function with proper filtering and ordering
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
        e.name as equipment_name,
        COALESCE(h.equipment_type, e.type) as equipment_type,
        e.location as equipment_location,
        CONCAT(t."firstName", ' ', t."lastName") as technician_name,
        h.notes,
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

-- Create set_equipment_status function for secure status updates
CREATE OR REPLACE FUNCTION public.set_equipment_status(
    p_equipment_id uuid,
    p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_super_admin_user boolean;
    user_company_id uuid;
    equipment_company_id uuid;
BEGIN
    -- Check if user is super admin
    is_super_admin_user := public.is_super_admin();
    
    -- Get equipment's company ID
    SELECT company_id INTO equipment_company_id
    FROM public.equipment
    WHERE id = p_equipment_id;
    
    IF equipment_company_id IS NULL THEN
        RAISE EXCEPTION 'Equipment not found';
    END IF;
    
    -- If not super admin, verify user belongs to same company
    IF NOT is_super_admin_user THEN
        SELECT cu.company_id INTO user_company_id
        FROM public.company_users cu
        WHERE cu.user_id = auth.uid()::text
        AND cu.company_id = equipment_company_id
        LIMIT 1;
        
        IF user_company_id IS NULL THEN
            RAISE EXCEPTION 'Access denied: user not authorized for this equipment';
        END IF;
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
$$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "super_admin_read_docs" ON storage.objects;
DROP POLICY IF EXISTS "Maintenance: Super admin insert" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Super admin update" ON public.hvac_maintenance_checks;
DROP POLICY IF EXISTS "Maintenance: Super admin delete" ON public.hvac_maintenance_checks;

-- Add storage policy for super admin document access
CREATE POLICY "super_admin_read_docs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'maintenance_docs' AND 
    public.is_super_admin()
);

-- Add INSERT/UPDATE/DELETE RLS policies for hvac_maintenance_checks (super admin access)
CREATE POLICY "Maintenance: Super admin insert" ON public.hvac_maintenance_checks
FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin());

CREATE POLICY "Maintenance: Super admin update" ON public.hvac_maintenance_checks  
FOR UPDATE TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Maintenance: Super admin delete" ON public.hvac_maintenance_checks
FOR DELETE TO authenticated
USING (public.is_super_admin());

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_maintenance_history(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_equipment_status(uuid, text) TO authenticated;