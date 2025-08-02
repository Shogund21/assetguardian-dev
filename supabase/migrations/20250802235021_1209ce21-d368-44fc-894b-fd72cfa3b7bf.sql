-- Fix Edward Dixon's company_users data consistency
-- Add UUID-based record for Edward Dixon with proper admin privileges
INSERT INTO public.company_users (user_id, company_id, role, is_admin)
VALUES (
  'd2c8f035-704e-4ccb-9dc6-e597c20a9a80',  -- Edward's UUID
  '351b016a-3b60-424a-8817-20e35686840a',  -- Macy's company ID
  'admin',
  true
) ON CONFLICT (user_id, company_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin;

-- Remove the duplicate email-based record to eliminate confusion
DELETE FROM public.company_users 
WHERE user_id = 'edward.dixon@macys.com' 
AND company_id = '351b016a-3b60-424a-8817-20e35686840a';