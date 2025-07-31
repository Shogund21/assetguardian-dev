-- Add location_id column to filter_changes table
ALTER TABLE public.filter_changes 
ADD COLUMN location_id uuid REFERENCES public.locations(id);

-- Add index for better performance on location queries
CREATE INDEX idx_filter_changes_location_id ON public.filter_changes(location_id);

-- Update RLS policies to account for location_id
DROP POLICY IF EXISTS "filter_changes_company_access" ON public.filter_changes;

CREATE POLICY "filter_changes_company_access" 
ON public.filter_changes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.equipment e 
    WHERE e.id = filter_changes.equipment_id 
    AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.locations l 
    WHERE l.id = filter_changes.location_id 
    AND (l.company_id IS NULL OR is_member_of(l.company_id) OR can_access_all_data())
  )
);