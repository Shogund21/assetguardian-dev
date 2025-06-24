
-- First, let's check what columns actually exist in the equipment table
-- and rename the column to match our TypeScript interface
ALTER TABLE public.equipment 
RENAME COLUMN "serialNumber" TO serial_number;

-- Also ensure we have the missing columns that are referenced in the Equipment interface
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Also ensure we have a type column if it's expected
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS type VARCHAR;

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS equipment_updated_at_trigger ON public.equipment;
CREATE TRIGGER equipment_updated_at_trigger
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_updated_at();
