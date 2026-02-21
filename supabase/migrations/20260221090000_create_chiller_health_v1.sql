-- V1 chiller health schema and scoring

-- Extend equipment so chillers can be identified explicitly and aged reliably.
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS asset_type TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS installation_date DATE;

CREATE INDEX IF NOT EXISTS idx_equipment_asset_type ON equipment(asset_type);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_tags_gin ON equipment USING GIN(tags);

COMMENT ON COLUMN equipment.asset_type IS 'Primary asset type (e.g. chiller, pump, ahu)';
COMMENT ON COLUMN equipment.category IS 'Optional business category for grouping assets';
COMMENT ON COLUMN equipment.tags IS 'Flexible labels used for search and asset classification';
COMMENT ON COLUMN equipment.installation_date IS 'Original installation date used for lifecycle analytics';

-- Canonical work-order table used for corrective/open counts and future workflows.
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  company_id UUID NULL REFERENCES companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  work_order_type TEXT NOT NULL CHECK (work_order_type IN ('corrective', 'preventive', 'predictive', 'inspection')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_type ON work_orders(work_order_type);
CREATE INDEX IF NOT EXISTS idx_work_orders_opened_at ON work_orders(opened_at DESC);

CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Backfill existing automated work orders.
INSERT INTO work_orders (asset_id, title, description, work_order_type, status, priority, opened_at, due_at, completed_at, source)
SELECT
  aw.asset_id,
  aw.title,
  aw.description,
  'predictive'::TEXT,
  CASE aw.status
    WHEN 'pending' THEN 'open'
    WHEN 'assigned' THEN 'assigned'
    WHEN 'in_progress' THEN 'in_progress'
    WHEN 'completed' THEN 'completed'
    WHEN 'cancelled' THEN 'cancelled'
    ELSE 'open'
  END,
  aw.priority,
  aw.created_at,
  aw.created_at + (aw.due_hours || ' hours')::INTERVAL,
  aw.completed_at,
  'automated_work_orders'
FROM automated_work_orders aw
WHERE NOT EXISTS (
  SELECT 1
  FROM work_orders wo
  WHERE wo.asset_id = aw.asset_id
    AND wo.title = aw.title
    AND wo.opened_at = aw.created_at
);

-- Persisted health snapshots per asset.
CREATE TABLE IF NOT EXISTS asset_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  location TEXT,
  age_years NUMERIC(6,2),
  pm_compliance_pct NUMERIC(5,2),
  open_work_orders INTEGER NOT NULL DEFAULT 0,
  corrective_wo_last_12m INTEGER NOT NULL DEFAULT 0,
  health_score INTEGER NOT NULL CHECK (health_score BETWEEN 0 AND 100),
  risk_band TEXT NOT NULL CHECK (risk_band IN ('low', 'medium', 'high', 'critical')),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(asset_id)
);

CREATE INDEX IF NOT EXISTS idx_asset_health_risk ON asset_health(risk_band, health_score);
CREATE INDEX IF NOT EXISTS idx_asset_health_location ON asset_health(location);

COMMENT ON TABLE asset_health IS 'V1 chiller health scoring snapshots. 1 row per asset_id, overwritten on recalculation.';

CREATE OR REPLACE FUNCTION is_chiller_asset(e equipment)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT
    COALESCE(LOWER(e.asset_type) = 'chiller', FALSE)
    OR COALESCE(LOWER(e.category) = 'chiller', FALSE)
    OR EXISTS (
      SELECT 1
      FROM unnest(COALESCE(e.tags, ARRAY[]::TEXT[])) t
      WHERE LOWER(t) = 'chiller'
    )
    OR LOWER(COALESCE(e.name, '')) LIKE '%chiller%'
    OR LOWER(COALESCE(e.model, '')) LIKE '%chiller%';
$$;

