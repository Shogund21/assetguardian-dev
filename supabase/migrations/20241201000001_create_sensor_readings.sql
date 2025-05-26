
-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id TEXT NOT NULL,
  timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sensor_type TEXT NOT NULL,
  value DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_equipment_id ON sensor_readings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp_utc);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_type ON sensor_readings(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_equipment_timestamp ON sensor_readings(equipment_id, timestamp_utc);

-- Add comments
COMMENT ON TABLE sensor_readings IS 'Real-time sensor data from equipment';
COMMENT ON COLUMN sensor_readings.equipment_id IS 'Reference to equipment.id';
COMMENT ON COLUMN sensor_readings.sensor_type IS 'Type of sensor (vibration_mm_s, bearing_temp_C, current_A, etc.)';
COMMENT ON COLUMN sensor_readings.value IS 'Sensor reading value';
COMMENT ON COLUMN sensor_readings.unit IS 'Unit of measurement';
