-- Emergency Fix: Populate user_roles table with existing permissions

-- Step 1: Insert admin roles for all existing admins from company_users
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT 
  cu.user_id::uuid,
  'admin'::app_role
FROM public.company_users cu
WHERE cu.is_admin = true
  AND cu.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 2: Map technician roles from technicians table
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT
  t.user_id,
  CASE
    WHEN t.user_role IN ('admin', 'super_admin') THEN 'admin'::app_role
    WHEN t.user_role IN ('engineer', 'senior_technician') THEN 'engineer'::app_role
    ELSE 'user'::app_role
  END as role
FROM public.technicians t
WHERE t.user_id IS NOT NULL
  AND t.account_status IN ('has_account', 'active')
  AND t.user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Ensure super admin has admin role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  'admin'::app_role
FROM auth.users
WHERE email = 'edward@shogunaillc.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verification: Count roles inserted
DO $$
DECLARE
  admin_count INTEGER;
  engineer_count INTEGER;
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  SELECT COUNT(*) INTO engineer_count FROM public.user_roles WHERE role = 'engineer';
  SELECT COUNT(*) INTO user_count FROM public.user_roles WHERE role = 'user';
  
  RAISE NOTICE 'User roles populated - Admins: %, Engineers: %, Users: %', admin_count, engineer_count, user_count;
END $$;