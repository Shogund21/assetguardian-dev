
-- 1. Create trigger function
CREATE OR REPLACE FUNCTION public.sync_equipment_last_maintenance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_date timestamp with time zone;
BEGIN
  IF NEW.status = 'completed' THEN
    SELECT MAX(check_date) INTO latest_date
    FROM public.hvac_maintenance_checks
    WHERE equipment_id = NEW.equipment_id
      AND status = 'completed';

    UPDATE public.equipment
    SET "lastMaintenance" = latest_date
    WHERE id = NEW.equipment_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Create trigger on hvac_maintenance_checks
CREATE TRIGGER trg_sync_last_maintenance
AFTER INSERT OR UPDATE ON public.hvac_maintenance_checks
FOR EACH ROW
EXECUTE FUNCTION public.sync_equipment_last_maintenance();

-- 3. Backfill existing data
UPDATE public.equipment e
SET "lastMaintenance" = sub.latest
FROM (
  SELECT equipment_id, MAX(check_date) as latest
  FROM public.hvac_maintenance_checks
  WHERE status = 'completed'
  GROUP BY equipment_id
) sub
WHERE e.id = sub.equipment_id;
