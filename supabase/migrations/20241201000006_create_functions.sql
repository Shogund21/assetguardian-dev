
-- Function to get recent sensor readings with statistical analysis
CREATE OR REPLACE FUNCTION get_sensor_analysis(
  p_equipment_id TEXT,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
  sensor_type TEXT,
  latest_value DECIMAL,
  avg_value DECIMAL,
  min_value DECIMAL,
  max_value DECIMAL,
  reading_count INTEGER,
  trend_direction TEXT,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH sensor_stats AS (
    SELECT 
      sr.sensor_type,
      sr.unit,
      AVG(sr.value) as avg_val,
      MIN(sr.value) as min_val,
      MAX(sr.value) as max_val,
      COUNT(*) as count_val,
      -- Get latest value
      (SELECT sr2.value FROM sensor_readings sr2 
       WHERE sr2.equipment_id = p_equipment_id 
       AND sr2.sensor_type = sr.sensor_type 
       ORDER BY sr2.timestamp_utc DESC LIMIT 1) as latest_val,
      -- Simple trend calculation (compare last 25% vs first 25% of readings)
      CASE 
        WHEN AVG(CASE WHEN sr.timestamp_utc >= NOW() - (p_hours * 0.25 * INTERVAL '1 hour') THEN sr.value END) > 
             AVG(CASE WHEN sr.timestamp_utc <= NOW() - (p_hours * 0.75 * INTERVAL '1 hour') THEN sr.value END)
        THEN 'increasing'
        WHEN AVG(CASE WHEN sr.timestamp_utc >= NOW() - (p_hours * 0.25 * INTERVAL '1 hour') THEN sr.value END) < 
             AVG(CASE WHEN sr.timestamp_utc <= NOW() - (p_hours * 0.75 * INTERVAL '1 hour') THEN sr.value END)
        THEN 'decreasing'
        ELSE 'stable'
      END as trend
    FROM sensor_readings sr
    WHERE sr.equipment_id = p_equipment_id
      AND sr.timestamp_utc >= NOW() - (p_hours * INTERVAL '1 hour')
    GROUP BY sr.sensor_type, sr.unit
  )
  SELECT 
    ss.sensor_type,
    ss.latest_val as latest_value,
    ROUND(ss.avg_val, 2) as avg_value,
    ss.min_val as min_value,
    ss.max_val as max_value,
    ss.count_val::INTEGER as reading_count,
    ss.trend as trend_direction,
    ss.unit
  FROM sensor_stats ss
  ORDER BY ss.sensor_type;
END;
$$ LANGUAGE plpgsql;

-- Function to check threshold violations
CREATE OR REPLACE FUNCTION check_threshold_violations(
  p_equipment_id TEXT
)
RETURNS TABLE(
  sensor_type TEXT,
  current_value DECIMAL,
  warning_threshold DECIMAL,
  critical_threshold DECIMAL,
  violation_level TEXT,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_readings AS (
    SELECT DISTINCT ON (sr.sensor_type)
      sr.sensor_type,
      sr.value,
      sr.unit,
      sr.timestamp_utc
    FROM sensor_readings sr
    WHERE sr.equipment_id = p_equipment_id
      AND sr.timestamp_utc >= NOW() - INTERVAL '1 hour'
    ORDER BY sr.sensor_type, sr.timestamp_utc DESC
  )
  SELECT 
    lr.sensor_type,
    lr.value as current_value,
    et.warning_threshold,
    et.critical_threshold,
    CASE 
      WHEN lr.value >= et.critical_threshold THEN 'critical'
      WHEN lr.value >= et.warning_threshold THEN 'warning'
      ELSE 'normal'
    END as violation_level,
    lr.unit
  FROM latest_readings lr
  JOIN equipment_thresholds et ON et.equipment_id = p_equipment_id 
    AND et.sensor_type = lr.sensor_type
  WHERE lr.value >= et.warning_threshold
  ORDER BY 
    CASE 
      WHEN lr.value >= et.critical_threshold THEN 1
      WHEN lr.value >= et.warning_threshold THEN 2
      ELSE 3
    END,
    lr.sensor_type;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION get_sensor_analysis IS 'Get statistical analysis of sensor readings for equipment';
COMMENT ON FUNCTION check_threshold_violations IS 'Check for current threshold violations';
