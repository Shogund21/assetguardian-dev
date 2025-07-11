-- Create function to get audit logs with user profiles
CREATE OR REPLACE FUNCTION public.get_audit_logs_with_profiles(
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL,
  p_table_name text DEFAULT NULL,
  p_action text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  action text,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  reason text,
  metadata jsonb,
  created_at timestamp with time zone,
  ip_address inet,
  user_agent text,
  session_id text,
  user_first_name text,
  user_last_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.action,
    al.table_name,
    al.record_id,
    al.old_values,
    al.new_values,
    al.reason,
    al.metadata,
    al.created_at,
    al.ip_address,
    al.user_agent,
    al.session_id,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    p.email as user_email
  FROM public.audit_logs al
  LEFT JOIN public.profiles p ON p.id = al.user_id
  WHERE (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
    AND (p_table_name IS NULL OR al.table_name = p_table_name)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
  ORDER BY al.created_at DESC
  LIMIT LEAST(p_limit, 1000);
END;
$$;

-- Create function to get user activities with profiles
CREATE OR REPLACE FUNCTION public.get_user_activities_with_profiles(p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  session_id text,
  activity_type text,
  page_route text,
  feature_name text,
  component_name text,
  action_details jsonb,
  timestamp_utc timestamp with time zone,
  created_at timestamp with time zone,
  user_first_name text,
  user_last_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    ua.session_id,
    ua.activity_type,
    ua.page_route,
    ua.feature_name,
    ua.component_name,
    ua.action_details,
    ua.timestamp_utc,
    ua.created_at,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    p.email as user_email
  FROM public.user_activities ua
  LEFT JOIN public.profiles p ON p.id = ua.user_id
  ORDER BY ua.created_at DESC
  LIMIT LEAST(p_limit, 1000);
END;
$$;

-- Create function to get user sessions with profiles
CREATE OR REPLACE FUNCTION public.get_user_sessions_with_profiles(p_limit integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  session_id text,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  duration_seconds integer,
  pages_visited integer,
  actions_count integer,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone,
  user_first_name text,
  user_last_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.session_id,
    us.started_at,
    us.ended_at,
    us.duration_seconds,
    us.pages_visited,
    us.actions_count,
    us.ip_address,
    us.user_agent,
    us.created_at,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    p.email as user_email
  FROM public.user_sessions us
  LEFT JOIN public.profiles p ON p.id = us.user_id
  ORDER BY us.created_at DESC
  LIMIT LEAST(p_limit, 100);
END;
$$;

-- Create function to get performance metrics with profiles
CREATE OR REPLACE FUNCTION public.get_performance_metrics_with_profiles(p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  session_id text,
  metric_type text,
  page_route text,
  load_time_ms integer,
  api_endpoint text,
  response_time_ms integer,
  error_occurred boolean,
  error_message text,
  timestamp_utc timestamp with time zone,
  created_at timestamp with time zone,
  user_first_name text,
  user_last_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.user_id,
    pm.session_id,
    pm.metric_type,
    pm.page_route,
    pm.load_time_ms,
    pm.api_endpoint,
    pm.response_time_ms,
    pm.error_occurred,
    pm.error_message,
    pm.timestamp_utc,
    pm.created_at,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    p.email as user_email
  FROM public.performance_metrics pm
  LEFT JOIN public.profiles p ON p.id = pm.user_id
  ORDER BY pm.created_at DESC
  LIMIT LEAST(p_limit, 1000);
END;
$$;