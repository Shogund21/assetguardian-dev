-- Remove the unreliable database trigger system and replace with Supabase Auth Hooks
-- Drop the existing trigger and functions
DROP TRIGGER IF EXISTS auth_events_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_events();
DROP FUNCTION IF EXISTS public.trigger_auth_webhook(text, jsonb, jsonb);

-- We'll now rely on Supabase's built-in auth webhook system instead of custom triggers
-- This is configured in supabase/config.toml and is much more reliable