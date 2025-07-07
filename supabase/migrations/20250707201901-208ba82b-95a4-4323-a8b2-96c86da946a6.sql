-- Fix technician status updates and prepare for selective account creation
-- The foreign key constraint on technicians.user_id is causing permission issues during status updates

-- Make the user_id constraint more flexible by making it properly nullable
-- This allows technicians to exist without auth accounts
ALTER TABLE public.technicians ALTER COLUMN user_id DROP NOT NULL;

-- Add account_status field to track authentication account status separately from technician status
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'no_account' CHECK (account_status IN ('no_account', 'has_account', 'account_disabled'));

-- Update existing records to reflect current state
UPDATE public.technicians 
SET account_status = CASE 
  WHEN user_id IS NOT NULL THEN 'has_account'
  ELSE 'no_account'
END;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_technicians_account_status ON public.technicians(account_status);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON public.technicians(user_id) WHERE user_id IS NOT NULL;