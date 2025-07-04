-- Update all technicians with @macys.com emails to be associated with Macy's company
UPDATE public.technicians 
SET 
  company_id = '351b016a-3b60-424a-8817-20e35686840a',
  company_name = 'Macys'
WHERE email LIKE '%@macys.com%' AND company_id IS NULL;

-- Insert corresponding entries in company_users table for proper role management
INSERT INTO public.company_users (user_id, company_id, role, is_admin)
SELECT 
  t.email,
  '351b016a-3b60-424a-8817-20e35686840a',
  COALESCE(t.user_role, 'technician'),
  false
FROM public.technicians t
WHERE t.email LIKE '%@macys.com%'
ON CONFLICT (user_id, company_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin;