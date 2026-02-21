

# Auto-Sync `lastMaintenance` from Completed Maintenance Checks

## Summary
Create a database trigger so that whenever a maintenance check is inserted or updated with `status = 'completed'`, the corresponding equipment row's `lastMaintenance` (and consequently `nextMaintenance`) is automatically updated. Also run a one-time backfill for all existing data.

## What Changes

### 1. Database trigger function (new)
A new Postgres function `sync_equipment_last_maintenance()` that fires AFTER INSERT or UPDATE on `hvac_maintenance_checks`. When the check's status is `'completed'`, it looks up the most recent completed check_date for that equipment and updates `equipment."lastMaintenance"` accordingly. The existing `update_equipment_maintenance_schedule` trigger on the equipment table will then automatically set `nextMaintenance` to 3 months later.

### 2. Backfill existing data (one-time)
In the same migration, run an UPDATE to set `lastMaintenance` for all equipment that currently has NULL but has completed maintenance checks:

```text
UPDATE equipment e
SET "lastMaintenance" = sub.latest
FROM (
  SELECT equipment_id, MAX(check_date) as latest
  FROM hvac_maintenance_checks
  WHERE status = 'completed'
  GROUP BY equipment_id
) sub
WHERE e.id = sub.equipment_id;
```

This will populate ~15-20 equipment rows that currently show "No record."

### 3. No frontend code changes
The UI already reads `lastMaintenance` from the equipment table -- once the data is populated and kept in sync, the display will fix itself automatically.

## Technical Details

**Migration SQL** (single migration file):

1. Create function `sync_equipment_last_maintenance()`:
   - Triggered AFTER INSERT OR UPDATE on `hvac_maintenance_checks`
   - Only acts when `NEW.status = 'completed'`
   - Queries `MAX(check_date)` from completed checks for that equipment_id
   - Updates `equipment."lastMaintenance"` with the result

2. Create trigger `trg_sync_last_maintenance` on `hvac_maintenance_checks` table

3. Backfill UPDATE for all existing equipment with completed checks

## Expected Result
- AHU 3 (the one you're viewing) will show `2026-01-06` as last maintenance instead of "No record"
- All other equipment with completed checks will also be populated
- Future completed checks will automatically keep the field in sync

