-- Fix the update_equipment_maintenance_schedule function to use proper quoted column names
CREATE OR REPLACE FUNCTION public.update_equipment_maintenance_schedule()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update the nextMaintenance date when lastMaintenance is updated
  -- This example sets next maintenance to 3 months after last maintenance
  IF NEW."lastMaintenance" IS NOT NULL AND 
     (OLD."lastMaintenance" IS NULL OR NEW."lastMaintenance" != OLD."lastMaintenance") THEN
    NEW."nextMaintenance" := NEW."lastMaintenance" + INTERVAL '3 months';
  END IF;
  
  RETURN NEW;
END;
$function$;