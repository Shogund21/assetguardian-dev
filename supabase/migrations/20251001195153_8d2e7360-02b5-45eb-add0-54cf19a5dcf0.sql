-- SECURITY FIX: Restrict extracted_readings_staging to authenticated users only
-- This table contains sensitive industrial equipment readings from image analysis

-- Drop existing policies that use 'public' role
DROP POLICY IF EXISTS "Users can view staging readings from their batches" ON public.extracted_readings_staging;
DROP POLICY IF EXISTS "Users can create staging readings for their batches" ON public.extracted_readings_staging;
DROP POLICY IF EXISTS "Users can update staging readings from their batches" ON public.extracted_readings_staging;

-- Create secure policies for authenticated users only

-- Policy 1: Authenticated users can view staging readings for their company's batches
CREATE POLICY "Authenticated users can view staging readings for their batches"
ON public.extracted_readings_staging
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.image_analysis_batches b
    WHERE b.id = extracted_readings_staging.batch_id
      AND (
        b.company_id IS NULL  -- Legacy batches without company
        OR is_member_of(b.company_id)  -- User is member of batch's company
        OR can_access_all_data()  -- Super admin access
      )
  )
);

-- Policy 2: Authenticated users can create staging readings for their company's batches
CREATE POLICY "Authenticated users can create staging readings for their batches"
ON public.extracted_readings_staging
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.image_analysis_batches b
    WHERE b.id = extracted_readings_staging.batch_id
      AND (
        b.company_id IS NULL
        OR is_member_of(b.company_id)
        OR can_access_all_data()
      )
  )
);

-- Policy 3: Authenticated users can update staging readings for their company's batches
CREATE POLICY "Authenticated users can update staging readings for their batches"
ON public.extracted_readings_staging
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.image_analysis_batches b
    WHERE b.id = extracted_readings_staging.batch_id
      AND (
        b.company_id IS NULL
        OR is_member_of(b.company_id)
        OR can_access_all_data()
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.image_analysis_batches b
    WHERE b.id = extracted_readings_staging.batch_id
      AND (
        b.company_id IS NULL
        OR is_member_of(b.company_id)
        OR can_access_all_data()
      )
  )
);

-- Policy 4: Authenticated users can delete staging readings for their company's batches
CREATE POLICY "Authenticated users can delete staging readings for their batches"
ON public.extracted_readings_staging
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.image_analysis_batches b
    WHERE b.id = extracted_readings_staging.batch_id
      AND (
        b.company_id IS NULL
        OR is_member_of(b.company_id)
        OR can_access_all_data()
      )
  )
);

-- Policy 5: Service role can manage all staging readings (for automated systems)
CREATE POLICY "Service role can manage all staging readings"
ON public.extracted_readings_staging
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- IMPORTANT NOTES:
-- 1. Anonymous users can no longer access staging readings - authentication required
-- 2. Access is controlled through image_analysis_batches and company membership
-- 3. Super admins can access all staging data for system monitoring
-- 4. Service role access enabled for AI/ML image processing systems
-- 5. Consider implementing data retention policies to automatically purge old staging data