-- Phase 3: Trial Company System Infrastructure
-- Add trial fields and create trial management functions

-- Step 3.1: Add trial fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_expires_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_created_at timestamp with time zone DEFAULT NULL;

-- Step 3.2: Create trial management functions

-- Function to create a trial company
CREATE OR REPLACE FUNCTION public.create_trial_company(
    p_company_name text,
    p_user_email text,
    p_user_first_name text DEFAULT 'Trial',
    p_user_last_name text DEFAULT 'User'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    trial_company_id uuid;
    trial_expires timestamp with time zone;
BEGIN
    -- Set trial expiration to 15 days from now
    trial_expires := now() + INTERVAL '15 days';
    
    -- Create trial company
    INSERT INTO public.companies (
        name, 
        is_trial, 
        trial_expires_at, 
        trial_created_at,
        contact_email
    ) VALUES (
        p_company_name,
        true,
        trial_expires,
        now(),
        p_user_email
    ) RETURNING id INTO trial_company_id;
    
    -- Create company user record for the trial user
    INSERT INTO public.company_users (
        user_id,
        company_id,
        role,
        is_admin
    ) VALUES (
        p_user_email,
        trial_company_id,
        'admin',
        true
    );
    
    -- Create technician record for the trial user  
    INSERT INTO public.technicians (
        "firstName",
        "lastName",
        email,
        phone,
        specialization,
        company_id,
        company_name,
        user_role,
        status
    ) VALUES (
        p_user_first_name,
        p_user_last_name,
        p_user_email,
        '(555) 123-4567',
        'HVAC Specialist',
        trial_company_id,
        p_company_name,
        'admin',
        'active'
    );
    
    RETURN trial_company_id;
END;
$$;

-- Function to check if trial is expired
CREATE OR REPLACE FUNCTION public.is_trial_expired(p_company_id uuid)
RETURNS boolean 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        CASE 
            WHEN c.is_trial = true AND c.trial_expires_at < now() THEN true
            ELSE false
        END
    FROM public.companies c
    WHERE c.id = p_company_id;
$$;

-- Function to get trial info
CREATE OR REPLACE FUNCTION public.get_trial_info(p_company_id uuid)
RETURNS TABLE(
    is_trial boolean,
    expires_at timestamp with time zone,
    days_remaining integer,
    is_expired boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        c.is_trial,
        c.trial_expires_at,
        CASE 
            WHEN c.trial_expires_at IS NOT NULL THEN
                EXTRACT(EPOCH FROM (c.trial_expires_at - now()))::integer / 86400
            ELSE NULL
        END as days_remaining,
        CASE 
            WHEN c.is_trial = true AND c.trial_expires_at < now() THEN true
            ELSE false
        END as is_expired
    FROM public.companies c
    WHERE c.id = p_company_id;
$$;

-- Step 3.3: Create view for trial companies management
CREATE OR REPLACE VIEW public.trial_companies AS
SELECT 
    c.*,
    EXTRACT(EPOCH FROM (c.trial_expires_at - now()))::integer / 86400 as days_remaining,
    CASE 
        WHEN c.trial_expires_at < now() THEN true
        ELSE false
    END as is_expired,
    COUNT(cu.id) as user_count
FROM public.companies c
LEFT JOIN public.company_users cu ON c.id = cu.company_id
WHERE c.is_trial = true
GROUP BY c.id, c.name, c.is_trial, c.trial_expires_at, c.trial_created_at, c.contact_email, c.contact_phone, c.address, c.logo_url, c.created_at, c.updated_at;