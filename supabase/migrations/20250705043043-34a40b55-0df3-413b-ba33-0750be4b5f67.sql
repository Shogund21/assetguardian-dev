-- Create permanent demo company for new users
DO $$
DECLARE
    demo_company_id uuid;
BEGIN
    -- Check if demo company already exists
    SELECT id INTO demo_company_id 
    FROM public.companies 
    WHERE name = 'Demo Facilities Inc.' AND is_trial = true;
    
    -- Create demo company if it doesn't exist
    IF demo_company_id IS NULL THEN
        INSERT INTO public.companies (
            name, 
            is_trial, 
            trial_expires_at, 
            trial_created_at,
            contact_email,
            address,
            contact_phone
        ) VALUES (
            'Demo Facilities Inc.',
            true,
            now() + INTERVAL '365 days',
            now(),
            'demo@example.com',
            '123 Demo Street, Demo City, DC 12345',
            '(555) 123-0000'
        );
        
        RAISE NOTICE 'Created demo company: Demo Facilities Inc.';
    ELSE
        RAISE NOTICE 'Demo company already exists';
    END IF;
END $$;

-- Create function to get the demo company ID
CREATE OR REPLACE FUNCTION public.get_demo_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT id 
    FROM public.companies 
    WHERE name = 'Demo Facilities Inc.' 
    AND is_trial = true 
    LIMIT 1;
$$;

-- Create function to assign user to demo company
CREATE OR REPLACE FUNCTION public.assign_user_to_demo_company(p_user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_company_id uuid;
BEGIN
    -- Get demo company ID
    demo_company_id := public.get_demo_company_id();
    
    IF demo_company_id IS NULL THEN
        RAISE EXCEPTION 'Demo company not found';
    END IF;
    
    -- Create company user record (if it doesn't exist)
    INSERT INTO public.company_users (
        user_id,
        company_id,
        role,
        is_admin
    ) VALUES (
        p_user_email,
        demo_company_id,
        'demo_user',
        false
    ) ON CONFLICT (user_id, company_id) DO NOTHING;
    
    RETURN demo_company_id;
END;
$$;

-- Create function to check if user is demo user
CREATE OR REPLACE FUNCTION public.is_demo_user(p_user_id text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.company_users cu
        JOIN public.companies c ON c.id = cu.company_id
        WHERE cu.user_id = COALESCE(p_user_id, (auth.uid())::text)
        AND c.name = 'Demo Facilities Inc.'
        AND c.is_trial = true
        AND cu.role = 'demo_user'
    );
$$;