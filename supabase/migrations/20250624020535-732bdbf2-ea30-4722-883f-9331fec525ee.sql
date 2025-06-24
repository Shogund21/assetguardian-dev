
-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL,
  timestamp_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'manual',
  reading_mode TEXT
);

-- Create equipment_thresholds table
CREATE TABLE IF NOT EXISTS public.equipment_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL,
  sensor_type TEXT NOT NULL,
  warning_threshold NUMERIC NOT NULL,
  critical_threshold NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictive_alerts table
CREATE TABLE IF NOT EXISTS public.predictive_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  finding TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  work_order_id UUID,
  data_quality JSONB,
  predictive_timeline JSONB,
  degradation_analysis JSONB,
  maintenance_windows JSONB,
  performance_trends JSONB
);

-- Create automated_work_orders table
CREATE TABLE IF NOT EXISTS public.automated_work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  due_hours NUMERIC NOT NULL,
  assigned_team TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  alert_id UUID
);

-- Add missing columns to hvac_maintenance_checks
ALTER TABLE public.hvac_maintenance_checks 
ADD COLUMN IF NOT EXISTS maintenance_frequency TEXT,
ADD COLUMN IF NOT EXISTS unusual_noise_elevator BOOLEAN,
ADD COLUMN IF NOT EXISTS vibration_elevator BOOLEAN;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_equipment_id ON public.sensor_readings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp_utc);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_asset_id ON public.predictive_alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_created_at ON public.predictive_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_equipment_thresholds_equipment_id ON public.equipment_thresholds(equipment_id);

-- Enable Row Level Security
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_work_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - you can restrict later based on your auth needs)
CREATE POLICY "Allow all sensor_readings operations" ON public.sensor_readings FOR ALL USING (true);
CREATE POLICY "Allow all equipment_thresholds operations" ON public.equipment_thresholds FOR ALL USING (true);
CREATE POLICY "Allow all predictive_alerts operations" ON public.predictive_alerts FOR ALL USING (true);
CREATE POLICY "Allow all automated_work_orders operations" ON public.automated_work_orders FOR ALL USING (true);

-- Add helpful functions
CREATE OR REPLACE FUNCTION public.get_sensor_analysis(p_equipment_id UUID, p_hours INTEGER DEFAULT 24)
RETURNS TABLE(
  sensor_type TEXT,
  latest_value NUMERIC,
  avg_value NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  reading_count BIGINT,
  trend_direction TEXT,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.sensor_type,
    (SELECT value FROM sensor_readings WHERE equipment_id = p_equipment_id AND sensor_type = sr.sensor_type ORDER BY timestamp_utc DESC LIMIT 1) as latest_value,
    AVG(sr.value) as avg_value,
    MIN(sr.value) as min_value,
    MAX(sr.value) as max_value,
    COUNT(*) as reading_count,
    CASE 
      WHEN COUNT(*) < 2 THEN 'insufficient_data'
      ELSE 'stable'
    END as trend_direction,
    sr.unit
  FROM sensor_readings sr
  WHERE sr.equipment_id = p_equipment_id 
    AND sr.timestamp_utc >= NOW() - INTERVAL '1 hour' * p_hours
  GROUP BY sr.sensor_type, sr.unit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_threshold_violations(p_equipment_id UUID)
RETURNS TABLE(
  sensor_type TEXT,
  current_value NUMERIC,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  violation_level TEXT,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    et.sensor_type,
    (SELECT value FROM sensor_readings WHERE equipment_id = p_equipment_id AND sensor_type = et.sensor_type ORDER BY timestamp_utc DESC LIMIT 1) as current_value,
    et.warning_threshold,
    et.critical_threshold,
    CASE 
      WHEN (SELECT value FROM sensor_readings WHERE equipment_id = p_equipment_id AND sensor_type = et.sensor_type ORDER BY timestamp_utc DESC LIMIT 1) >= et.critical_threshold THEN 'critical'
      WHEN (SELECT value FROM sensor_readings WHERE equipment_id = p_equipment_id AND sensor_type = et.sensor_type ORDER BY timestamp_utc DESC LIMIT 1) >= et.warning_threshold THEN 'warning'
      ELSE 'normal'
    END as violation_level,
    et.unit
  FROM equipment_thresholds et
  WHERE et.equipment_id = p_equipment_id;
END;
$$ LANGUAGE plpgsql;
