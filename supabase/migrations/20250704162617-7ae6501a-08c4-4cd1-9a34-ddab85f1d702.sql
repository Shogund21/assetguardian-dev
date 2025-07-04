-- Phase 3: Enable RLS and add policies for user metrics tables

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
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_timestamp ON public.user_activities(timestamp_utc);
CREATE INDEX idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp_utc);
CREATE INDEX idx_user_engagement_date ON public.user_engagement_metrics(date_recorded);