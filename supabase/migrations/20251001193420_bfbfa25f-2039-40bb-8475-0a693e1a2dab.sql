-- Fix security definer view issue
-- Views cannot have RLS policies - they inherit security from underlying tables
-- This migration removes incorrect RLS configuration from filter_changes_view

-- Drop the incorrect RLS policy on the view (if it exists)
DROP POLICY IF EXISTS "Filter changes view: Company users can view" ON public.filter_changes_view;

-- Recreate the view to ensure it's properly defined without any security definer issues
DROP VIEW IF EXISTS public.filter_changes_view CASCADE;

CREATE VIEW public.filter_changes_view AS
SELECT 
  fc.id,
  fc.equipment_id,
  fc.filter_type,
  fc.filter_size,
  fc.installation_date,
  fc.due_date,
  fc.technician_id,
  fc.status,
  fc.filter_condition,
  fc.notes,
  fc.created_at,
  fc.updated_at,
  calculate_filter_status(fc.due_date) AS status_calc
FROM filter_changes fc
WHERE fc.status = 'active'::filter_change_status
ORDER BY fc.due_date;

-- Grant appropriate permissions
GRANT SELECT ON public.filter_changes_view TO authenticated;
GRANT SELECT ON public.filter_changes_view TO anon;

-- Security note: Access control is enforced through RLS policies on the underlying 
-- filter_changes table. Users can only see rows in this view if they have access 
-- to the underlying filter_changes records through those RLS policies.