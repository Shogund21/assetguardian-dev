# Chiller Health V1 Report

## 1) Existing data fields found

### Asset storage (`equipment`)
- Existing fields: `id`, `name`, `model`, `serialNumber`, `location`, `lastMaintenance`, `nextMaintenance`, `status`, `company_id`.
- New fields added for V1 health: `asset_type`, `category`, `tags`, `installation_date`.

### Chiller identification
A record is considered a chiller when **any** condition is true:
- `asset_type = 'chiller'`
- `category = 'chiller'`
- `tags` contains `'chiller'`
- `name` contains `'chiller'` (fallback)
- `model` contains `'chiller'` (fallback)

### Work order tables
- Existing: `automated_work_orders` (AI-originated only).
- New canonical table: `work_orders` with fields for `work_order_type`, status lifecycle, dates, and priority.

### PM tables
- Existing PM source: `hvac_maintenance_checks`.
- PM compliance metric uses checks from the last 12 months:
  - numerator: `status = 'completed'`
  - denominator: all checks in the period.

## 2) Missing fields discovered (before V1)
- No explicit chiller classifier in `equipment` (type/category/tags).
- No installation date for reliable age calculations.
- No canonical work-order table with corrective/preventive typing.
- No persisted health-score table for trendable snapshots.

## 3) Example output query (top 5 highest-risk chillers)

```sql
SELECT *
FROM chiller_health_ranking
ORDER BY health_score ASC
LIMIT 5;
```

Example shape:

| rank | asset_id | name | location | age_years | pm_compliance_pct | open_work_orders | corrective_wo_last_12m | health_score | risk_band |
|---:|---|---|---|---:|---:|---:|---:|---:|---|
| 1 | chiller-014 | Chiller West Roof | Store 102 | 18.4 | 42.9 | 6 | 5 | 31 | critical |
| 2 | chiller-009 | Chiller South Plant | Store 077 | 15.1 | 55.0 | 5 | 4 | 44 | high |
| 3 | chiller-021 | Chiller North Loop | Store 033 | 13.7 | 61.5 | 4 | 3 | 52 | high |
| 4 | chiller-005 | Chiller East Wing | Store 050 | 11.3 | 72.0 | 3 | 3 | 63 | medium |
| 5 | chiller-002 | Chiller Main | Store 011 | 10.8 | 75.0 | 2 | 2 | 70 | medium |

> Note: exact rows depend on production data and refresh cadence of `calculate_chiller_health_scores()`.
