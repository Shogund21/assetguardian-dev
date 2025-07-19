-- Add conductivity fields to hvac_maintenance_checks table for cooling tower inspections
ALTER TABLE public.hvac_maintenance_checks 
ADD COLUMN city_conductivity_us_cm numeric,
ADD COLUMN tower_conductivity_us_cm numeric;