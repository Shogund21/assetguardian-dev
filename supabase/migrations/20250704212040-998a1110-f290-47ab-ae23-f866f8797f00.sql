-- Phase 2: Migrate Existing Data
-- Assign all unassigned data to Macys company (has active users)

-- Get Macys company ID (should be the one with users)
DO $$
DECLARE
    macys_company_id UUID;
BEGIN
    -- Find company with most users (should be Macys)
    SELECT c.id INTO macys_company_id
    FROM public.companies c
    LEFT JOIN public.company_users cu ON c.id = cu.company_id
    GROUP BY c.id, c.name
    ORDER BY COUNT(cu.id) DESC
    LIMIT 1;
    
    -- If we found a company, assign all unassigned data to it
    IF macys_company_id IS NOT NULL THEN
        -- Update equipment
        UPDATE public.equipment 
        SET company_id = macys_company_id 
        WHERE company_id IS NULL;
        
        -- Update locations  
        UPDATE public.locations 
        SET company_id = macys_company_id 
        WHERE company_id IS NULL;
        
        -- Update technicians
        UPDATE public.technicians 
        SET company_id = macys_company_id 
        WHERE company_id IS NULL;
        
        -- Update projects
        UPDATE public.projects 
        SET company_id = macys_company_id 
        WHERE company_id IS NULL;
        
        -- Update maintenance checks
        UPDATE public.hvac_maintenance_checks 
        SET company_id = macys_company_id 
        WHERE company_id IS NULL;
        
        -- Update maintenance documents
        UPDATE public.maintenance_documents 
        SET company_id = macys_company_id 
        WHERE company_id IS NULL;
        
        RAISE NOTICE 'Assigned all unassigned data to company: %', macys_company_id;
    ELSE
        RAISE NOTICE 'No company found to assign data to';
    END IF;
END $$;