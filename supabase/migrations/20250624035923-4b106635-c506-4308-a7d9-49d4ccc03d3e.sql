
-- Create or replace the filter_changes_view with proper logic
CREATE OR REPLACE VIEW public.filter_changes_view WITH (security_invoker = on) AS
SELECT 
  fc.*,
  calculate_filter_status(fc.due_date) as status_calc
FROM public.filter_changes fc
WHERE fc.status = 'active'
ORDER BY fc.due_date ASC;
