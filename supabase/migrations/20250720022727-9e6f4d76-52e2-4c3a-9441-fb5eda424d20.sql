
-- Fix RLS policies for filter_changes table to use proper company-based access control

-- First, drop the existing restrictive policies
DROP POLICY IF EXISTS "filter_changes_admin" ON public.filter_changes;
DROP POLICY IF EXISTS "filter_changes_own_rows" ON public.filter_changes;

-- Add company_id column to filter_changes table if it doesn't exist
ALTER TABLE public.filter_changes 
ADD COLUMN IF NOT EXISTS company_id uuid;

-- Update existing filter_changes records to have company_id based on their equipment
UPDATE public.filter_changes 
SET company_id = e.company_id 
FROM public.equipment e 
WHERE public.filter_changes.equipment_id = e.id 
AND public.filter_changes.company_id IS NULL;

-- Create new RLS policies that follow the same pattern as other tables
CREATE POLICY "Filter changes: Company users can view" 
ON public.filter_changes 
FOR SELECT 
USING (
  can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Filter changes: Company users can manage" 
ON public.filter_changes 
FOR ALL 
USING (
  can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
)
WITH CHECK (
  can_access_all_data() OR 
  (company_id IS NOT NULL AND is_member_of(company_id))
);

-- Add RLS policies to filter_changes_view
ALTER TABLE public.filter_changes_view ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Filter changes view: Company users can view" 
ON public.filter_changes_view 
FOR SELECT 
USING (
  can_access_all_data() OR 
  EXISTS (
    SELECT 1 FROM public.equipment e 
    WHERE e.id = filter_changes_view.equipment_id 
    AND e.company_id IS NOT NULL 
    AND is_member_of(e.company_id)
  )
);

-- Create a trigger to automatically set company_id on new filter_changes
CREATE OR REPLACE FUNCTION public.set_filter_change_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Set company_id based on the equipment's company_id
  SELECT company_id INTO NEW.company_id
  FROM public.equipment
  WHERE id = NEW.equipment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_filter_change_company_id_trigger
  BEFORE INSERT ON public.filter_changes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_filter_change_company_id();
