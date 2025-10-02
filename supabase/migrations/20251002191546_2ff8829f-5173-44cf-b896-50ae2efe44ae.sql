-- ============================================
-- CRITICAL SECURITY FIXES - Fixed version
-- ============================================

-- 1. CREATE ROLE SYSTEM (if not exists)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'engineer', 'technician', 'user');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Helper function to check if user is admin or engineer
CREATE OR REPLACE FUNCTION public.is_admin_or_engineer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'engineer')
  );
$$;

-- RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. SECURE VISITOR/SESSION ANALYTICS TABLES
-- ============================================

-- user_sessions table
DO $$ BEGIN
    DROP POLICY IF EXISTS "System can insert sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "System can insert user sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "Admins can view all user sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "Admins and engineers can view sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "System can update own sessions" ON public.user_sessions;
    DROP POLICY IF EXISTS "Allow all user_sessions operations" ON public.user_sessions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert sessions"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and engineers can view sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (is_admin_or_engineer());

CREATE POLICY "System can update own sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- user_activities table
DO $$ BEGIN
    DROP POLICY IF EXISTS "System can insert activities" ON public.user_activities;
    DROP POLICY IF EXISTS "System can insert user activities" ON public.user_activities;
    DROP POLICY IF EXISTS "Admins can view all activities" ON public.user_activities;
    DROP POLICY IF EXISTS "Admins and engineers can view activities" ON public.user_activities;
    DROP POLICY IF EXISTS "Allow all user_activities operations" ON public.user_activities;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert activities"
ON public.user_activities
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and engineers can view activities"
ON public.user_activities
FOR SELECT
TO authenticated
USING (is_admin_or_engineer());

-- performance_metrics table
DO $$ BEGIN
    DROP POLICY IF EXISTS "System can insert metrics" ON public.performance_metrics;
    DROP POLICY IF EXISTS "System can insert performance metrics" ON public.performance_metrics;
    DROP POLICY IF EXISTS "Admins can view all metrics" ON public.performance_metrics;
    DROP POLICY IF EXISTS "Admins and engineers can view metrics" ON public.performance_metrics;
    DROP POLICY IF EXISTS "Allow all performance_metrics operations" ON public.performance_metrics;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert metrics"
ON public.performance_metrics
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and engineers can view metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (is_admin_or_engineer());

-- chat_sessions table
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all chat_sessions operations" ON public.chat_sessions;
    DROP POLICY IF EXISTS "System can manage chat sessions" ON public.chat_sessions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage chat sessions"
ON public.chat_sessions
FOR ALL
TO authenticated
USING (is_admin_or_engineer())
WITH CHECK (is_admin_or_engineer());

-- chat_rate_limit_analytics table
DO $$ BEGIN
    DROP POLICY IF EXISTS "System can insert analytics" ON public.chat_rate_limit_analytics;
    DROP POLICY IF EXISTS "System can insert rate limit analytics" ON public.chat_rate_limit_analytics;
    DROP POLICY IF EXISTS "Super admins can view analytics" ON public.chat_rate_limit_analytics;
    DROP POLICY IF EXISTS "Admins and engineers can view rate limit analytics" ON public.chat_rate_limit_analytics;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "System can insert rate limit analytics"
ON public.chat_rate_limit_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins and engineers can view rate limit analytics"
ON public.chat_rate_limit_analytics
FOR SELECT
TO authenticated
USING (is_admin_or_engineer());

-- 3. SECURE EQUIPMENT FAILURE PREDICTIONS
-- ============================================

-- predictive_alerts table
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all predictive_alerts operations" ON public.predictive_alerts;
    DROP POLICY IF EXISTS "Engineers and admins can view predictive alerts" ON public.predictive_alerts;
    DROP POLICY IF EXISTS "Engineers and admins can manage predictive alerts" ON public.predictive_alerts;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.predictive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers and admins can view predictive alerts"
