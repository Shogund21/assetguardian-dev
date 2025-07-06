-- Create auth webhook configuration and triggers
-- This will ensure auth events trigger our custom email function

-- Create a function to call our auth webhook
CREATE OR REPLACE FUNCTION public.trigger_auth_webhook(
  event_type text,
  user_data jsonb,
  email_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text := 'https://bqxdbvrtohgkusmdmjxd.supabase.co/functions/v1/auth-emails';
  service_role_key text;
  payload jsonb;
BEGIN
  -- Get service role key from settings
  BEGIN
    service_role_key := current_setting('app.settings.service_role_key', false);
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: use a placeholder that will be replaced by Supabase
    service_role_key := 'SUPABASE_SERVICE_ROLE_KEY';
  END;
  
  -- Build the webhook payload
  payload := jsonb_build_object(
    'type', event_type,
    'user', user_data,
    'email_data', email_data
  );
  
  -- Call the webhook using pg_net extension
  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := payload
  );
END;
$$;

-- Create trigger function for auth events
CREATE OR REPLACE FUNCTION public.handle_auth_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data jsonb;
  email_data jsonb;
  event_type text;
  site_url text := 'https://www.assetguardian.ai';
BEGIN
  -- Determine event type based on trigger
  IF TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NULL THEN
    event_type := 'user.signup';
  ELSIF TG_OP = 'UPDATE' AND OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    event_type := 'user.email_confirmed';
  ELSIF TG_OP = 'UPDATE' AND NEW.recovery_sent_at IS NOT NULL AND (OLD.recovery_sent_at IS NULL OR NEW.recovery_sent_at > OLD.recovery_sent_at) THEN
    event_type := 'user.password_recovery';
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Build user data
  user_data := jsonb_build_object(
    'id', COALESCE(NEW.id, OLD.id),
    'email', COALESCE(NEW.email, OLD.email),
    'user_metadata', COALESCE(NEW.raw_user_meta_data, OLD.raw_user_meta_data, '{}'::jsonb)
  );
  
  -- Build email data based on event type
  IF event_type = 'user.signup' THEN
    email_data := jsonb_build_object(
      'token', COALESCE(NEW.confirmation_token, ''),
      'token_hash', COALESCE(NEW.confirmation_token, ''),
      'redirect_to', site_url,
      'email_action_type', 'signup',
      'site_url', site_url
    );
  ELSIF event_type = 'user.password_recovery' THEN
    email_data := jsonb_build_object(
      'token', COALESCE(NEW.recovery_token, ''),
      'token_hash', COALESCE(NEW.recovery_token, ''),
      'redirect_to', site_url || '/reset-password',
      'email_action_type', 'recovery',
      'site_url', site_url
    );
  ELSE
    -- Default email data to prevent null issues
    email_data := jsonb_build_object(
      'token', '',
      'token_hash', '',
      'redirect_to', site_url,
      'email_action_type', 'unknown',
      'site_url', site_url
    );
  END IF;
  
  -- Trigger the webhook (async)
  PERFORM public.trigger_auth_webhook(event_type, user_data, email_data);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on auth.users table to handle signup and password recovery
DROP TRIGGER IF EXISTS auth_events_trigger ON auth.users;
CREATE TRIGGER auth_events_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_events();

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;