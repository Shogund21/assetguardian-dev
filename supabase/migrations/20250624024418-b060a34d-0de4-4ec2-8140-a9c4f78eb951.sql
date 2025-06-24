
-- Add the missing reading_mode column to hvac_maintenance_checks table
ALTER TABLE public.hvac_maintenance_checks 
ADD COLUMN reading_mode text DEFAULT 'standard';

-- Update existing records to have the standard reading mode
UPDATE public.hvac_maintenance_checks 
SET reading_mode = 'standard' 
WHERE reading_mode IS NULL;