ON public.predictive_alerts
FOR SELECT
TO authenticated
USING (
  is_admin_or_engineer() OR
  EXISTS (
    SELECT 1 FROM equipment e
    WHERE e.id = predictive_alerts.asset_id
    AND (e.company_id IS NULL OR is_member_of(e.company_id))
  )
);

CREATE POLICY "Engineers and admins can manage predictive alerts"
ON public.predictive_alerts
FOR ALL
TO authenticated
USING (is_admin_or_engineer())
WITH CHECK (is_admin_or_engineer());

-- automated_work_orders table
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all automated_work_orders operations" ON public.automated_work_orders;
    DROP POLICY IF EXISTS "Authenticated users can view work orders for their equipment" ON public.automated_work_orders;
    DROP POLICY IF EXISTS "Engineers and admins can manage work orders" ON public.automated_work_orders;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.automated_work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view work orders for their equipment"
ON public.automated_work_orders
FOR SELECT
TO authenticated
USING (
  is_admin_or_engineer() OR
  EXISTS (
    SELECT 1 FROM equipment e
    WHERE e.id = automated_work_orders.asset_id
    AND (e.company_id IS NULL OR is_member_of(e.company_id))
  )
);

CREATE POLICY "Engineers and admins can manage work orders"
ON public.automated_work_orders
FOR ALL
TO authenticated
USING (is_admin_or_engineer())
WITH CHECK (is_admin_or_engineer());

-- sensor_readings table
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all sensor_readings operations" ON public.sensor_readings;
    DROP POLICY IF EXISTS "Technicians can insert sensor readings" ON public.sensor_readings;
    DROP POLICY IF EXISTS "Authenticated users can view sensor readings for their equipment" ON public.sensor_readings;
    DROP POLICY IF EXISTS "Engineers and admins can manage sensor readings" ON public.sensor_readings;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can insert sensor readings"
ON public.sensor_readings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM equipment e
    WHERE e.id = sensor_readings.equipment_id
    AND (e.company_id IS NULL OR is_member_of(e.company_id))
  )
);

CREATE POLICY "Authenticated users can view sensor readings for their equipment"
ON public.sensor_readings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM equipment e
    WHERE e.id = sensor_readings.equipment_id
    AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
  )
);

CREATE POLICY "Engineers and admins can manage sensor readings"
ON public.sensor_readings
FOR ALL
TO authenticated
USING (is_admin_or_engineer())
WITH CHECK (is_admin_or_engineer());

-- ai_usage_tracking table
DO $$ BEGIN
    DROP POLICY IF EXISTS "System can insert AI usage records" ON public.ai_usage_tracking;
    DROP POLICY IF EXISTS "System can insert AI usage" ON public.ai_usage_tracking;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "System can insert AI usage"
ON public.ai_usage_tracking
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. SECURE GUEST REGISTRATION DATA
-- ============================================

-- hotel_registrations table
DO $$ BEGIN
    DROP POLICY IF EXISTS "Authenticated users can create hotel registrations" ON public.hotel_registrations;
    DROP POLICY IF EXISTS "Authenticated users can view hotel registrations" ON public.hotel_registrations;
    DROP POLICY IF EXISTS "Authenticated users can update hotel registrations" ON public.hotel_registrations;
    DROP POLICY IF EXISTS "Authenticated users can delete hotel registrations" ON public.hotel_registrations;
    DROP POLICY IF EXISTS "Admins can manage hotel registrations" ON public.hotel_registrations;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.hotel_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage hotel registrations"
ON public.hotel_registrations
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. SECURE EQUIPMENT ANALYSIS & MAINTENANCE DATA
-- ============================================

