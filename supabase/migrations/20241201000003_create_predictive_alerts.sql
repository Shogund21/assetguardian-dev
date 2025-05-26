
-- Create predictive_alerts table
CREATE TABLE IF NOT EXISTS predictive_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  finding TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ NULL,
  work_order_id UUID NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_asset_id ON predictive_alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_risk_level ON predictive_alerts(risk_level);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_created_at ON predictive_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_resolved_at ON predictive_alerts(resolved_at);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_active ON predictive_alerts(asset_id) WHERE resolved_at IS NULL;

-- Add comments
COMMENT ON TABLE predictive_alerts IS 'AI-generated predictive maintenance alerts';
COMMENT ON COLUMN predictive_alerts.asset_id IS 'Reference to equipment asset';
COMMENT ON COLUMN predictive_alerts.risk_level IS 'Risk level: low, medium, high';
COMMENT ON COLUMN predictive_alerts.confidence_score IS 'AI confidence score (0-1)';
COMMENT ON COLUMN predictive_alerts.resolved_at IS 'When alert was resolved (NULL = active)';
