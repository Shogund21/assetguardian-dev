-- Phase 1: Fix ambiguous company_id references in database functions

-- Fix get_technicians_with_roles function to use proper table aliases
CREATE OR REPLACE FUNCTION public.get_technicians_with_roles()
RETURNS TABLE(
  id uuid, 
  "firstName" character varying, 
  "lastName" character varying, 
  email character varying, 
  phone character varying, 
  specialization character varying, 
  company_id uuid, 
  user_role text, 
  is_admin boolean,
  company_name text,
  status character varying,
  "isAvailable" boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t."firstName",
    t."lastName", 
    t.email,
    t.phone,
    t.specialization,
    t.company_id,
    COALESCE(t.user_role, 'technician') as user_role,
    COALESCE(cu.is_admin, false) as is_admin,
    t.company_name,
    COALESCE(t.status, 'active') as status,
    COALESCE(t."isAvailable", true) as "isAvailable"
  FROM public.technicians t
  LEFT JOIN public.company_users cu ON cu.user_id = t.email AND cu.company_id = t.company_id
  ORDER BY t."firstName";
END;
$function$

-- Phase 2: Create user metrics tracking tables

-- User sessions table for detailed session analytics
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  ip_address inet,
  user_agent text,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  duration_seconds integer,
  pages_visited integer DEFAULT 0,
  actions_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- User activities table for feature usage tracking
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  activity_type text NOT NULL, -- 'page_view', 'button_click', 'form_submit', 'feature_access'
  page_route text,
  feature_name text,
  component_name text,
  action_details jsonb,
  timestamp_utc timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Performance metrics table for load times and interaction data
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  metric_type text NOT NULL, -- 'page_load', 'api_response', 'component_render'
  page_route text,
  load_time_ms integer,
  api_endpoint text,
  response_time_ms integer,
  error_occurred boolean DEFAULT false,
  error_message text,
  timestamp_utc timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- User engagement metrics table for aggregated behavior data
CREATE TABLE IF NOT EXISTS public.user_engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date_recorded date DEFAULT CURRENT_DATE,
  total_sessions integer DEFAULT 0,
  total_session_duration_minutes integer DEFAULT 0,
  pages_per_session numeric DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  most_used_features text[],
  login_count integer DEFAULT 0,
  last_active_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date_recorded)
);

-- Enable RLS on all new tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions" ON public.user_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.user_id = (auth.uid())::text AND cu.is_admin = true
  )
);

-- RLS Policies for user_activities
CREATE POLICY "Users can view their own activities" ON public.user_activities
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" ON public.user_activities
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all activities" ON public.user_activities
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.user_id = (auth.uid())::text AND cu.is_admin = true
  )
);

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view their own performance data" ON public.performance_metrics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert performance data" ON public.performance_metrics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all performance data" ON public.performance_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.user_id = (auth.uid())::text AND cu.is_admin = true
  )
);

-- RLS Policies for user_engagement_metrics
CREATE POLICY "Users can view their own engagement metrics" ON public.user_engagement_metrics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage engagement metrics" ON public.user_engagement_metrics
FOR ALL USING (true);

CREATE POLICY "Admins can view all engagement metrics" ON public.user_engagement_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.user_id = (auth.uid())::text AND cu.is_admin = true
  )
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON public.user_activities(timestamp_utc);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp_utc);
CREATE INDEX IF NOT EXISTS idx_user_engagement_date ON public.user_engagement_metrics(date_recorded);

-- Phase 3: Enhanced audit logging function
CREATE OR REPLACE FUNCTION public.log_user_activity(
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
AS $function$
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
$function$

-- Function to log performance metrics
CREATE OR REPLACE FUNCTION public.log_performance_metric(
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
AS $function$
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
$function$

-- Function to start user session
CREATE OR REPLACE FUNCTION public.start_user_session(
  p_user_id uuid,
  p_session_id text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$

-- Function to end user session
CREATE OR REPLACE FUNCTION public.end_user_session(
  p_session_id text,
  p_pages_visited integer DEFAULT 0,
  p_actions_count integer DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.user_sessions 
  SET 
    ended_at = now(),
    duration_seconds = EXTRACT(EPOCH FROM (now() - started_at)),
    pages_visited = p_pages_visited,
    actions_count = p_actions_count
  WHERE session_id = p_session_id;
END;
$function$