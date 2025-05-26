
-- Enable RLS on all tables
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_work_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for sensor_readings
CREATE POLICY "Allow read access to sensor_readings" ON sensor_readings
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to sensor_readings" ON sensor_readings
  FOR INSERT WITH CHECK (true);

-- Create policies for equipment_thresholds
CREATE POLICY "Allow read access to equipment_thresholds" ON equipment_thresholds
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to equipment_thresholds" ON equipment_thresholds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to equipment_thresholds" ON equipment_thresholds
  FOR UPDATE USING (true);

-- Create policies for predictive_alerts
CREATE POLICY "Allow read access to predictive_alerts" ON predictive_alerts
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to predictive_alerts" ON predictive_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to predictive_alerts" ON predictive_alerts
  FOR UPDATE USING (true);

-- Create policies for automated_work_orders
CREATE POLICY "Allow read access to automated_work_orders" ON automated_work_orders
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to automated_work_orders" ON automated_work_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to automated_work_orders" ON automated_work_orders
  FOR UPDATE USING (true);
