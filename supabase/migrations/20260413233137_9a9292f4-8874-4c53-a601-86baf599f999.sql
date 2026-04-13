
-- 1. Fix locations table: drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their organization's locations" ON public.locations;

-- 2. Fix locations table: restrict DELETE and UPDATE to company members
DROP POLICY IF EXISTS "Users can delete locations" ON public.locations;
DROP POLICY IF EXISTS "Users can update locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can delete locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can update locations" ON public.locations;

CREATE POLICY "Members can update their company locations"
ON public.locations FOR UPDATE TO authenticated
USING (public.is_member_of(company_id) OR public.can_access_all_data())
WITH CHECK (public.is_member_of(company_id) OR public.can_access_all_data());

CREATE POLICY "Members can delete their company locations"
ON public.locations FOR DELETE TO authenticated
USING (public.is_member_of(company_id) OR public.can_access_all_data());

-- 3. Fix admin_users: remove public readable policy, restrict to admins
DROP POLICY IF EXISTS "Enable read access for all users" ON public.admin_users;

CREATE POLICY "Only admins can read admin_users"
ON public.admin_users FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.can_access_all_data());

-- 4. Make registrations bucket private
UPDATE storage.buckets SET public = false WHERE id = 'registrations';

-- Drop overly permissive storage policies on registrations bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view registrations" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload registrations" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update registrations" ON storage.objects;

-- Create restricted policies for registrations bucket
CREATE POLICY "Authenticated users can view registrations"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'registrations');

CREATE POLICY "Authenticated users can upload registrations"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'registrations');

CREATE POLICY "Authenticated users can update registrations"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'registrations');

-- 5. Fix SECURITY DEFINER functions missing search_path

-- set_work_order_company
CREATE OR REPLACE FUNCTION public.set_work_order_company()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
begin
  if new.asset_id is not null then
    select e.company_id into new.company_id
    from public.equipment e
    where e.id = new.asset_id;
  end if;
  return new;
end;
$function$;

-- handle_new_phone_user
CREATE OR REPLACE FUNCTION public.handle_new_phone_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.phone_users (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$function$;

-- set_claim
CREATE OR REPLACE FUNCTION public.set_claim(uid uuid, claim text, value text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    json_build_object(claim, value)::jsonb
  WHERE id = uid;
END;
$function$;

-- get_user_company
CREATE OR REPLACE FUNCTION public.get_user_company()
RETURNS TABLE(company json) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name
    ) AS company
  FROM 
    public.companies c
  JOIN 
    public.company_users cu ON c.id = cu.company_id
  WHERE 
    cu.user_id = auth.uid()
  LIMIT 1;
END;
$function$;

-- super_admin_exists
CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'edward@shogunaillc.com'
  );
$function$;

-- get_demo_company_id
CREATE OR REPLACE FUNCTION public.get_demo_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT id 
    FROM public.companies 
    WHERE name = 'Demo Facilities Inc.' 
    AND is_trial = true 
    LIMIT 1;
$function$;

