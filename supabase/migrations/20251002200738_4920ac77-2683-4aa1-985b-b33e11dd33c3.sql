-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "filter_changes_admin" ON filter_changes;

-- The existing policies already properly restrict access:
-- 1. filter_changes_company_access: Allows access based on equipment/location company membership
-- 2. filter_changes_own_rows: Allows technicians to access their own rows

-- Add a comment to document the security model
COMMENT ON TABLE filter_changes IS 'Filter change records - access restricted to company members and assigned technicians only via RLS policies';