-- hvac_maintenance_checks
DO $$ BEGIN
    DROP POLICY IF EXISTS "hvac_maintenance_checks_admin" ON public.hvac_maintenance_checks;
    DROP POLICY IF EXISTS "hvac_maintenance_checks_company_access" ON public.hvac_maintenance_checks;
    DROP POLICY IF EXISTS "hvac_maintenance_checks_own_rows" ON public.hvac_maintenance_checks;
    DROP POLICY IF EXISTS "Technicians can view maintenance checks for their company" ON public.hvac_maintenance_checks;
    DROP POLICY IF EXISTS "Technicians can insert maintenance checks for their company" ON public.hvac_maintenance_checks;
    DROP POLICY IF EXISTS "Admins and engineers can manage all maintenance checks" ON public.hvac_maintenance_checks;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.hvac_maintenance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view maintenance checks for their company"
ON public.hvac_maintenance_checks
FOR SELECT
TO authenticated
USING (
  is_admin_or_engineer() OR
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Technicians can insert maintenance checks for their company"
ON public.hvac_maintenance_checks
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin_or_engineer() OR
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Admins and engineers can manage all maintenance checks"
ON public.hvac_maintenance_checks
FOR ALL
TO authenticated
USING (is_admin_or_engineer())
WITH CHECK (is_admin_or_engineer());

-- hvac_diagnostic_sessions
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can access diagnostic sessions for their equipment" ON public.hvac_diagnostic_sessions;
    DROP POLICY IF EXISTS "Engineers and admins can manage diagnostic sessions" ON public.hvac_diagnostic_sessions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.hvac_diagnostic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers and admins can manage diagnostic sessions"
ON public.hvac_diagnostic_sessions
FOR ALL
TO authenticated
USING (is_admin_or_engineer())
WITH CHECK (is_admin_or_engineer());

-- maintenance_documents
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can access maintenance documents for their company" ON public.maintenance_documents;
    DROP POLICY IF EXISTS "Technicians can view maintenance documents for their company" ON public.maintenance_documents;
    DROP POLICY IF EXISTS "Engineers and admins can manage maintenance documents" ON public.maintenance_documents;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.maintenance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can view maintenance documents for their company"
ON public.maintenance_documents
FOR SELECT
TO authenticated
USING (
  is_admin_or_engineer() OR
  (company_id IS NOT NULL AND is_member_of(company_id))
);

CREATE POLICY "Engineers and admins can manage maintenance documents"
ON public.maintenance_documents
FOR ALL
TO authenticated
USING (is_admin_or_engineer())
WITH CHECK (is_admin_or_engineer());

-- 6. FIX FUNCTION SEARCH_PATH ISSUES
-- ============================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email = 'edward@shogunaillc.com'
  FROM auth.users
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_users
    WHERE user_id = (auth.uid())::text
      AND is_admin = true
  ) OR public.is_super_admin();
$$;

CREATE OR REPLACE FUNCTION public.is_member_of(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.company_users cu
    WHERE cu.company_id = is_member_of.company_id 
    AND (
      cu.user_id = (auth.uid())::text OR
      cu.user_id = (
        SELECT email 
        FROM auth.users 
        WHERE id = auth.uid()
        LIMIT 1
      )
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_all_data()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin();
$$;

-- 7. STORAGE BUCKET SECURITY
-- ============================================

-- Update hotel-documents bucket to be private
UPDATE storage.buckets
SET public = false
WHERE id = 'hotel-documents';

-- Update hotel-signatures bucket to be private
UPDATE storage.buckets
SET public = false
WHERE id = 'hotel-signatures';

-- Storage policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage hotel documents" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can manage hotel signatures" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Admins can manage hotel documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'hotel-documents' AND
  has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'hotel-documents' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage hotel signatures"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'hotel-signatures' AND
  has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'hotel-signatures' AND
  has_role(auth.uid(), 'admin')
);

-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.user_roles IS 'Stores user role assignments. Roles: admin, engineer, technician, user';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check if user has specific role - prevents RLS recursion';
COMMENT ON FUNCTION public.is_admin_or_engineer IS 'Helper function to check if user is admin or engineer';