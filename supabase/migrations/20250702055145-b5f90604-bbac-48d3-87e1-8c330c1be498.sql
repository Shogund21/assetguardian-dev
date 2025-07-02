-- Add company_name field to technicians table for registration
ALTER TABLE public.technicians 
ADD COLUMN IF NOT EXISTS company_name TEXT;