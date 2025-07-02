-- Create audit_logs table for SOC 2 compliance
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    reason,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    p_reason,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Create failed login tracking table
CREATE TABLE public.failed_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  ip_address INET,
  user_agent TEXT,
  attempt_count INTEGER DEFAULT 1,
  last_attempt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on failed_login_attempts
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for failed_login_attempts (admin only)
CREATE POLICY "Admins can view failed login attempts" 
ON public.failed_login_attempts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create function to track failed logins
CREATE OR REPLACE FUNCTION public.track_failed_login(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_attempts INTEGER := 0;
  is_locked BOOLEAN := false;
BEGIN
  -- Check if account is currently locked
  SELECT attempt_count, 
         (locked_until IS NOT NULL AND locked_until > now()) 
  INTO current_attempts, is_locked
  FROM public.failed_login_attempts 
  WHERE email = p_email 
  ORDER BY last_attempt DESC 
  LIMIT 1;

  -- If already locked, return false
  IF is_locked THEN
    RETURN false;
  END IF;

  -- Update or insert failed attempt record
  INSERT INTO public.failed_login_attempts (email, ip_address, user_agent, attempt_count)
  VALUES (p_email, p_ip_address, p_user_agent, 1)
  ON CONFLICT (email) DO UPDATE SET
    attempt_count = CASE 
      WHEN failed_login_attempts.last_attempt < now() - INTERVAL '1 hour' THEN 1
      ELSE failed_login_attempts.attempt_count + 1
    END,
    last_attempt = now(),
    locked_until = CASE 
      WHEN failed_login_attempts.attempt_count + 1 >= 5 THEN now() + INTERVAL '30 minutes'
      ELSE NULL
    END;

  RETURN true;
END;
$$;