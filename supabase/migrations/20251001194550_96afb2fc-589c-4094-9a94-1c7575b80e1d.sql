-- CRITICAL SECURITY FIX: Restrict access to sensor_readings table
-- This table contains proprietary equipment performance data that must be protected

-- Drop the dangerous public policy that allows anyone to read/write sensor data
DROP POLICY IF EXISTS "Allow all sensor_readings operations" ON public.sensor_readings;

-- Create secure company-based access control policies

-- Policy 1: Users can view sensor readings for equipment in their company
CREATE POLICY "Users can view sensor readings for their company equipment"
ON public.sensor_readings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.equipment e
    WHERE e.id = sensor_readings.equipment_id
      AND (
        e.company_id IS NULL  -- Legacy equipment without company
        OR is_member_of(e.company_id)  -- User is member of equipment's company
        OR can_access_all_data()  -- Super admin access
      )
  )
);

-- Policy 2: Users can insert sensor readings for equipment in their company
CREATE POLICY "Users can create sensor readings for their company equipment"
ON public.sensor_readings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.equipment e
    WHERE e.id = sensor_readings.equipment_id
      AND (
        e.company_id IS NULL  -- Legacy equipment
        OR is_member_of(e.company_id)  -- User is member of equipment's company
        OR can_access_all_data()  -- Super admin access
      )
  )
);

-- Policy 3: Users can update sensor readings for equipment in their company
CREATE POLICY "Users can update sensor readings for their company equipment"
ON public.sensor_readings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.equipment e
    WHERE e.id = sensor_readings.equipment_id
      AND (
        e.company_id IS NULL
        OR is_member_of(e.company_id)
        OR can_access_all_data()
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.equipment e
    WHERE e.id = sensor_readings.equipment_id
      AND (
        e.company_id IS NULL
        OR is_member_of(e.company_id)
        OR can_access_all_data()
      )
  )
);

-- Policy 4: Users can delete sensor readings for equipment in their company
CREATE POLICY "Users can delete sensor readings for their company equipment"
ON public.sensor_readings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.equipment e
    WHERE e.id = sensor_readings.equipment_id
      AND (
        e.company_id IS NULL
        OR is_member_of(e.company_id)
        OR can_access_all_data()
      )
  )
);

-- Policy 5: Service role can manage all sensor readings (for automated data collection)
CREATE POLICY "Service role can manage all sensor readings"
ON public.sensor_readings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- IMPORTANT NOTES:
-- 1. Sensor data is now protected - only company members can access their equipment's readings
-- 2. Super admins can access all sensor data for system monitoring
-- 3. Automated systems using service_role can collect and store readings
-- 4. Consider implementing data retention policies to limit historical data exposure
-- 5. Consider encrypting sensitive sensor values at rest for additional security