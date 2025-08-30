-- Create a function to handle access request approval and technician creation
CREATE OR REPLACE FUNCTION public.approve_access_request_and_create_technician(
  p_request_id uuid,
  p_reviewed_by text,
  p_demo_company_name text DEFAULT 'Demo Facilities Inc.'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record record;
  demo_company_id uuid;
  new_technician_id uuid;
  result json;
BEGIN
  -- Get the access request details
  SELECT * INTO request_record
  FROM public.access_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF request_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access request not found or already processed'
    );
  END IF;
  
  -- Get or create demo company
  SELECT id INTO demo_company_id
  FROM public.companies
  WHERE name = p_demo_company_name AND is_trial = true;
  
  IF demo_company_id IS NULL THEN
    -- Create demo company if it doesn't exist
    INSERT INTO public.companies (name, is_trial, trial_expires_at)
    VALUES (p_demo_company_name, true, now() + INTERVAL '30 days')
    RETURNING id INTO demo_company_id;
  END IF;
  
  -- Update the access request status
  UPDATE public.access_requests
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = p_reviewed_by
  WHERE id = p_request_id;
  
  -- Create the technician record with company_id
  INSERT INTO public.technicians (
    "firstName",
    "lastName", 
    email,
    phone,
    specialization,
    company_id,
    company_name,
    user_role,
    status,
    account_status
  ) VALUES (
    request_record.first_name,
    request_record.last_name,
    request_record.email,
    COALESCE(request_record.phone, ''),
    'General',
    demo_company_id,
    p_demo_company_name,
    'technician',
    'active',
    'no_account'
  ) RETURNING id INTO new_technician_id;
  
  -- Create company user record
  INSERT INTO public.company_users (
    user_id,
    company_id,
    role,
    is_admin
  ) VALUES (
    request_record.email,
    demo_company_id,
    'technician',
    false
  ) ON CONFLICT (user_id, company_id) DO NOTHING;
  
  -- Log the audit event
  PERFORM log_audit_event(
    'CREATE',
    'technicians',
    new_technician_id,
    null,
    json_build_object(
      'firstName', request_record.first_name,
      'lastName', request_record.last_name,
      'email', request_record.email,
      'company_id', demo_company_id
    )::jsonb,
    'Technician created from approved access request'
  );
  
  RETURN json_build_object(
    'success', true,
    'technician_id', new_technician_id,
    'company_id', demo_company_id,
    'message', 'Access request approved and technician created successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;