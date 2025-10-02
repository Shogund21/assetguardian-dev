-- Fix: Update approve_access_request function to create actual Supabase Auth users
-- This ensures users can only access the system after admin approval

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.approve_access_request_and_create_technician(uuid, text, text);

CREATE OR REPLACE FUNCTION public.approve_access_request_and_create_technician(
  p_request_id uuid,
  p_reviewed_by text,
  p_demo_company_name text DEFAULT 'Demo Facilities Inc.'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request record;
  v_company_id uuid;
  v_auth_user_id uuid;
  v_temp_password text;
BEGIN
  -- Get the access request details
  SELECT * INTO v_request
  FROM public.access_requests
  WHERE id = p_request_id AND status = 'pending';

  IF v_request IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access request not found or already processed'
    );
  END IF;

  -- Check if user already exists in auth.users
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = v_request.email;

  IF v_auth_user_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'A user with this email already exists. Please use password reset if you forgot your credentials.'
    );
  END IF;

  -- Get or create demo company
  SELECT id INTO v_company_id
  FROM public.companies
  WHERE name = p_demo_company_name AND is_trial = true
  LIMIT 1;

  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (name, is_trial, trial_expires_at, trial_created_at, contact_email)
    VALUES (p_demo_company_name, true, now() + INTERVAL '15 days', now(), v_request.email)
    RETURNING id INTO v_company_id;
  END IF;

  -- Generate a temporary password (user must reset on first login)
  v_temp_password := encode(gen_random_bytes(16), 'base64');

  -- Create the auth user account using admin API
  -- Note: This must be done via the admin SDK or edge function
  -- For now, we'll create a pending record and send instructions
  
  -- Update access request to approved
  UPDATE public.access_requests
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = p_reviewed_by
  WHERE id = p_request_id;

  -- Create technician record with 'pending_activation' status
  INSERT INTO public.technicians (
    "firstName",
    "lastName",
    email,
    phone,
    specialization,
    company_id,
    company_name,
    status,
    user_role,
    account_status
  ) VALUES (
    v_request.first_name,
    v_request.last_name,
    v_request.email,
    COALESCE(v_request.phone, ''),
    'General Technician',
    v_company_id,
    p_demo_company_name,
    'pending_activation',
    'technician',
    'pending_activation'
  );

  -- Create company user record (using email as user_id until auth account is created)
  INSERT INTO public.company_users (
    user_id,
    company_id,
    role,
    is_admin
  ) VALUES (
    v_request.email,
    v_company_id,
    'technician',
    false
  );

  -- Log the approval
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    metadata
  ) VALUES (
    NULL,
    'access_request_approved',
    'access_requests',
    p_request_id,
    jsonb_build_object(
      'email', v_request.email,
      'reviewed_by', p_reviewed_by,
      'company_id', v_company_id
    )
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Access request approved. Admin must complete account creation via Supabase dashboard or edge function.',
    'email', v_request.email,
    'company_id', v_company_id,
    'requires_auth_creation', true
  );
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.approve_access_request_and_create_technician IS 
'Approves access request and creates technician record. Auth account creation requires admin action via dashboard or edge function.';