

# Set Initial Maintenance Dates for Equipment Without Records

## What This Does
Sets `lastMaintenance` for all 18 equipment rows that currently have `NULL`, using two different dates based on equipment type:
- **Chillers**: January 23, 2026
- **All other equipment**: February 6, 2023

The existing `update_equipment_maintenance_schedule` trigger will automatically calculate `nextMaintenance` (3 months later) for each row.

## SQL to Execute

Two UPDATE statements using the Supabase data tool:

```sql
-- Chillers: Jan 23, 2026
UPDATE equipment
SET "lastMaintenance" = '2026-01-23'
WHERE "lastMaintenance" IS NULL
  AND lower(name) LIKE '%chiller%';

-- Everything else: Feb 6, 2023
UPDATE equipment
SET "lastMaintenance" = '2023-02-06'
WHERE "lastMaintenance" IS NULL;
```

## Expected Result
- ~7 chiller rows get `lastMaintenance = 2026-01-23` and `nextMaintenance = 2026-04-23`
- ~11 remaining rows get `lastMaintenance = 2023-02-06` and `nextMaintenance = 2023-05-06`
- No frontend changes needed -- the UI already reads these fields

