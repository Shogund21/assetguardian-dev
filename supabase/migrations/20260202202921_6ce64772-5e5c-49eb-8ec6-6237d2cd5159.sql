-- Create a new trigger function for the projects table that uses the correct column name
CREATE OR REPLACE FUNCTION public.update_projects_updatedat_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updatedat = now();
    RETURN NEW;
END;
$function$;

-- Drop the existing trigger that uses the wrong function
DROP TRIGGER IF EXISTS update_projects_updatedat ON public.projects;

-- Create new trigger with the correct function
CREATE TRIGGER update_projects_updatedat
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updatedat_column();