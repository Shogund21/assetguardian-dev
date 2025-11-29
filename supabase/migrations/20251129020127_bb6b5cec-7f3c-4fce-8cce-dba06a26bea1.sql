-- Create a secure function to insert predictive alerts
-- This bypasses RLS while ensuring users can only create alerts for equipment they have access to
CREATE OR REPLACE FUNCTION public.create_predictive_alert_secure(
  p_asset_id uuid,
  p_risk_level text,
  p_finding text,
  p_recommendation text,
  p_confidence_score numeric DEFAULT NULL,
  p_resolved_at timestamp with time zone DEFAULT NULL,
  p_work_order_id uuid DEFAULT NULL,
  p_data_quality jsonb DEFAULT NULL,
  p_predictive_timeline jsonb DEFAULT NULL,
  p_degradation_analysis jsonb DEFAULT NULL,
  p_maintenance_windows jsonb DEFAULT NULL,
  p_performance_trends jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_equipment_company_id uuid;
  v_new_alert_id uuid;
  v_result jsonb;
BEGIN
  -- Get the equipment's company_id
  SELECT company_id INTO v_equipment_company_id
  FROM public.equipment
  WHERE id = p_asset_id;
  
  -- Check if equipment exists
  IF v_equipment_company_id IS NULL AND NOT EXISTS (SELECT 1 FROM public.equipment WHERE id = p_asset_id) THEN
    RAISE EXCEPTION 'Equipment not found';
  END IF;
  
  -- Verify user has access to this equipment
  IF NOT (
    can_access_all_data() OR 
    v_equipment_company_id IS NULL OR 
    is_member_of(v_equipment_company_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not have permission to create alerts for this equipment';
  END IF;
  
  -- Insert the alert with elevated privileges
  INSERT INTO public.predictive_alerts (
    asset_id,
    risk_level,
    finding,
    recommendation,
    confidence_score,
    resolved_at,
    work_order_id,
    data_quality,
    predictive_timeline,
    degradation_analysis,
    maintenance_windows,
    performance_trends
  ) VALUES (
    p_asset_id,
    p_risk_level,
    p_finding,
    p_recommendation,
    p_confidence_score,
    p_resolved_at,
    p_work_order_id,
    p_data_quality,
    p_predictive_timeline,
    p_degradation_analysis,
    p_maintenance_windows,
    p_performance_trends
  )
  RETURNING id INTO v_new_alert_id;
  
  -- Fetch and return the complete alert data
  SELECT jsonb_build_object(
    'id', id,
    'asset_id', asset_id,
    'risk_level', risk_level,
    'finding', finding,
    'recommendation', recommendation,
    'confidence_score', confidence_score,
    'created_at', created_at,
    'resolved_at', resolved_at,
    'work_order_id', work_order_id,
    'data_quality', data_quality,
    'predictive_timeline', predictive_timeline,
    'degradation_analysis', degradation_analysis,
    'maintenance_windows', maintenance_windows,
    'performance_trends', performance_trends
  ) INTO v_result
  FROM public.predictive_alerts
  WHERE id = v_new_alert_id;
  
  RETURN v_result;
END;
$$;