-- assign_user_to_demo_company
CREATE OR REPLACE FUNCTION public.assign_user_to_demo_company(p_user_email text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    demo_company_id uuid;
BEGIN
    demo_company_id := public.get_demo_company_id();
    IF demo_company_id IS NULL THEN
        RAISE EXCEPTION 'Demo company not found';
    END IF;
    INSERT INTO public.company_users (user_id, company_id, role, is_admin)
    VALUES (p_user_email, demo_company_id, 'demo_user', false)
    ON CONFLICT (user_id, company_id) DO NOTHING;
    RETURN demo_company_id;
END;
$function$;

-- is_demo_user
CREATE OR REPLACE FUNCTION public.is_demo_user(p_user_id text DEFAULT NULL::text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.company_users cu
        JOIN public.companies c ON c.id = cu.company_id
        WHERE cu.user_id = COALESCE(p_user_id, (auth.uid())::text)
        AND c.name = 'Demo Facilities Inc.'
        AND c.is_trial = true
        AND cu.role = 'demo_user'
    );
$function$;

-- get_all_companies_for_super_admin
CREATE OR REPLACE FUNCTION public.get_all_companies_for_super_admin()
RETURNS TABLE(id uuid, name text, logo_url text, address text, contact_email text, contact_phone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT c.id, c.name, c.logo_url, c.address, c.contact_email, c.contact_phone, c.created_at, c.updated_at
  FROM public.companies c
  WHERE public.is_super_admin()
  ORDER BY c.name;
$function$;

-- set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event(p_action text, p_table_name text, p_record_id uuid DEFAULT NULL::uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_reason text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, reason, metadata)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values, p_reason, p_metadata)
  RETURNING id INTO audit_id;
  RETURN audit_id;
END;
$function$;

-- track_failed_login
CREATE OR REPLACE FUNCTION public.track_failed_login(p_email text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_attempts INTEGER := 0;
  is_locked BOOLEAN := false;
BEGIN
  SELECT attempt_count, (locked_until IS NOT NULL AND locked_until > now())
  INTO current_attempts, is_locked
  FROM public.failed_login_attempts WHERE email = p_email ORDER BY last_attempt DESC LIMIT 1;
  IF is_locked THEN RETURN false; END IF;
  INSERT INTO public.failed_login_attempts (email, ip_address, user_agent, attempt_count)
  VALUES (p_email, p_ip_address, p_user_agent, 1)
  ON CONFLICT (email) DO UPDATE SET
    attempt_count = CASE WHEN failed_login_attempts.last_attempt < now() - INTERVAL '1 hour' THEN 1 ELSE failed_login_attempts.attempt_count + 1 END,
    last_attempt = now(),
    locked_until = CASE WHEN failed_login_attempts.attempt_count + 1 >= 5 THEN now() + INTERVAL '30 minutes' ELSE NULL END;
  RETURN true;
END;
$function$;

-- update_technician_role
CREATE OR REPLACE FUNCTION public.update_technician_role(p_technician_id uuid, p_new_role text, p_is_admin boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.technicians SET user_role = p_new_role WHERE id = p_technician_id;
  INSERT INTO public.company_users (user_id, company_id, role, is_admin)
  SELECT t.email, t.company_id, p_new_role, p_is_admin
  FROM public.technicians t WHERE t.id = p_technician_id
  ON CONFLICT (user_id, company_id) DO UPDATE SET role = EXCLUDED.role, is_admin = EXCLUDED.is_admin;
END;
$function$;

-- get_technicians_with_roles
CREATE OR REPLACE FUNCTION public.get_technicians_with_roles()
RETURNS TABLE(id uuid, "firstName" character varying, "lastName" character varying, email character varying, phone character varying, specialization character varying, company_id uuid, user_role text, is_admin boolean, company_name text, status character varying, "isAvailable" boolean, account_status text, user_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT t.id, t."firstName", t."lastName", t.email, t.phone, t.specialization, t.company_id,
    COALESCE(t.user_role, 'technician') as user_role, COALESCE(cu.is_admin, false) as is_admin,
    t.company_name, COALESCE(t.status, 'active') as status, COALESCE(t."isAvailable", true) as "isAvailable",
    COALESCE(t.account_status, 'no_account') as account_status, t.user_id
  FROM public.technicians t
  LEFT JOIN public.company_users cu ON cu.user_id = t.email AND cu.company_id = t.company_id
  ORDER BY t."firstName";
END;
$function$;

-- log_user_activity
CREATE OR REPLACE FUNCTION public.log_user_activity(p_user_id uuid, p_session_id text, p_activity_type text, p_page_route text DEFAULT NULL::text, p_feature_name text DEFAULT NULL::text, p_component_name text DEFAULT NULL::text, p_action_details jsonb DEFAULT NULL::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE activity_id uuid;
BEGIN
  INSERT INTO public.user_activities (user_id, session_id, activity_type, page_route, feature_name, component_name, action_details)
  VALUES (p_user_id, p_session_id, p_activity_type, p_page_route, p_feature_name, p_component_name, p_action_details)
  RETURNING id INTO activity_id;
  RETURN activity_id;
END;
$function$;

-- log_performance_metric
CREATE OR REPLACE FUNCTION public.log_performance_metric(p_user_id uuid, p_session_id text, p_metric_type text, p_page_route text DEFAULT NULL::text, p_load_time_ms integer DEFAULT NULL::integer, p_api_endpoint text DEFAULT NULL::text, p_response_time_ms integer DEFAULT NULL::integer, p_error_occurred boolean DEFAULT false, p_error_message text DEFAULT NULL::text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE metric_id uuid;
BEGIN
  INSERT INTO public.performance_metrics (user_id, session_id, metric_type, page_route, load_time_ms, api_endpoint, response_time_ms, error_occurred, error_message)
  VALUES (p_user_id, p_session_id, p_metric_type, p_page_route, p_load_time_ms, p_api_endpoint, p_response_time_ms, p_error_occurred, p_error_message)
  RETURNING id INTO metric_id;
  RETURN metric_id;
END;
$function$;

-- start_user_session
CREATE OR REPLACE FUNCTION public.start_user_session(p_user_id uuid, p_session_id text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE session_uuid uuid;
BEGIN
  INSERT INTO public.user_sessions (user_id, session_id, ip_address, user_agent)
  VALUES (p_user_id, p_session_id, p_ip_address, p_user_agent)
  RETURNING id INTO session_uuid;
  RETURN session_uuid;
END;
$function$;

-- end_user_session
CREATE OR REPLACE FUNCTION public.end_user_session(p_session_id text, p_pages_visited integer DEFAULT 0, p_actions_count integer DEFAULT 0)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.user_sessions 
  SET ended_at = now(), duration_seconds = EXTRACT(EPOCH FROM (now() - started_at)), pages_visited = p_pages_visited, actions_count = p_actions_count
  WHERE session_id = p_session_id;
END;
$function$;

-- debug_auth_uid
CREATE OR REPLACE FUNCTION public.debug_auth_uid()
RETURNS TABLE(auth_uid uuid, current_user_name text, session_user_name text, has_jwt boolean)
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT auth.uid() as auth_uid, current_user as current_user_name, session_user as session_user_name, (current_setting('request.jwt.claims', true) IS NOT NULL) as has_jwt;
$function$;

-- update_equipment_maintenance_schedule
CREATE OR REPLACE FUNCTION public.update_equipment_maintenance_schedule()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW."lastMaintenance" IS NOT NULL AND 
     (OLD."lastMaintenance" IS NULL OR NEW."lastMaintenance" != OLD."lastMaintenance") THEN
    NEW."nextMaintenance" := NEW."lastMaintenance" + INTERVAL '3 months';
  END IF;
  RETURN NEW;
END;
$function$;

-- get_audit_logs_with_profiles
CREATE OR REPLACE FUNCTION public.get_audit_logs_with_profiles(p_start_date timestamp with time zone DEFAULT NULL, p_end_date timestamp with time zone DEFAULT NULL, p_table_name text DEFAULT NULL, p_action text DEFAULT NULL, p_user_id uuid DEFAULT NULL, p_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, user_id uuid, action text, table_name text, record_id uuid, old_values jsonb, new_values jsonb, reason text, metadata jsonb, created_at timestamp with time zone, ip_address inet, user_agent text, session_id text, user_first_name text, user_last_name text, user_email text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT al.id, al.user_id, al.action, al.table_name, al.record_id, al.old_values, al.new_values, al.reason, al.metadata, al.created_at, al.ip_address, al.user_agent, al.session_id, p.first_name, p.last_name, p.email
  FROM public.audit_logs al LEFT JOIN public.profiles p ON p.id = al.user_id
  WHERE (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
    AND (p_table_name IS NULL OR al.table_name = p_table_name)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
  ORDER BY al.created_at DESC LIMIT LEAST(p_limit, 1000);
END;
$function$;

-- get_super_admin_user_ids
CREATE OR REPLACE FUNCTION public.get_super_admin_user_ids()
RETURNS TABLE(user_id uuid) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT id FROM auth.users WHERE email = 'edward@shogunaillc.com';
$function$;

-- get_user_activities_with_profiles
CREATE OR REPLACE FUNCTION public.get_user_activities_with_profiles(p_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, user_id uuid, session_id text, activity_type text, page_route text, feature_name text, component_name text, action_details jsonb, timestamp_utc timestamp with time zone, created_at timestamp with time zone, user_first_name text, user_last_name text, user_email text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT ua.id, ua.user_id, ua.session_id, ua.activity_type, ua.page_route, ua.feature_name, ua.component_name, ua.action_details, ua.timestamp_utc, ua.created_at, p.first_name, p.last_name, p.email
  FROM public.user_activities ua LEFT JOIN public.profiles p ON p.id = ua.user_id
  ORDER BY ua.created_at DESC LIMIT LEAST(p_limit, 1000);
END;
$function$;

-- get_user_sessions_with_profiles
CREATE OR REPLACE FUNCTION public.get_user_sessions_with_profiles(p_limit integer DEFAULT 10)
RETURNS TABLE(id uuid, user_id uuid, session_id text, started_at timestamp with time zone, ended_at timestamp with time zone, duration_seconds integer, pages_visited integer, actions_count integer, ip_address inet, user_agent text, created_at timestamp with time zone, user_first_name text, user_last_name text, user_email text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT us.id, us.user_id, us.session_id, us.started_at, us.ended_at, us.duration_seconds, us.pages_visited, us.actions_count, us.ip_address, us.user_agent, us.created_at, p.first_name, p.last_name, p.email
  FROM public.user_sessions us LEFT JOIN public.profiles p ON p.id = us.user_id
  ORDER BY us.created_at DESC LIMIT LEAST(p_limit, 100);
END;
$function$;

-- get_performance_metrics_with_profiles
CREATE OR REPLACE FUNCTION public.get_performance_metrics_with_profiles(p_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, user_id uuid, session_id text, metric_type text, page_route text, load_time_ms integer, api_endpoint text, response_time_ms integer, error_occurred boolean, error_message text, timestamp_utc timestamp with time zone, created_at timestamp with time zone, user_first_name text, user_last_name text, user_email text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT pm.id, pm.user_id, pm.session_id, pm.metric_type, pm.page_route, pm.load_time_ms, pm.api_endpoint, pm.response_time_ms, pm.error_occurred, pm.error_message, pm.timestamp_utc, pm.created_at, p.first_name, p.last_name, p.email
  FROM public.performance_metrics pm LEFT JOIN public.profiles p ON p.id = pm.user_id
  ORDER BY pm.created_at DESC LIMIT LEAST(p_limit, 1000);
END;
$function$;

-- set_project_status
CREATE OR REPLACE FUNCTION public.set_project_status(p_project_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE project_company_id uuid;
BEGIN
  SELECT company_id INTO project_company_id FROM public.projects WHERE id = p_project_id;
  IF project_company_id IS NULL THEN RAISE EXCEPTION 'Project not found'; END IF;
  IF NOT (public.can_access_all_data() OR public.is_member_of(project_company_id)) THEN
    RAISE EXCEPTION 'Access denied: user not authorized for this project';
  END IF;
  UPDATE public.projects SET status = p_status, updatedat = now() WHERE id = p_project_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Project update failed'; END IF;
END;
$function$;

-- create_trial_company
CREATE OR REPLACE FUNCTION public.create_trial_company(p_company_name text, p_user_email text, p_user_first_name text DEFAULT 'Trial'::text, p_user_last_name text DEFAULT 'User'::text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    trial_company_id uuid;
    trial_expires timestamp with time zone;
BEGIN
    trial_expires := now() + INTERVAL '15 days';
    INSERT INTO public.companies (name, is_trial, trial_expires_at, trial_created_at, contact_email)
    VALUES (p_company_name, true, trial_expires, now(), p_user_email)
    RETURNING id INTO trial_company_id;
    INSERT INTO public.company_users (user_id, company_id, role, is_admin)
    VALUES (p_user_email, trial_company_id, 'admin', true);
    INSERT INTO public.technicians ("firstName", "lastName", email, phone, specialization, company_id, company_name, user_role, status)
    VALUES (p_user_first_name, p_user_last_name, p_user_email, '(555) 123-4567', 'HVAC Specialist', trial_company_id, p_company_name, 'admin', 'active');
    RETURN trial_company_id;
END;
$function$;

-- is_trial_expired
CREATE OR REPLACE FUNCTION public.is_trial_expired(p_company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT CASE WHEN c.is_trial = true AND c.trial_expires_at < now() THEN true ELSE false END
    FROM public.companies c WHERE c.id = p_company_id;
$function$;

-- get_trial_info
CREATE OR REPLACE FUNCTION public.get_trial_info(p_company_id uuid)
RETURNS TABLE(is_trial boolean, expires_at timestamp with time zone, days_remaining integer, is_expired boolean)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT c.is_trial, c.trial_expires_at,
      CASE WHEN c.trial_expires_at IS NOT NULL THEN EXTRACT(EPOCH FROM (c.trial_expires_at - now()))::integer / 86400 ELSE NULL END as days_remaining,
      CASE WHEN c.is_trial = true AND c.trial_expires_at < now() THEN true ELSE false END as is_expired
    FROM public.companies c WHERE c.id = p_company_id;
$function$;

-- delete_project
CREATE OR REPLACE FUNCTION public.delete_project(p_project_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    project_company_id UUID;
    deleted_count INTEGER;
    project_name TEXT;
BEGIN
    SELECT company_id, name INTO project_company_id, project_name FROM public.projects WHERE id = p_project_id;
    IF project_company_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'Project not found', 'code', 'NOT_FOUND'); END IF;
    IF NOT (can_access_all_data() OR is_member_of(project_company_id)) THEN RETURN json_build_object('success', false, 'error', 'Access denied', 'code', 'ACCESS_DENIED'); END IF;
    DELETE FROM public.projects WHERE id = p_project_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count = 0 THEN RETURN json_build_object('success', false, 'error', 'Delete failed', 'code', 'DELETE_FAILED'); END IF;
    PERFORM log_audit_event('DELETE', 'projects', p_project_id, json_build_object('name', project_name)::jsonb, null, 'Project deleted');
    RETURN json_build_object('success', true, 'deleted_count', deleted_count, 'message', 'Project deleted successfully');
END;
$function$;

-- set_project_priority
CREATE OR REPLACE FUNCTION public.set_project_priority(p_project_id uuid, p_priority text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE project_company_id uuid;
BEGIN
  SELECT company_id INTO project_company_id FROM public.projects WHERE id = p_project_id;
  IF project_company_id IS NULL THEN RAISE EXCEPTION 'Project not found'; END IF;
  IF NOT (public.can_access_all_data() OR public.is_member_of(project_company_id)) THEN
    RAISE EXCEPTION 'Access denied: user not authorized for this project';
  END IF;
  UPDATE public.projects SET priority = p_priority, updatedat = now() WHERE id = p_project_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Project update failed'; END IF;
END;
$function$;

-- delete_equipment
CREATE OR REPLACE FUNCTION public.delete_equipment(p_equipment_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    equipment_company_id UUID;
    deleted_count INTEGER;
    equipment_name TEXT;
BEGIN
    SELECT company_id, name INTO equipment_company_id, equipment_name FROM public.equipment WHERE id = p_equipment_id;
    IF equipment_company_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'Equipment not found', 'code', 'NOT_FOUND'); END IF;
    IF NOT (can_access_all_data() OR is_member_of(equipment_company_id)) THEN RETURN json_build_object('success', false, 'error', 'Access denied', 'code', 'ACCESS_DENIED'); END IF;
    DELETE FROM public.equipment WHERE id = p_equipment_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count = 0 THEN RETURN json_build_object('success', false, 'error', 'Delete failed', 'code', 'DELETE_FAILED'); END IF;
    PERFORM log_audit_event('DELETE', 'equipment', p_equipment_id, json_build_object('name', equipment_name)::jsonb, null, 'Equipment deleted');
    RETURN json_build_object('success', true, 'deleted_count', deleted_count, 'message', 'Equipment deleted successfully');
END;
$function$;

-- generate_demo_data
CREATE OR REPLACE FUNCTION public.generate_demo_data(p_company_id uuid, p_company_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    location_ids uuid[];
    equipment_ids uuid[];
    technician_ids uuid[];
    project_ids uuid[];
    i integer;
    temp_id uuid;
BEGIN
    INSERT INTO public.locations (name, store_number, company_id, is_active) VALUES
    ('Main Office Building', 'LOC001', p_company_id, true),
    ('Warehouse Facility', 'LOC002', p_company_id, true),
    ('Retail Store - Downtown', 'LOC003', p_company_id, true),
    ('Manufacturing Plant', 'LOC004', p_company_id, true),
    ('Distribution Center', 'LOC005', p_company_id, true)
    RETURNING ARRAY_AGG(id) INTO location_ids;

    INSERT INTO public.technicians ("firstName", "lastName", email, phone, specialization, company_id, company_name, user_role, status) VALUES
    ('John', 'Anderson', 'j.anderson@demo.com', '(555) 101-2001', 'HVAC Systems', p_company_id, p_company_name, 'technician', 'active'),
    ('Sarah', 'Mitchell', 's.mitchell@demo.com', '(555) 101-2002', 'Electrical Systems', p_company_id, p_company_name, 'technician', 'active'),
    ('Mike', 'Rodriguez', 'm.rodriguez@demo.com', '(555) 101-2003', 'Refrigeration', p_company_id, p_company_name, 'technician', 'active'),
    ('Emily', 'Chen', 'e.chen@demo.com', '(555) 101-2004', 'Building Automation', p_company_id, p_company_name, 'senior_technician', 'active')
    RETURNING ARRAY_AGG(id) INTO technician_ids;

    INSERT INTO public.equipment (name, type, model, serial_number, location, status, company_id, "lastMaintenance", "nextMaintenance") VALUES
    ('Main HVAC Unit - Building A', 'AHU', 'Trane XR95', 'TRN-2023-001', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '30 days', now() + INTERVAL '60 days'),
    ('Chiller System - Primary', 'Chiller', 'York YK-400', 'YRK-2022-045', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '15 days', now() + INTERVAL '75 days'),
    ('Warehouse HVAC - Zone 1', 'RTU', 'Carrier 50TC', 'CAR-2023-012', 'Warehouse Facility', 'needs_attention', p_company_id, now() - INTERVAL '45 days', now() + INTERVAL '15 days'),
    ('Cooling Tower - West', 'Cooling Tower', 'BAC VTI-1500', 'BAC-2021-089', 'Manufacturing Plant', 'operational', p_company_id, now() - INTERVAL '20 days', now() + INTERVAL '70 days'),
    ('Emergency Generator', 'Generator', 'Caterpillar C15', 'CAT-2022-156', 'Distribution Center', 'operational', p_company_id, now() - INTERVAL '10 days', now() + INTERVAL '80 days'),
    ('Retail Store AC Unit 1', 'Split System', 'Mitsubishi MSZ-FH', 'MIT-2023-078', 'Retail Store - Downtown', 'operational', p_company_id, now() - INTERVAL '25 days', now() + INTERVAL '65 days'),
    ('Retail Store AC Unit 2', 'Split System', 'Mitsubishi MSZ-FH', 'MIT-2023-079', 'Retail Store - Downtown', 'under_maintenance', p_company_id, now() - INTERVAL '5 days', now() + INTERVAL '25 days'),
    ('Warehouse Exhaust Fan', 'Exhaust Fan', 'Greenheck SQ-36', 'GRN-2022-234', 'Warehouse Facility', 'operational', p_company_id, now() - INTERVAL '35 days', now() + INTERVAL '55 days'),
    ('Office Building Elevator 1', 'Elevator', 'Otis Gen2', 'OTS-2020-445', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '40 days', now() + INTERVAL '50 days'),
    ('Restroom Exhaust System', 'Exhaust System', 'Broan-NuTone', 'BRN-2023-067', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '20 days', now() + INTERVAL '70 days')
    RETURNING ARRAY_AGG(id) INTO equipment_ids;

    INSERT INTO public.projects (name, description, status, priority, location, company_id, startdate, enddate) VALUES
    ('Annual HVAC System Upgrade', 'Comprehensive upgrade of main HVAC systems across all facilities', 'in_progress', 'high', 'Main Office Building', p_company_id, now() - INTERVAL '30 days', now() + INTERVAL '60 days'),
    ('Energy Efficiency Assessment', 'Complete energy audit and efficiency improvements for warehouse', 'planning', 'medium', 'Warehouse Facility', p_company_id, now() + INTERVAL '15 days', now() + INTERVAL '90 days'),
    ('Emergency System Maintenance', 'Quarterly maintenance of all emergency and backup systems', 'completed', 'high', 'All Locations', p_company_id, now() - INTERVAL '60 days', now() - INTERVAL '5 days'),
    ('Retail Store Climate Control', 'Installation of new climate control system for downtown store', 'in_progress', 'medium', 'Retail Store - Downtown', p_company_id, now() - INTERVAL '20 days', now() + INTERVAL '30 days'),
    ('Preventive Maintenance Schedule', 'Implementation of comprehensive preventive maintenance program', 'planning', 'low', 'All Locations', p_company_id, now() + INTERVAL '30 days', now() + INTERVAL '120 days')
    RETURNING ARRAY_AGG(id) INTO project_ids;

    FOR i IN 1..25 LOOP
        INSERT INTO public.hvac_maintenance_checks (equipment_id, technician_id, company_id, location_id, check_date, status, equipment_type, air_filter_status, belt_condition, motor_condition, control_system_status, notes, maintenance_frequency)
        VALUES (
            equipment_ids[1 + (i % array_length(equipment_ids, 1))],
            technician_ids[1 + (i % array_length(technician_ids, 1))],
            p_company_id,
            location_ids[1 + (i % array_length(location_ids, 1))],
            now() - INTERVAL '1 day' * (i * 7),
            CASE WHEN i % 4 = 0 THEN 'completed'::maintenance_check_status WHEN i % 4 = 1 THEN 'in_progress'::maintenance_check_status ELSE 'pending'::maintenance_check_status END,
            CASE WHEN i % 5 = 0 THEN 'AHU' WHEN i % 5 = 1 THEN 'Chiller' WHEN i % 5 = 2 THEN 'RTU' WHEN i % 5 = 3 THEN 'Cooling Tower' ELSE 'Split System' END,
            CASE WHEN i % 3 = 0 THEN 'clean' WHEN i % 3 = 1 THEN 'dirty' ELSE 'needs_replacement' END,
            CASE WHEN i % 4 = 0 THEN 'good' WHEN i % 4 = 1 THEN 'fair' ELSE 'needs_adjustment' END,
            CASE WHEN i % 3 = 0 THEN 'excellent' WHEN i % 3 = 1 THEN 'good' ELSE 'needs_attention' END,
            CASE WHEN i % 3 = 0 THEN 'normal' WHEN i % 3 = 1 THEN 'minor_issues' ELSE 'requires_repair' END,
            'Demo maintenance check #' || i,
            CASE WHEN i % 3 = 0 THEN 'weekly' WHEN i % 3 = 1 THEN 'monthly' ELSE 'quarterly' END
        );
    END LOOP;

    FOR i IN 1..50 LOOP
        INSERT INTO public.sensor_readings (equipment_id, sensor_type, value, unit, timestamp_utc, source, reading_mode)
        VALUES (
            equipment_ids[1 + (i % array_length(equipment_ids, 1))],
            CASE WHEN i % 4 = 0 THEN 'temperature' WHEN i % 4 = 1 THEN 'pressure' WHEN i % 4 = 2 THEN 'vibration' ELSE 'flow_rate' END,
            CASE WHEN i % 4 = 0 THEN 68 + (i % 20) WHEN i % 4 = 1 THEN 14 + (i % 6) WHEN i % 4 = 2 THEN 0.1 + (i % 10) * 0.05 ELSE 100 + (i % 50) END,
            CASE WHEN i % 4 = 0 THEN '°F' WHEN i % 4 = 1 THEN 'PSI' WHEN i % 4 = 2 THEN 'mm/s' ELSE 'CFM' END,
            now() - INTERVAL '1 hour' * i, 'manual', 'standard'
        );
    END LOOP;

    RAISE NOTICE 'Demo data generated successfully for company: %', p_company_name;
END;
$function$;

-- get_recent_activities
CREATE OR REPLACE FUNCTION public.get_recent_activities()
RETURNS TABLE(id uuid, title text, description text, timestamp_val timestamp with time zone, type text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  WITH combined_activities AS (
    SELECT hmc.id, ('Maintenance: ' || COALESCE(e.name, 'Unknown Equipment')) as title,
      CASE WHEN hmc.status = 'completed' THEN 'Maintenance completed successfully' WHEN hmc.status = 'pending' THEN 'Maintenance scheduled' ELSE 'Maintenance check in progress' END as description,
      hmc.check_date as timestamp_val, 'maintenance' as type
    FROM public.hvac_maintenance_checks hmc LEFT JOIN public.equipment e ON e.id = hmc.equipment_id
    WHERE (public.can_access_all_data() OR (hmc.company_id IS NOT NULL AND public.is_member_of(hmc.company_id)))
    AND hmc.check_date IS NOT NULL
    UNION ALL
    SELECT p.id, ('Project: ' || p.name) as title,
      CASE WHEN LOWER(p.status) = 'completed' THEN 'Project completed' WHEN LOWER(p.status) IN ('in_progress', 'in progress', 'ongoing') THEN 'Project in progress' ELSE 'Project ' || LOWER(p.status) END as description,
      COALESCE(p.updatedat, p.createdat) as timestamp_val, 'project' as type
    FROM public.projects p
    WHERE (public.can_access_all_data() OR (p.company_id IS NOT NULL AND public.is_member_of(p.company_id)))
    AND COALESCE(p.updatedat, p.createdat) IS NOT NULL
  )
  SELECT ca.id, ca.title, ca.description, ca.timestamp_val, ca.type
  FROM combined_activities ca ORDER BY ca.timestamp_val DESC LIMIT 10;
END;
$function$;

-- approve_access_request_and_create_technician
CREATE OR REPLACE FUNCTION public.approve_access_request_and_create_technician(p_request_id uuid, p_reviewed_by text, p_demo_company_name text DEFAULT 'Demo Facilities Inc.'::text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_request record;
  v_company_id uuid;
  v_auth_user_id uuid;
  v_temp_password text;
BEGIN
  SELECT * INTO v_request FROM public.access_requests WHERE id = p_request_id AND status = 'pending';
  IF v_request IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Access request not found or already processed');
  END IF;
  SELECT id INTO v_auth_user_id FROM auth.users WHERE email = v_request.email;
  IF v_auth_user_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'A user with this email already exists.');
  END IF;
  SELECT id INTO v_company_id FROM public.companies WHERE name = p_demo_company_name AND is_trial = true LIMIT 1;
  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (name, is_trial, trial_expires_at, trial_created_at, contact_email)
    VALUES (p_demo_company_name, true, now() + INTERVAL '15 days', now(), v_request.email)
    RETURNING id INTO v_company_id;
  END IF;
  v_temp_password := encode(gen_random_bytes(16), 'base64');
  UPDATE public.access_requests SET status = 'approved', reviewed_at = now(), reviewed_by = p_reviewed_by WHERE id = p_request_id;
  INSERT INTO public.technicians ("firstName", "lastName", email, phone, specialization, company_id, company_name, status, user_role, account_status)
  VALUES (v_request.first_name, v_request.last_name, v_request.email, COALESCE(v_request.phone, ''), 'General Technician', v_company_id, p_demo_company_name, 'pending_activation', 'technician', 'pending_activation');
  INSERT INTO public.company_users (user_id, company_id, role, is_admin)
  VALUES (v_request.email, v_company_id, 'technician', false);
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, metadata)
  VALUES (NULL, 'access_request_approved', 'access_requests', p_request_id, jsonb_build_object('email', v_request.email, 'reviewed_by', p_reviewed_by, 'company_id', v_company_id));
  RETURN json_build_object('success', true, 'message', 'Access request approved.', 'email', v_request.email, 'company_id', v_company_id, 'requires_auth_creation', true);
END;
$function$;
