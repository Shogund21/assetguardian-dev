-- Phase 1: Database Cleanup - Remove conflicting company_users record for super admin
-- This prevents auth conflicts where both email and UUID records exist

-- Check current conflicting records for super admin
DO $$
DECLARE
    email_record_count INTEGER;
    uuid_record_count INTEGER;
BEGIN
    -- Count email-based records
    SELECT COUNT(*) INTO email_record_count
    FROM public.company_users 
    WHERE user_id = 'edward@shogunaillc.com';
    
    -- Count UUID-based records  
    SELECT COUNT(*) INTO uuid_record_count
    FROM public.company_users cu
    JOIN auth.users au ON cu.user_id = au.id::text
    WHERE au.email = 'edward@shogunaillc.com';
    
    RAISE NOTICE 'Super admin email-based records: %', email_record_count;
    RAISE NOTICE 'Super admin UUID-based records: %', uuid_record_count;
    
    -- Remove email-based record to prevent conflicts
    IF email_record_count > 0 THEN
        DELETE FROM public.company_users 
        WHERE user_id = 'edward@shogunaillc.com';
        RAISE NOTICE 'Deleted % email-based company_users records for super admin', email_record_count;
    END IF;
    
    -- Ensure super admin has proper access via is_super_admin() function instead of company_users table
    RAISE NOTICE 'Super admin access will be handled via is_super_admin() function, not company_users table';
END $$;