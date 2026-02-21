

# Create `calculate_chiller_health_scores()` Function

## Overview
A Postgres function that iterates over all chiller equipment, computes a health score from multiple data sources, and upserts results into `asset_health`.

## Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.calculate_chiller_health_scores()
RETURNS integer
LANGUAGE plpgsql
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
    -- AGE
    IF rec.installation_date IS NOT NULL THEN
      v_age := EXTRACT(EPOCH FROM (now() - rec.installation_date::timestamp)) / (365.25 * 86400);
    ELSE
      v_age := 15;
    END IF;

    -- OPEN WORK ORDERS
    SELECT count(*) INTO v_open_wo
    FROM public.automated_work_orders
    WHERE asset_id = rec.id
      AND status NOT IN ('completed', 'closed');

    -- CORRECTIVE WORK ORDERS (12 months)
    SELECT count(*) INTO v_corrective_wo
    FROM public.automated_work_orders
    WHERE asset_id = rec.id
      AND created_at >= now() - interval '12 months';

    -- PM COMPLIANCE
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

    -- PENALTIES
    v_age_penalty := LEAST((v_age / COALESCE(rec.expected_life_years, 25)) * 40, 40);
    
    IF rec.condition_rating IS NULL THEN
      v_cond_penalty := 10;
    ELSE
      v_cond_penalty := LEAST((rec.condition_rating - 1) * 6.25, 25);
    END IF;

    v_wo_penalty   := LEAST(v_open_wo * 4, 20);
    v_corr_penalty := LEAST(v_corrective_wo * 5, 15);
    v_pm_penalty   := LEAST((100 - v_pm_pct) * 0.15, 15);

    -- HEALTH SCORE (clamped 0-100)
    v_score := GREATEST(0, LEAST(100,
      100 - v_age_penalty - v_cond_penalty - v_wo_penalty - v_corr_penalty - v_pm_penalty
    ));

    -- RISK LEVEL
    IF v_score < 40 THEN v_risk := 'critical';
    ELSIF v_score < 60 THEN v_risk := 'high';
    ELSIF v_score < 85 THEN v_risk := 'medium';
    ELSE v_risk := 'low';
    END IF;

    -- UPSERT
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
```

## How It Works

1. Iterates over all equipment rows where `is_chiller_asset()` returns TRUE
2. For each chiller, computes:
   - **Age** from `installation_date` (defaults to 15 if null)
   - **Open WO count** from `automated_work_orders` (status not completed/closed)
   - **Corrective WO count** from `automated_work_orders` (last 12 months)
   - **PM compliance %** from `hvac_maintenance_checks` (completed / total; 100% if no checks)
3. Applies five penalty deductions from a base score of 100 (each capped)
4. Clamps final score to 0-100 and assigns risk level
5. Upserts into `asset_health` using the UNIQUE constraint on `equipment_id`
6. Returns the number of chillers processed

## Penalty Summary

| Penalty | Formula | Max |
|---------|---------|-----|
| Age | `(age_years / expected_life_years) * 40` | 40 |
| Condition | null -> 10; else `(rating - 1) * 6.25` | 25 |
| Open WO | `count * 4` | 20 |
| Corrective WO | `count * 5` | 15 |
| PM | `(100 - pct) * 0.15` | 15 |

## Notes
- No tables are created or modified -- function only
- Uses existing `is_chiller_asset()` helper
- Upserts leverage the UNIQUE constraint on `asset_health.equipment_id`
- `expected_life_years` defaults to 25 via `COALESCE` if null

