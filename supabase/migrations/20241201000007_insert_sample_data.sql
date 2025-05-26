
-- Insert sample equipment thresholds for demonstration
INSERT INTO equipment_thresholds (equipment_id, sensor_type, warning_threshold, critical_threshold, unit) VALUES
  ('chiller-001', 'vibration_mm_s', 3.5, 4.5, 'mm/s'),
  ('chiller-001', 'bearing_temp_C', 70, 80, '°C'),
  ('chiller-001', 'current_A', 65, 70, 'A'),
  ('ahu-003', 'vibration_mm_s', 3.0, 4.0, 'mm/s'),
  ('ahu-003', 'bearing_temp_C', 65, 75, '°C'),
  ('ahu-003', 'current_A', 60, 68, 'A'),
  ('pump-005', 'vibration_mm_s', 2.5, 3.5, 'mm/s'),
  ('pump-005', 'bearing_temp_C', 60, 70, '°C'),
  ('pump-005', 'current_A', 50, 60, 'A')
ON CONFLICT (equipment_id, sensor_type) DO NOTHING;

-- Insert sample sensor readings for the last 24 hours (every 10 minutes)
DO $$
DECLARE
  equipment_ids TEXT[] := ARRAY['chiller-001', 'ahu-003', 'pump-005'];
  sensor_types TEXT[] := ARRAY['vibration_mm_s', 'bearing_temp_C', 'current_A'];
  base_values DECIMAL[] := ARRAY[2.5, 65, 55]; -- Base values for each sensor type
  units TEXT[] := ARRAY['mm/s', '°C', 'A'];
  i INTEGER;
  j INTEGER;
  k INTEGER;
  current_time TIMESTAMPTZ;
  reading_value DECIMAL;
BEGIN
  -- Generate readings for the last 24 hours, every 10 minutes
  FOR i IN 0..143 LOOP -- 144 readings (24 hours * 6 readings per hour)
    current_time := NOW() - (i * INTERVAL '10 minutes');
    
    -- For each equipment
    FOR j IN 1..array_length(equipment_ids, 1) LOOP
      -- For each sensor type
      FOR k IN 1..array_length(sensor_types, 1) LOOP
        -- Generate realistic reading with some variation and trend
        reading_value := base_values[k] + 
                        (random() * 4 - 2) + -- Random variation ±2
                        sin(i * 0.1) * 1.5 + -- Cyclical pattern
                        (i * 0.002); -- Slight upward trend
        
        INSERT INTO sensor_readings (equipment_id, timestamp_utc, sensor_type, value, unit, created_at)
        VALUES (
          equipment_ids[j],
          current_time,
          sensor_types[k],
          reading_value,
          units[k],
          current_time
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Insert a sample predictive alert
INSERT INTO predictive_alerts (asset_id, risk_level, finding, recommendation, confidence_score, created_at)
VALUES (
  'chiller-001',
  'medium',
  'Bearing temperature trending upward over the last 12 hours',
  'Schedule preventive maintenance to inspect bearing condition',
  0.85,
  NOW() - INTERVAL '2 hours'
);

-- Insert a sample work order
INSERT INTO automated_work_orders (asset_id, title, description, priority, due_hours, assigned_team, alert_id)
VALUES (
  'chiller-001',
  'Preventive Maintenance - Bearing Inspection',
  'AI analysis detected elevated bearing temperatures. Inspect bearing condition and lubrication system.',
  'medium',
  48,
  'maintenance',
  (SELECT id FROM predictive_alerts WHERE asset_id = 'chiller-001' LIMIT 1)
);
