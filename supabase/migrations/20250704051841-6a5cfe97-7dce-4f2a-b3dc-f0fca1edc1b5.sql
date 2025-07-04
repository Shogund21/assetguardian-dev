-- Phase 1a: Remove maintenance checks for test technicians first
DELETE FROM public.hvac_maintenance_checks 
WHERE technician_id IN (
  SELECT id FROM public.technicians 
  WHERE email IN ('john.doe@example.com', 'jane.smith@example.com', 'joe@test.com')
);

-- Phase 1b: Remove test technician data
DELETE FROM public.technicians 
WHERE email IN ('john.doe@example.com', 'jane.smith@example.com', 'joe@test.com');

-- Phase 2: Create Rocky Rockets company for Annette Dixon (only if it doesn't exist)
INSERT INTO public.companies (id, name, created_at, updated_at)
SELECT gen_random_uuid(), 'Rocky Rockets', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'Rocky Rockets');

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
  AND NOT EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE user_id = t.email AND company_id = t.company_id
  );