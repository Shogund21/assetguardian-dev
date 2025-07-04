-- Phase 1: Remove test technician data
DELETE FROM public.technicians 
WHERE email IN ('john.doe@example.com', 'jane.smith@example.com', 'joe@test.com');

-- Phase 2: Create Rocky Rockets company for Annette Dixon
INSERT INTO public.companies (id, name, created_at, updated_at)
VALUES (gen_random_uuid(), 'Rocky Rockets', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Phase 3: Update Annette Dixon's company assignment
UPDATE public.technicians 
SET 
  company_id = (SELECT id FROM public.companies WHERE name = 'Rocky Rockets'),
  company_name = 'Rocky Rockets'
WHERE email = 'annette.dixon@rockyrockets.com' AND company_id IS NULL;

-- Phase 4: Ensure proper company_users entry for Annette Dixon
INSERT INTO public.company_users (user_id, company_id, role, is_admin)
SELECT 
  t.email,
  t.company_id,
  COALESCE(t.user_role, 'technician'),
  false
FROM public.technicians t
WHERE t.email = 'annette.dixon@rockyrockets.com'
ON CONFLICT (user_id, company_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin;