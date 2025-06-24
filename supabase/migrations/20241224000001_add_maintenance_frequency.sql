
-- Add maintenance_frequency column to hvac_maintenance_checks table
ALTER TABLE hvac_maintenance_checks 
ADD COLUMN IF NOT EXISTS maintenance_frequency TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_hvac_maintenance_checks_frequency 
ON hvac_maintenance_checks(maintenance_frequency);

-- Add comment
COMMENT ON COLUMN hvac_maintenance_checks.maintenance_frequency IS 'Frequency of maintenance (daily, weekly, monthly, quarterly, annual)';

-- Update existing records with a default value if needed
UPDATE hvac_maintenance_checks 
SET maintenance_frequency = 'monthly' 
WHERE maintenance_frequency IS NULL;
