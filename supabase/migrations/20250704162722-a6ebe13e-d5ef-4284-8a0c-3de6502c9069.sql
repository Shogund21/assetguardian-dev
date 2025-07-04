-- Phase 4: Add user metrics tracking functions

-- Function to log user activity
CREATE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_session_id text,
  p_activity_type text,
  p_page_route text DEFAULT NULL,
  p_feature_name text DEFAULT NULL,
  p_component_name text DEFAULT NULL,
  p_action_details jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    session_id,
    activity_type,
    page_route,
    feature_name,
    component_name,
    action_details
  ) VALUES (
    p_user_id,
    p_session_id,
    p_activity_type,
    p_page_route,
    p_feature_name,
    p_component_name,
    p_action_details
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Function to log performance metrics
CREATE FUNCTION public.log_performance_metric(
  p_user_id uuid,
  p_session_id text,
  p_metric_type text,
  p_page_route text DEFAULT NULL,
  p_load_time_ms integer DEFAULT NULL,
  p_api_endpoint text DEFAULT NULL,
  p_response_time_ms integer DEFAULT NULL,
  p_error_occurred boolean DEFAULT false,
  p_error_message text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metric_id uuid;
BEGIN
  INSERT INTO public.performance_metrics (
    user_id,
    session_id,
    metric_type,
    page_route,
    load_time_ms,
    api_endpoint,
    response_time_ms,
    error_occurred,
    error_message
  ) VALUES (
    p_user_id,
    p_session_id,
    p_metric_type,
    p_page_route,
    p_load_time_ms,
    p_api_endpoint,
    p_response_time_ms,
    p_error_occurred,
    p_error_message
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;

-- Function to start user session
CREATE FUNCTION public.start_user_session(
  p_user_id uuid,
  p_session_id text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_uuid uuid;
BEGIN
  INSERT INTO public.user_sessions (
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO session_uuid;
  
  RETURN session_uuid;
END;
$$;

-- Function to end user session
CREATE FUNCTION public.end_user_session(
  p_session_id text,
  p_pages_visited integer DEFAULT 0,
  p_actions_count integer DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET 
    ended_at = now(),
    duration_seconds = EXTRACT(EPOCH FROM (now() - started_at)),
    pages_visited = p_pages_visited,
    actions_count = p_actions_count
  WHERE session_id = p_session_id;
END;
$$;