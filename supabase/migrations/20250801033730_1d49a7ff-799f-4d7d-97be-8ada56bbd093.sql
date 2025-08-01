-- Create admin password reset notification function
CREATE OR REPLACE FUNCTION public.admin_send_password_reset_email(
  p_user_email text,
  p_admin_notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  reset_token text;
  notification_id uuid;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access denied: Admin privileges required'
    );
  END IF;
  
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = p_user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Generate a secure token for tracking
  reset_token := encode(digest(gen_random_uuid()::text || now()::text, 'sha256'), 'hex');
  
  -- Insert notification record
  INSERT INTO public.password_reset_notifications (
    user_id,
    user_email,
    admin_id,
    admin_notes,
    tracking_token,
    status
  ) VALUES (
    target_user_id,
    p_user_email,
    auth.uid(),
    p_admin_notes,
    reset_token,
    'initiated'
  ) RETURNING id INTO notification_id;
  
  -- Log the admin action
  PERFORM log_audit_event(
    'admin_password_reset_initiated',
    'auth.users',
    target_user_id,
    null,
    json_build_object(
      'admin_id', auth.uid(),
      'user_email', p_user_email,
      'tracking_token', reset_token,
      'admin_notes', p_admin_notes
    )::jsonb
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password reset notification created',
    'notification_id', notification_id,
    'tracking_token', reset_token
  );
END;
$$;

-- Create password reset notifications table
CREATE TABLE IF NOT EXISTS public.password_reset_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  admin_id uuid NOT NULL,
  admin_notes text,
  tracking_token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'email_sent', 'completed', 'failed')),
  supabase_reset_initiated_at timestamp with time zone,
  custom_email_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on password reset notifications
ALTER TABLE public.password_reset_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for password reset notifications
CREATE POLICY "Admins can view all password reset notifications"
  ON public.password_reset_notifications
  FOR SELECT
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can create password reset notifications"
  ON public.password_reset_notifications
  FOR INSERT
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update password reset notifications"
  ON public.password_reset_notifications
  FOR UPDATE
  USING (public.is_current_user_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_password_reset_notifications_updated_at
  BEFORE UPDATE ON public.password_reset_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();