-- Phase 3.3: Complete Trial Company Creation with Demo Data
-- Integrated function to create trial company and populate with demo data

CREATE OR REPLACE FUNCTION public.create_complete_trial_company(
    p_company_name text,
    p_user_email text,
    p_user_first_name text DEFAULT 'Trial',
    p_user_last_name text DEFAULT 'User'
)
RETURNS TABLE(
    company_id uuid,
    trial_expires_at timestamp with time zone,
    days_remaining integer,
    demo_data_created boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    trial_company_id uuid;
    trial_expires timestamp with time zone;
    demo_success boolean DEFAULT false;
BEGIN
    -- Create the trial company using existing function
    trial_company_id := public.create_trial_company(
        p_company_name, 
        p_user_email, 
        p_user_first_name, 
        p_user_last_name
    );
    
    -- Get trial expiration date
    trial_expires := now() + INTERVAL '15 days';
    
    -- Generate demo data
    BEGIN
        PERFORM public.generate_demo_data(trial_company_id, p_company_name);
        demo_success := true;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the trial creation
        RAISE NOTICE 'Demo data generation failed for company %: %', p_company_name, SQLERRM;
        demo_success := false;
    END;
    
    -- Return trial information
    RETURN QUERY SELECT 
        trial_company_id,
        trial_expires,
        15 as days_remaining,
        demo_success;
END;
$$;

-- Function to cleanup expired trials (for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_trials()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cleanup_count integer := 0;
    expired_company record;
BEGIN
    -- Find expired trial companies (older than 30 days past expiration)
    FOR expired_company IN 
        SELECT id, name 
        FROM public.companies 
        WHERE is_trial = true 
        AND trial_expires_at < (now() - INTERVAL '30 days')
    LOOP
        -- Delete all related data for the expired company
        DELETE FROM public.sensor_readings WHERE equipment_id IN (
            SELECT id FROM public.equipment WHERE company_id = expired_company.id
        );
        DELETE FROM public.hvac_maintenance_checks WHERE company_id = expired_company.id;
        DELETE FROM public.maintenance_documents WHERE company_id = expired_company.id;
        DELETE FROM public.projects WHERE company_id = expired_company.id;
        DELETE FROM public.equipment WHERE company_id = expired_company.id;
        DELETE FROM public.technicians WHERE company_id = expired_company.id;
        DELETE FROM public.locations WHERE company_id = expired_company.id;
        DELETE FROM public.company_users WHERE company_id = expired_company.id;
        DELETE FROM public.companies WHERE id = expired_company.id;
        
        RAISE NOTICE 'Cleaned up expired trial company: %', expired_company.name;
        cleanup_count := cleanup_count + 1;
    END LOOP;
    
    RETURN cleanup_count;
END;
$$;

-- Create a function to extend trial (for customer service)
CREATE OR REPLACE FUNCTION public.extend_trial(
    p_company_id uuid,
    p_additional_days integer DEFAULT 15
)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_expiration timestamp with time zone;
BEGIN
    -- Update trial expiration
    UPDATE public.companies 
    SET trial_expires_at = GREATEST(trial_expires_at, now()) + INTERVAL '1 day' * p_additional_days
    WHERE id = p_company_id AND is_trial = true
    RETURNING trial_expires_at INTO new_expiration;
    
    IF new_expiration IS NULL THEN
        RAISE EXCEPTION 'Company not found or not a trial company';
    END IF;
    
    RETURN new_expiration;
END;
$$;

-- Update RLS policies to handle trial restrictions
-- Trial companies that are expired should have read-only access
CREATE OR REPLACE FUNCTION public.can_modify_data(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        public.can_access_all_data() OR
        CASE 
            WHEN c.is_trial = true AND c.trial_expires_at < now() THEN false
            ELSE true
        END
    FROM public.companies c
    WHERE c.id = p_company_id;
$$;