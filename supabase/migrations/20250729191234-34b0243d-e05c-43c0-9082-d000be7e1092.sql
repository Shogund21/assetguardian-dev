-- Create secure admin verification function
CREATE OR REPLACE FUNCTION public.verify_admin_access(
  user_email text,
  provided_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  stored_hash text;
  is_valid boolean := false;
BEGIN
  -- Get stored password hash for this user from secure admin table
  SELECT password_hash INTO stored_hash
  FROM public.admin_passwords 
  WHERE email = user_email AND is_active = true;
  
  -- Verify password using crypt function
  IF stored_hash IS NOT NULL THEN
    is_valid := (crypt(provided_password, stored_hash) = stored_hash);
  END IF;
  
  -- Log the attempt
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    metadata
  ) VALUES (
    (SELECT id FROM auth.users WHERE email = user_email LIMIT 1),
    'admin_access_attempt',
    'admin_passwords',
    json_build_object(
      'email', user_email,
      'success', is_valid,
      'timestamp', now()
    )::jsonb
  );
  
  RETURN json_build_object('is_valid', is_valid);
END;
$$;

-- Create admin passwords table for secure storage
CREATE TABLE IF NOT EXISTS public.admin_passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_passwords ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role only access"
ON public.admin_passwords
FOR ALL
TO service_role
USING (true);

-- Update existing database functions to use SET search_path = ''
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'edward@shogunaillc.com'
      LIMIT 1
    )) OR
    EXISTS (
      SELECT 1 FROM public.company_users cu 
      WHERE cu.user_id = 'edward@shogunaillc.com'
      AND cu.role = 'super_admin'
      LIMIT 1
    )
  );
END;
$$;

-- Update other security definer functions
CREATE OR REPLACE FUNCTION public.is_member_of(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.company_users cu
    WHERE cu.company_id = is_member_of.company_id 
    AND (
      cu.user_id = (auth.uid())::text OR
      cu.user_id = (
        SELECT email 
        FROM auth.users 
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );
END;
$$;