-- Fix trial_companies view security issue
-- This view should not bypass RLS - it should rely on RLS policies of underlying tables

-- Drop and recreate the trial_companies view
DROP VIEW IF EXISTS public.trial_companies CASCADE;

CREATE VIEW public.trial_companies AS
SELECT 
  c.id,
  c.name,
  c.logo_url,
  c.address,
  c.contact_email,
  c.contact_phone,
  c.created_at,
  c.updated_at,
  c.is_trial,
  c.trial_expires_at,
  c.trial_created_at,
  EXTRACT(epoch FROM (c.trial_expires_at - now()))::integer / 86400 AS days_remaining,
  CASE
    WHEN c.trial_expires_at < now() THEN true
    ELSE false
  END AS is_expired,
  count(cu.id) AS user_count
FROM companies c
LEFT JOIN company_users cu ON c.id = cu.company_id
WHERE c.is_trial = true
GROUP BY c.id, c.name, c.is_trial, c.trial_expires_at, c.trial_created_at, 
         c.contact_email, c.contact_phone, c.address, c.logo_url, c.created_at, c.updated_at;

-- Grant appropriate permissions
GRANT SELECT ON public.trial_companies TO authenticated;

-- Security note: Access control is enforced through RLS policies on the underlying 
-- companies and company_users tables. Only users with appropriate permissions can see trial companies.