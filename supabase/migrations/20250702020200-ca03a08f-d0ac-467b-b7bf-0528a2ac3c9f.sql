-- Create company_users records for existing technicians with default 'technician' role
INSERT INTO public.company_users (user_id, company_id, role, is_admin)
SELECT 
  t.email::text::uuid, -- Using email as user_id for now
  t.company_id,
  'technician'::text,
  false
FROM public.technicians t
LEFT JOIN public.company_users cu ON cu.user_id = t.email::text::uuid
WHERE cu.user_id IS NULL; -- Only insert if not already exists

-- Add role column to technicians table for UI display
ALTER TABLE public.technicians 
ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'technician';

-- Create function to sync roles between tables
CREATE OR REPLACE FUNCTION public.sync_technician_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Update technicians table when company_users role changes
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    UPDATE public.technicians 
    SET user_role = NEW.role 
    WHERE email = NEW.user_id::text;
  END IF;
  
  -- Insert into company_users when technician is created
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.company_users (user_id, company_id, role, is_admin)
    VALUES (NEW.email::text::uuid, NEW.company_id, 'technician', false)
    ON CONFLICT (user_id, company_id) DO NOTHING;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic role synchronization
DROP TRIGGER IF EXISTS sync_technician_role_trigger ON public.technicians;
CREATE TRIGGER sync_technician_role_trigger
  AFTER INSERT OR UPDATE ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.sync_technician_role();

DROP TRIGGER IF EXISTS sync_company_user_role_trigger ON public.company_users;
CREATE TRIGGER sync_company_user_role_trigger
  AFTER UPDATE ON public.company_users
  FOR EACH ROW EXECUTE FUNCTION public.sync_technician_role();