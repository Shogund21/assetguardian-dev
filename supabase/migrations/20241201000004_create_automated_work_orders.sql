
-- Create automated_work_orders table
CREATE TABLE IF NOT EXISTS automated_work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  due_hours INTEGER NOT NULL,
  assigned_team TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  alert_id UUID NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automated_work_orders_asset_id ON automated_work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_automated_work_orders_status ON automated_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_automated_work_orders_priority ON automated_work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_automated_work_orders_created_at ON automated_work_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_automated_work_orders_alert_id ON automated_work_orders(alert_id);

-- Add comments
COMMENT ON TABLE automated_work_orders IS 'Automatically generated work orders from AI analysis';
COMMENT ON COLUMN automated_work_orders.due_hours IS 'Hours from creation when work order is due';
COMMENT ON COLUMN automated_work_orders.alert_id IS 'Reference to predictive_alerts.id that triggered this work order';
