ALTER TABLE hvac_maintenance_checks 
ADD COLUMN IF NOT EXISTS compressor_vibration text;

COMMENT ON COLUMN hvac_maintenance_checks.compressor_vibration IS 'Compressor vibration status: normal, slight, excessive';