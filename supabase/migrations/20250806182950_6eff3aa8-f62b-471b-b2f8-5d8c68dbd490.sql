-- Create rate limiting tables
CREATE TABLE public.chat_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL, -- IP address or user email
  identifier_type text NOT NULL DEFAULT 'ip', -- 'ip', 'session', 'user'
  session_id text,
  messages_count integer NOT NULL DEFAULT 0,
  tokens_used integer NOT NULL DEFAULT 0,
  cost_usd numeric(10,4) NOT NULL DEFAULT 0,
  first_message_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  reset_at timestamp with time zone NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  is_blocked boolean NOT NULL DEFAULT false,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, identifier_type)
);

-- Create rate limit overrides table
CREATE TABLE public.rate_limit_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  identifier_type text NOT NULL DEFAULT 'ip', -- 'ip', 'user', 'session'
  override_type text NOT NULL DEFAULT 'unlimited', -- 'unlimited', 'extended', 'custom'
  custom_message_limit integer,
  custom_token_limit integer,
  custom_cost_limit numeric(10,4),
  expires_at timestamp with time zone,
  reason text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(identifier, identifier_type)
);

-- Create rate limit configurations table
CREATE TABLE public.rate_limit_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_name text NOT NULL UNIQUE,
  messages_per_session integer NOT NULL DEFAULT 20,
  messages_per_day integer NOT NULL DEFAULT 50,
  tokens_per_session integer NOT NULL DEFAULT 10000,
  tokens_per_day integer NOT NULL DEFAULT 50000,
  cost_per_session_usd numeric(10,4) NOT NULL DEFAULT 5.00,
  cost_per_day_usd numeric(10,4) NOT NULL DEFAULT 25.00,
  throttle_delay_ms integer NOT NULL DEFAULT 2000,
  progressive_throttle boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create chat rate limit analytics table
CREATE TABLE public.chat_rate_limit_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  identifier_type text NOT NULL,
  event_type text NOT NULL, -- 'message_sent', 'limit_hit', 'throttled', 'blocked'
  session_id text,
  messages_count integer NOT NULL DEFAULT 0,
  tokens_used integer NOT NULL DEFAULT 0,
  cost_usd numeric(10,4) NOT NULL DEFAULT 0,
  limit_type text, -- 'session', 'daily', 'cost', 'token'
  had_override boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default configuration
INSERT INTO public.rate_limit_configs (
  config_name, 
  messages_per_session, 
  messages_per_day, 
  tokens_per_session, 
  tokens_per_day,
  cost_per_session_usd,
  cost_per_day_usd,
  throttle_delay_ms,
  progressive_throttle,
  is_active
) VALUES (
  'default',
  20,
  50, 
  10000,
  50000,
  5.00,
  25.00,
  2000,
  true,
  true
);

-- Enable RLS
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rate_limit_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rate_limits
CREATE POLICY "System can manage rate limits" 
ON public.chat_rate_limits 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for rate_limit_overrides
CREATE POLICY "Super admins can manage overrides" 
ON public.rate_limit_overrides 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "System can read overrides" 
ON public.rate_limit_overrides 
FOR SELECT 
USING (true);

-- RLS Policies for rate_limit_configs
CREATE POLICY "Super admins can manage configs" 
ON public.rate_limit_configs 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "System can read configs" 
ON public.rate_limit_configs 
FOR SELECT 
USING (true);

-- RLS Policies for analytics
CREATE POLICY "Super admins can view analytics" 
ON public.chat_rate_limit_analytics 
FOR SELECT 
USING (is_super_admin());

CREATE POLICY "System can insert analytics" 
ON public.chat_rate_limit_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_chat_rate_limits_identifier ON public.chat_rate_limits(identifier, identifier_type);
CREATE INDEX idx_chat_rate_limits_session ON public.chat_rate_limits(session_id);
CREATE INDEX idx_chat_rate_limits_reset_at ON public.chat_rate_limits(reset_at);
CREATE INDEX idx_rate_limit_overrides_identifier ON public.rate_limit_overrides(identifier, identifier_type, is_active);
CREATE INDEX idx_chat_rate_limit_analytics_created_at ON public.chat_rate_limit_analytics(created_at);
CREATE INDEX idx_chat_rate_limit_analytics_identifier ON public.chat_rate_limit_analytics(identifier, identifier_type);

-- Create triggers for updated_at
CREATE TRIGGER update_chat_rate_limits_updated_at
  BEFORE UPDATE ON public.chat_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_limit_overrides_updated_at
  BEFORE UPDATE ON public.rate_limit_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_limit_configs_updated_at
  BEFORE UPDATE ON public.rate_limit_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();