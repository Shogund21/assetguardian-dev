
-- Create equipment_live_points table for real-time sensor data
CREATE TABLE public.equipment_live_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  points JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient equipment lookups
CREATE INDEX idx_equipment_live_points_equipment_id ON public.equipment_live_points(equipment_id);
CREATE INDEX idx_equipment_live_points_last_updated ON public.equipment_live_points(last_updated);

-- Create hvac_diag_sessions table for diagnostic sessions
CREATE TABLE public.hvac_diag_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient session lookups
CREATE INDEX idx_hvac_diag_sessions_equipment_id ON public.hvac_diag_sessions(equipment_id);
CREATE INDEX idx_hvac_diag_sessions_user_id ON public.hvac_diag_sessions(user_id);
CREATE INDEX idx_hvac_diag_sessions_started_at ON public.hvac_diag_sessions(started_at);

-- Create hvac_diag_messages table for chat messages
CREATE TABLE public.hvac_diag_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.hvac_diag_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('tech', 'llm')),
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient message retrieval by session
CREATE INDEX idx_hvac_diag_messages_session_id ON public.hvac_diag_messages(session_id);
CREATE INDEX idx_hvac_diag_messages_created_at ON public.hvac_diag_messages(created_at);

-- Add updated_at triggers
CREATE TRIGGER update_equipment_live_points_updated_at
  BEFORE UPDATE ON public.equipment_live_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hvac_diag_sessions_updated_at
  BEFORE UPDATE ON public.hvac_diag_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.equipment_live_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hvac_diag_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hvac_diag_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment_live_points
CREATE POLICY "Users can view live points for their company equipment"
  ON public.equipment_live_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.id = equipment_live_points.equipment_id
      AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
    )
  );

CREATE POLICY "System can insert/update live points"
  ON public.equipment_live_points FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for hvac_diag_sessions
CREATE POLICY "Users can manage their own diagnostic sessions"
  ON public.hvac_diag_sessions FOR ALL
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.id = hvac_diag_sessions.equipment_id
      AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.id = hvac_diag_sessions.equipment_id
      AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
    )
  );

-- RLS Policies for hvac_diag_messages
CREATE POLICY "Users can view messages from their sessions"
  ON public.hvac_diag_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hvac_diag_sessions s
      WHERE s.id = hvac_diag_messages.session_id
      AND (s.user_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.equipment e
             WHERE e.id = s.equipment_id
             AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
           ))
    )
  );

CREATE POLICY "Users can insert messages to their sessions"
  ON public.hvac_diag_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hvac_diag_sessions s
      WHERE s.id = hvac_diag_messages.session_id
      AND (s.user_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM public.equipment e
             WHERE e.id = s.equipment_id
             AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
           ))
    )
  );

-- Enable Realtime for equipment_live_points
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment_live_points;

-- Create a unique constraint to prevent duplicate live points per equipment
ALTER TABLE public.equipment_live_points
ADD CONSTRAINT unique_equipment_live_points UNIQUE (equipment_id);
