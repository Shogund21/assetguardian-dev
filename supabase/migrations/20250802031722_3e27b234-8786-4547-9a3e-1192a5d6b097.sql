-- Make equipment_id nullable in hvac_diag_sessions for general chat sessions
ALTER TABLE public.hvac_diag_sessions 
ALTER COLUMN equipment_id DROP NOT NULL;