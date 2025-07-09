-- Set isSuperAdmin flag for super admin user
-- This adds the isSuperAdmin claim to the user's JWT metadata
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"isSuperAdmin": true}'::jsonb 
WHERE email = 'edward@shogunaillc.com';

-- Verify the update was successful
SELECT email, raw_app_meta_data->'isSuperAdmin' as is_super_admin 
FROM auth.users 
WHERE email = 'edward@shogunaillc.com';