CREATE OR REPLACE FUNCTION calculate_chiller_health_scores()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  WITH chiller_assets AS (
    SELECT e.*
    FROM equipment e
    WHERE is_chiller_asset(e)
  ),
  pm_stats AS (
    SELECT
      h.equipment_id AS asset_id,
      COUNT(*) FILTER (WHERE h.check_date >= NOW() - INTERVAL '12 months')::NUMERIC AS total_checks,
      COUNT(*) FILTER (
        WHERE h.check_date >= NOW() - INTERVAL '12 months'
          AND h.status = 'completed'
      )::NUMERIC AS completed_checks
    FROM hvac_maintenance_checks h
    WHERE h.equipment_id IS NOT NULL
    GROUP BY h.equipment_id
  ),
  wo_stats AS (
    SELECT
      w.asset_id,
      COUNT(*) FILTER (WHERE w.status IN ('open', 'assigned', 'in_progress')) AS open_work_orders,
      COUNT(*) FILTER (
        WHERE w.work_order_type = 'corrective'
          AND w.opened_at >= NOW() - INTERVAL '12 months'
      ) AS corrective_wo_last_12m
    FROM work_orders w
    GROUP BY w.asset_id
  ),
  computed AS (
    SELECT
      c.id AS asset_id,
      c.location,
      CASE
        WHEN c.installation_date IS NULL THEN NULL
        ELSE ROUND((EXTRACT(EPOCH FROM (NOW()::DATE - c.installation_date)) / 31557600)::NUMERIC, 2)
      END AS age_years,
      CASE
        WHEN COALESCE(pm.total_checks, 0) = 0 THEN 0
        ELSE ROUND((pm.completed_checks / pm.total_checks) * 100, 2)
      END AS pm_compliance_pct,
      COALESCE(wo.open_work_orders, 0) AS open_work_orders,
      COALESCE(wo.corrective_wo_last_12m, 0) AS corrective_wo_last_12m
    FROM chiller_assets c
    LEFT JOIN pm_stats pm ON pm.asset_id = c.id
    LEFT JOIN wo_stats wo ON wo.asset_id = c.id
  ),
  scored AS (
    SELECT
      asset_id,
      location,
      age_years,
      pm_compliance_pct,
      open_work_orders,
      corrective_wo_last_12m,
      GREATEST(0, LEAST(100,
        ROUND(
          100
          - LEAST(40, COALESCE(age_years, 0) * 2.5)
          - LEAST(30, (100 - pm_compliance_pct) * 0.3)
          - LEAST(20, open_work_orders * 4)
          - LEAST(10, corrective_wo_last_12m * 2)
        )
      ))::INTEGER AS health_score
    FROM computed
  )
  INSERT INTO asset_health (
    asset_id,
    location,
    age_years,
    pm_compliance_pct,
    open_work_orders,
    corrective_wo_last_12m,
    health_score,
    risk_band,
    calculated_at
  )
  SELECT
    s.asset_id,
    s.location,
    s.age_years,
    s.pm_compliance_pct,
    s.open_work_orders,
    s.corrective_wo_last_12m,
    s.health_score,
    CASE
      WHEN s.health_score < 40 THEN 'critical'
      WHEN s.health_score < 60 THEN 'high'
      WHEN s.health_score < 80 THEN 'medium'
      ELSE 'low'
    END AS risk_band,
    NOW()
  FROM scored s
  ON CONFLICT (asset_id)
  DO UPDATE SET
    location = EXCLUDED.location,
    age_years = EXCLUDED.age_years,
    pm_compliance_pct = EXCLUDED.pm_compliance_pct,
    open_work_orders = EXCLUDED.open_work_orders,
    corrective_wo_last_12m = EXCLUDED.corrective_wo_last_12m,
    health_score = EXCLUDED.health_score,
    risk_band = EXCLUDED.risk_band,
    calculated_at = EXCLUDED.calculated_at,
    created_at = NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE VIEW chiller_health_ranking AS
SELECT
  ah.asset_id,
  e.name,
  e.model,
  e.location,
  ah.age_years,
  ah.pm_compliance_pct,
  ah.open_work_orders,
  ah.corrective_wo_last_12m,
  ah.health_score,
  ah.risk_band,
  ah.calculated_at
FROM asset_health ah
JOIN equipment e ON e.id = ah.asset_id
ORDER BY ah.health_score ASC, ah.corrective_wo_last_12m DESC, ah.open_work_orders DESC;

-- Run initial score calculation for currently available chillers.
SELECT calculate_chiller_health_scores();
