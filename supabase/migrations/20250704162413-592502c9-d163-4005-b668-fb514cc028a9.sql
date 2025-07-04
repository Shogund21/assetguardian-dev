-- Phase 2: Create user metrics tracking tables

-- User sessions table for detailed session analytics
CREATE TABLE public.user_sessions (
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
CREATE TABLE public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  activity_type text NOT NULL,
  page_route text,
  feature_name text,
  component_name text,
  action_details jsonb,
  timestamp_utc timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Performance metrics table for load times and interaction data
CREATE TABLE public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  metric_type text NOT NULL,
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
CREATE TABLE public.user_engagement_metrics (
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