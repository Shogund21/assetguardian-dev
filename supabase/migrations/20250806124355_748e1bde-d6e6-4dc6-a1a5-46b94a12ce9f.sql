-- Phase 1: Add Foreign Key Constraints and Indexes for proper relationships

-- First, let's ensure data integrity by checking existing data
-- We'll add constraints that should exist between related tables

-- Add foreign key constraint from hvac_maintenance_checks to locations
ALTER TABLE public.hvac_maintenance_checks 
ADD CONSTRAINT fk_maintenance_location 
FOREIGN KEY (location_id) REFERENCES public.locations(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraint from hvac_maintenance_checks to technicians  
ALTER TABLE public.hvac_maintenance_checks 
ADD CONSTRAINT fk_maintenance_technician 
FOREIGN KEY (technician_id) REFERENCES public.technicians(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraint from hvac_maintenance_checks to equipment
ALTER TABLE public.hvac_maintenance_checks 
ADD CONSTRAINT fk_maintenance_equipment 
FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraint from hvac_maintenance_checks to companies
ALTER TABLE public.hvac_maintenance_checks 
ADD CONSTRAINT fk_maintenance_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for performance on foreign key columns
CREATE INDEX IF NOT EXISTS idx_maintenance_location_id ON public.hvac_maintenance_checks(location_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_technician_id ON public.hvac_maintenance_checks(technician_id); 
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON public.hvac_maintenance_checks(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_company_id ON public.hvac_maintenance_checks(company_id);

-- Add foreign key constraints for equipment table
ALTER TABLE public.equipment 
ADD CONSTRAINT fk_equipment_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraints for technicians table  
ALTER TABLE public.technicians 
ADD CONSTRAINT fk_technician_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraints for locations table
ALTER TABLE public.locations 
ADD CONSTRAINT fk_location_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) 
ON DELETE CASCADE ON UPDATE CASCADE;