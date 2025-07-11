-- Add DELETE policies for company members to delete projects and equipment within their company

-- Add DELETE policy for projects
CREATE POLICY "Projects: Company member delete" 
ON public.projects 
FOR DELETE 
USING (can_access_all_data() OR ((company_id IS NOT NULL) AND is_member_of(company_id)));

-- Add DELETE policy for equipment  
CREATE POLICY "Equipment: Company member delete"
ON public.equipment
FOR DELETE
USING (can_access_all_data() OR ((company_id IS NOT NULL) AND is_member_of(company_id)));