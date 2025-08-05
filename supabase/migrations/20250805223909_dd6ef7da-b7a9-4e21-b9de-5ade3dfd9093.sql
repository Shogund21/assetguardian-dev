-- Step 1: Simply drop all existing versions of get_maintenance_history to resolve conflicts
DROP FUNCTION IF EXISTS public.get_maintenance_history(uuid, uuid, uuid, uuid, timestamp with time zone, timestamp with time zone, integer);
DROP FUNCTION IF EXISTS public.get_maintenance_history(uuid, uuid, integer, integer);
DROP FUNCTION IF EXISTS public.get_maintenance_history(uuid, uuid, uuid, uuid, timestamp with time zone, timestamp with time zone, integer, integer);