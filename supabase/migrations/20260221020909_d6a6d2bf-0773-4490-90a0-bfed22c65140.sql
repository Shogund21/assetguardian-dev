CREATE TABLE IF NOT EXISTS public.asset_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid UNIQUE NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  health_score int NOT NULL,
  risk_level text NOT NULL,
  age_years numeric,
  pm_compliance_pct numeric,
  open_wo_count int DEFAULT 0,
  corrective_wo_12m_count int DEFAULT 0,
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE public.asset_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view asset health"
  ON public.asset_health FOR SELECT
  TO authenticated
  USING (true);