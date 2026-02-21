CREATE OR REPLACE FUNCTION public.is_chiller_asset(equipment_row public.equipment)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(equipment_row.type) LIKE '%chiller%';
$$;