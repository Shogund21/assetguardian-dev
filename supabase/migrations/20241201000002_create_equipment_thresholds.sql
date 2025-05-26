
-- Create equipment_thresholds table
CREATE TABLE IF NOT EXISTS equipment_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  warning_threshold DECIMAL(10,3) NOT NULL,
  critical_threshold DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(equipment_id, sensor_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_equipment_thresholds_equipment_id ON equipment_thresholds(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_thresholds_sensor_type ON equipment_thresholds(sensor_type);

-- Add comments
COMMENT ON TABLE equipment_thresholds IS 'Threshold values for equipment sensors';
COMMENT ON COLUMN equipment_thresholds.warning_threshold IS 'Warning level threshold';
COMMENT ON COLUMN equipment_thresholds.critical_threshold IS 'Critical level threshold';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_equipment_thresholds_updated_at 
  BEFORE UPDATE ON equipment_thresholds 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
