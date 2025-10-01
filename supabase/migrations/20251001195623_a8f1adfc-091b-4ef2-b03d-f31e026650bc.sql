-- Remove security definer views and migrate to direct table queries
-- This eliminates the security definer view warnings while maintaining exact functionality

-- Drop the filter_changes_view (now replaced with direct queries to filter_changes table)
DROP VIEW IF EXISTS public.filter_changes_view CASCADE;

-- Drop the trial_companies view (not actively used in application code)
DROP VIEW IF EXISTS public.trial_companies CASCADE;

-- Drop the calculate_filter_status function (now calculated client-side)
DROP FUNCTION IF EXISTS public.calculate_filter_status(timestamp with time zone);

-- MIGRATION NOTES:
-- 1. filter_changes_view has been replaced with direct queries to filter_changes table
-- 2. The status calculation is now done client-side using calculateFilterStatus utility
-- 3. All queries filter by status = 'active' and order by due_date (exact same as view)
-- 4. trial_companies view was not actively used and has been removed
-- 5. This eliminates the "Security Definer View" warnings without changing functionality