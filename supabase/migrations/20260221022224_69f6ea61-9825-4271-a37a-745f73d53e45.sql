CREATE OR REPLACE FUNCTION public.calculate_chiller_health_scores()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec record;
  v_age numeric;
  v_open_wo int;
  v_corrective_wo int;
  v_total_checks int;
  v_completed_checks int;
  v_pm_pct numeric;
  v_age_penalty numeric;
  v_cond_penalty numeric;
  v_wo_penalty numeric;
  v_corr_penalty numeric;
  v_pm_penalty numeric;
  v_score numeric;
  v_risk text;
  v_count int := 0;
BEGIN
  FOR rec IN
    SELECT e.*
    FROM public.equipment e
    WHERE public.is_chiller_asset(e)
  LOOP
    IF rec.installation_date IS NOT NULL THEN
      v_age := EXTRACT(EPOCH FROM (now() - rec.installation_date::timestamp)) / (365.25 * 86400);
    ELSE
      v_age := 15;
    END IF;

    SELECT count(*) INTO v_open_wo
    FROM public.automated_work_orders
    WHERE asset_id = rec.id
      AND status NOT IN ('completed', 'closed');

    SELECT count(*) INTO v_corrective_wo
    FROM public.automated_work_orders
    WHERE asset_id = rec.id
      AND created_at >= now() - interval '12 months';

    SELECT count(*),
           count(*) FILTER (WHERE status = 'completed')
    INTO v_total_checks, v_completed_checks
    FROM public.hvac_maintenance_checks
    WHERE equipment_id = rec.id;

    IF v_total_checks > 0 THEN
      v_pm_pct := (v_completed_checks::numeric / v_total_checks) * 100;
    ELSE
      v_pm_pct := 100;
    END IF;

    v_age_penalty := LEAST((v_age / COALESCE(rec.expected_life_years, 25)) * 40, 40);
    
    IF rec.condition_rating IS NULL THEN
      v_cond_penalty := 10;
    ELSE
      v_cond_penalty := LEAST((rec.condition_rating - 1) * 6.25, 25);
    END IF;

    v_wo_penalty   := LEAST(v_open_wo * 4, 20);
    v_corr_penalty := LEAST(v_corrective_wo * 5, 15);
    v_pm_penalty   := LEAST((100 - v_pm_pct) * 0.15, 15);

    v_score := GREATEST(0, LEAST(100,
      100 - v_age_penalty - v_cond_penalty - v_wo_penalty - v_corr_penalty - v_pm_penalty
    ));

    IF v_score < 40 THEN v_risk := 'critical';
    ELSIF v_score < 60 THEN v_risk := 'high';
    ELSIF v_score < 85 THEN v_risk := 'medium';
    ELSE v_risk := 'low';
    END IF;

    INSERT INTO public.asset_health (
      equipment_id, health_score, risk_level,
      age_years, pm_compliance_pct,
      open_wo_count, corrective_wo_12m_count,
      calculated_at
    ) VALUES (
      rec.id, v_score::int, v_risk,
      round(v_age, 2), round(v_pm_pct, 2),
      v_open_wo, v_corrective_wo,
      now()
    )
    ON CONFLICT (equipment_id) DO UPDATE SET
      health_score = EXCLUDED.health_score,
      risk_level = EXCLUDED.risk_level,
      age_years = EXCLUDED.age_years,
      pm_compliance_pct = EXCLUDED.pm_compliance_pct,
      open_wo_count = EXCLUDED.open_wo_count,
      corrective_wo_12m_count = EXCLUDED.corrective_wo_12m_count,
      calculated_at = EXCLUDED.calculated_at;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;